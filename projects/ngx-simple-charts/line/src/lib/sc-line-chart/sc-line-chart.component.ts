/**
   Copyright 2021 Sven Loesekann
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
	   http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */
import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  AfterViewInit,
  HostListener,
  OnDestroy,
  Output,
} from '@angular/core';
import { select, Selection, ContainerElement } from 'd3-selection';
import { scaleLinear, scaleTime, ScaleLinear, ScaleTime } from 'd3-scale';
import { easeLinear } from 'd3-ease';
import { extent } from 'd3-array';
import { line, curveMonotoneX, Line } from 'd3-shape';
import { axisBottom, axisLeft, AxisScale } from 'd3-axis';
import { ChartPoints, ChartPoint } from './model/chart-points';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import 'd3-transition';
import { Transition } from 'd3-transition';
import { interpolateNumber } from 'd3-interpolate';

interface ResizeEvent {
  type: string;
}

interface MultiLineSeries {
  name: string;
  values: number[];
}

@Component({
  selector: 'sc-line-chart',
  templateUrl: './sc-line-chart.component.html',
  styleUrls: ['./sc-line-chart.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ScLineChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('svgchart', { static: true })
  private chartContainer!: ElementRef;
  d3Svg!: Selection<ContainerElement, ChartPoint, HTMLElement, any>;
  @Input()
  chartPoints: ChartPoints[] = [];
  @Input()
  replaceName!: string;
  @Input()
  replaceSymbol!: string;
  private chartUpdateSubject = new Subject();
  private chartUpdateSubscription!: Subscription;
  private gxAttribute!: Selection<SVGGElement, ChartPoint, HTMLElement, any>;
  private gyAttribute!: Selection<SVGGElement, ChartPoint, HTMLElement, any>;
  private gPathAttribute!: Selection<SVGGElement, ChartPoint, HTMLElement, any>;
  private gLegendAttribute!: Selection<
    SVGGElement,
    ChartPoint,
    HTMLElement,
    any
  >;

  ngAfterViewInit(): void {
    this.d3Svg = select<ContainerElement, ChartPoint>(
      this.chartContainer.nativeElement
    );

    this.gxAttribute = this.d3Svg.append('g');
    this.gxAttribute = this.gxAttribute.attr('class', 'x axis');
    this.gyAttribute = this.d3Svg.append('g');
    this.gyAttribute = this.gyAttribute.attr('class', 'y axis');
    this.gPathAttribute = this.d3Svg.append('g');
    this.gLegendAttribute = this.d3Svg.append('g');

    this.chartUpdateSubscription = this.chartUpdateSubject
      .pipe(debounceTime(100))
      .subscribe(() => this.updateChart());
    this.chartUpdateSubject.next({});
  }

  ngOnDestroy(): void {
    this.chartUpdateSubject.complete();
    this.chartUpdateSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes['chartPoints'] && !changes['chartPoints'].isFirstChange()) {
      this.chartUpdateSubject.next({});
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: ResizeEvent): void {
    event && this.chartUpdateSubject.next({});
  }

  private updateChart(): void {
    const contentWidth = isNaN(
      parseInt(this.d3Svg.style('width').replace(/[^0-9\.]+/g, ''), 10)
    )
      ? 0
      : parseInt(this.d3Svg.style('width').replace(/[^0-9\.]+/g, ''), 10);
    const contentHeight = isNaN(
      parseInt(this.d3Svg.style('height').replace(/[^0-9\.]+/g, ''), 10)
    )
      ? 0
      : parseInt(this.d3Svg.style('height').replace(/[^0-9\.]+/g, ''), 10);
    this.d3Svg.attr('viewBox', [0, 0, contentWidth, contentHeight] as any);
    if (
      contentHeight < 1 ||
      contentWidth < 1 ||
      !this.chartPoints ||
      this.chartPoints.length === 0 ||
      !this.chartPoints[0].chartPointList ||
      this.chartPoints[0].chartPointList.length === 0
    ) {
      console.log(
        `contentHeight: ${contentHeight} contentWidth: ${contentWidth} chartPoints: ${this.chartPoints.length}`
      );
      return;
    }
    //console.log(`chartPoints: ${this.chartPoints.length} chartPointList: ${this.chartPoints[0].chartPointList.length}`);

    if (this.chartPoints.length < 2) {
      this.updateSingleLine(contentHeight, contentWidth);
    } else {
      this.updateMultiLine(contentHeight, contentWidth);
    }
  }

  private updateMultiLine(contentHeight: number, contentWidth: number): void {
    const xScaleValues = new Set(
      ...this.chartPoints.map((myChartPoint) =>
        myChartPoint.chartPointList.map(
          (myChartPointElement) => myChartPointElement.x
        )
      )
    );
    let xScale:
      | ScaleTime<number, number, never>
      | ScaleLinear<number, number, never>;
    if (this.chartPoints[0].chartPointList[0].x instanceof Date) {
      xScale = scaleTime()
        .domain(
          extent(Array.from(xScaleValues), (p) => p as Date) as [Date, Date]
        )
        .range([0, contentWidth - this.chartPoints[0].yScaleWidth]);
    } else {
      xScale = scaleLinear()
        .domain([0, this.chartPoints[0].chartPointList.length - 1])
        .nice()
        .range([0, contentWidth - this.chartPoints[0].yScaleWidth]);
    }

    //console.log(xScale);
    const yScaleValues = this.chartPoints
      .map((myChartPoints) => myChartPoints.chartPointList)
      .reduce((prevVal, newVal) => {
        prevVal.push(...newVal);
        return prevVal;
      }, []);
    const yScale = scaleLinear()
      .domain(
        extent<ChartPoint, number>(yScaleValues, (p) => p.y) as [number, number]
      )
      .nice()
      .range([contentHeight - this.chartPoints[0].xScaleHeight, 0]);

    //console.log(yScale);
    this.d3Svg.selectAll('path').remove();
    const myD3Svg = this.gPathAttribute
      .selectAll('path')
      .data(this.chartPoints)
      .join('path')
      .attr(
        'transform',
        'translate(' + this.chartPoints[0].yScaleWidth + ', 0)'
      )
      .style('mix-blend-mode', 'multiply')
      .attr(
        'class',
        (d) => 'line line-' + d.name.split(/[^a-zA-Z0-9\-]/)[0].toLowerCase()
      )
      .datum((d) => d.chartPointList);
    // .attr('d', this.createLine(xScale, yScale) as any);

    this.updateScales(contentHeight, xScale, yScale);
    this.updateLegend();

    console.log(this.chartPoints[0].chartPointList.length);

    myD3Svg
      .attr('d', this.createLine(xScale, yScale) as any)
      .attr(
        'stroke-dasharray',
        (contentWidth - this.chartPoints[0].yScaleWidth) * 100 +
          ' ' +
          (contentWidth - this.chartPoints[0].yScaleWidth) * 100
      )
      .attr(
        'stroke-dashoffset',
        (contentWidth - this.chartPoints[0].yScaleWidth) * 100
      )
      .transition()
      .duration(5000)
      .ease(easeLinear)
      .attr('stroke-dashoffset', 0);
    // myD3Svg.call(this.myTransition as any);
  }

  private updateLegend(): void {
    this.gLegendAttribute.selectAll('text').remove();
    const mySymbols = this.chartPoints.map((myChartPoint) => {
      if (
        !!this.replaceName &&
        !!this.replaceSymbol &&
        myChartPoint.name.includes(this.replaceSymbol)
      ) {
        myChartPoint.name = this.replaceName;
      }
      return myChartPoint;
    });
    if (mySymbols.length > 0) {
      this.gLegendAttribute
        .selectAll('legend')
        .data(mySymbols)
        .enter()
        .append('text')
        .attr('x', mySymbols[0].yScaleWidth + 20)
        .attr('y', (d, i) => 20 + 20 * i)
        .text((d) => d.name)
        .attr(
          'class',
          (d) => 'line line-' + d.name.split(/[^a-zA-Z0-9\-]/)[0].toLowerCase()
        )
        .attr('text-anchor', 'left')
        .attr('style', 'stroke-width: 1px !important');
    }
  }

  private updateScales(
    contentHeight: number,
    xScale:
      | ScaleTime<number, number, never>
      | ScaleLinear<number, number, never>,
    yScale: ScaleLinear<number, number, never>
  ): void {
    this.gxAttribute
      .attr(
        'transform',
        'translate(' +
          this.chartPoints[0].yScaleWidth +
          ',' +
          (contentHeight - this.chartPoints[0].xScaleHeight) +
          ')'
      )
      .call(
        axisBottom(xScale as unknown as AxisScale<number>) as (
          selection: Selection<SVGGElement, ChartPoint, HTMLElement, any>,
          ...args: any[]
        ) => void
      );

    this.gyAttribute
      .attr(
        'transform',
        'translate(' + this.chartPoints[0].yScaleWidth + ',' + 0 + ')'
      )
      .call(
        axisLeft(yScale as unknown as AxisScale<number>) as (
          selection: Selection<SVGGElement, ChartPoint, HTMLElement, any>,
          ...args: any[]
        ) => void
      );
  }

  private updateSingleLine(contentHeight: number, contentWidth: number): void {
    let xScale:
      | ScaleTime<number, number, never>
      | ScaleLinear<number, number, never>;
    if (this.chartPoints[0].chartPointList[0].x instanceof Date) {
      xScale = scaleTime()
        .domain(
          extent(this.chartPoints[0].chartPointList, (p) => p.x as Date) as [
            Date,
            Date
          ]
        )
        .range([0, contentWidth - this.chartPoints[0].yScaleWidth]);
    } else {
      xScale = scaleLinear()
        .domain([0, this.chartPoints[0].chartPointList.length - 1])
        .nice()
        .range([0, contentWidth - this.chartPoints[0].yScaleWidth]);
    }

    //console.log(xScale);

    const yScale = scaleLinear()
      .domain(
        extent<ChartPoint, number>(
          this.chartPoints[0].chartPointList,
          (p) => p.y
        ) as [number, number]
      )
      .nice()
      .range([contentHeight - this.chartPoints[0].xScaleHeight, 0]);

    this.d3Svg.selectAll('path').remove();
    const mySvgPipe = this.d3Svg
      .append('path')
      .datum(this.chartPoints[0].chartPointList)
      .attr(
        'transform',
        'translate(' + this.chartPoints[0].yScaleWidth + ', 0)'
      )
      .attr('class', 'line');
    //.attr('d', this.createLine(xScale, yScale) as any);

    this.updateScales(contentHeight, xScale, yScale);
    this.updateLegend();

    mySvgPipe
      .attr('d', this.createLine(xScale, yScale) as any)
      .attr(
        'stroke-dasharray',
        (contentWidth - this.chartPoints[0].yScaleWidth) * 100 +
          ' ' +
          (contentWidth - this.chartPoints[0].yScaleWidth) * 100
      )
      .attr(
        'stroke-dashoffset',
        (contentWidth - this.chartPoints[0].yScaleWidth) * 100
      )
      .transition()
      .duration(5000)
      //.ease(easeLinear)
      .attr('stroke-dashoffset', 0);
    // mySvgPipe.call(this.myTransition);
  }

  private createLine(
    xScale:
      | ScaleTime<number, number, never>
      | ScaleLinear<number, number, never>,
    yScale: ScaleLinear<number, number, never>
  ): Line<[number, number]> {
    return line()
      .defined(
        (p) =>
          (p as unknown as ChartPoint).y !== null &&
          !isNaN((p as unknown as ChartPoint).y)
      )
      .x((p, i) =>
        xScale(
          (p as unknown as ChartPoint).x instanceof Date
            ? ((p as unknown as ChartPoint).x as Date)
            : i
        )
      )
      .y((p) => yScale((p as unknown as ChartPoint).y))
      .curve((p) => curveMonotoneX(p));
  }
}
