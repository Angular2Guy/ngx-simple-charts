/**
 *    Copyright 2021 Sven Loesekann
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
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  Component,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { max, min } from 'd3-array';
import { axisBottom, axisLeft, AxisScale } from 'd3-axis';
import { NumberValue, scaleBand, scaleLinear } from 'd3-scale';
import { BaseType, ContainerElement, select, Selection } from 'd3-selection';
import 'd3-transition';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ChartBar, ChartBars } from './model/chart-bars';

interface ResizeEvent {
  type: string;
}

enum YScalePosition {
  Top,
  Bottom,
  Middle,
}

class Tuple<A, B> {
  private _a: A;
  private _b: B;

  constructor(a: A, b: B) {
    this._a = a;
    this._b = b;
  }

  public get a(): A {
    return this._a;
  }

  public get b(): B {
    return this._b;
  }
}

@Component({
  selector: 'sc-bar-chart',
  templateUrl: './sc-bar-chart.component.html',
  styleUrls: ['./sc-bar-chart.component.scss'],
  standalone: false,
})
export class ScBarChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('svgchart', { static: true })
  private chartContainer!: ElementRef;
  d3Svg!: Selection<ContainerElement, ChartBar, HTMLElement, any>;
  private chartUpdateSubject = new Subject();
  private chartUpdateSubscription!: Subscription;
  @Input()
  chartBars!: ChartBars;

  ngOnDestroy(): void {
    this.chartUpdateSubject.complete();
    this.chartUpdateSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes['chartBars'] && !changes['chartBars'].firstChange) {
      this.chartUpdateSubject.next({});
    }
  }

  ngAfterViewInit(): void {
    this.d3Svg = select<ContainerElement, ChartBar>(
      this.chartContainer.nativeElement,
    );

    this.chartUpdateSubscription = this.chartUpdateSubject
      .pipe(debounceTime(100))
      .subscribe(() => this.updateChart());
    this.chartUpdateSubject.next({});
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: ResizeEvent): void {
    event && this.chartUpdateSubject.next({});
  }

  private calcBarChartsXScalePosition(
    contentHeight: number,
    minYValue: number,
    maxYValue: number,
  ): Tuple<YScalePosition, number> {
    const positivePart =
      maxYValue / (Math.abs(minYValue) + Math.abs(maxYValue));
    let xPosition =
      minYValue >= 0 && maxYValue >= 0
        ? new Tuple<YScalePosition, number>(
            YScalePosition.Bottom,
            contentHeight - this.chartBars.xScaleHeight,
          )
        : new Tuple<YScalePosition, number>(
            YScalePosition.Middle,
            (contentHeight - this.chartBars.xScaleHeight) * positivePart,
          );
    //console.log(xPosition);
    xPosition =
      minYValue <= 0 && maxYValue <= 0
        ? new Tuple<YScalePosition, number>(
            YScalePosition.Top,
            this.chartBars.xScaleHeight,
          )
        : xPosition;
    //console.log(xPosition);
    return xPosition;
  }

  private updateChart(): void {
    const contentWidth = isNaN(
      parseInt(this.d3Svg.style('width').replace(/[^0-9\.]+/g, ''), 10),
    )
      ? 0
      : parseInt(this.d3Svg.style('width').replace(/[^0-9\.]+/g, ''), 10);
    const contentHeight = isNaN(
      parseInt(this.d3Svg.style('height').replace(/[^0-9\.]+/g, ''), 10),
    )
      ? 0
      : parseInt(this.d3Svg.style('height').replace(/[^0-9\.]+/g, ''), 10);

    this.d3Svg.attr('viewBox', [0, 0, contentWidth, contentHeight] as any);

    this.d3Svg.selectAll('g').remove();
    const gxAttributeTemp = this.d3Svg.append('g');
    const gxAttribute = gxAttributeTemp.attr('class', 'x-axis');
    const gyAttributeTemp = this.d3Svg.append('g');
    const gyAttribute = gyAttributeTemp.attr('class', 'y-axis');

    // X axis
    const xScale = scaleBand()
      .domain(this.chartBars.chartBars.map((myBar) => myBar.x))
      .rangeRound([contentWidth - this.chartBars.yScaleWidth, 0])
      .padding(0.2);

    const minYValue =
      min([0, ...this.chartBars.chartBars.map((myBar) => myBar.y)]) || 0;
    const maxYValue =
      max([0, ...this.chartBars.chartBars.map((myBar) => myBar.y)]) || 0;

    //console.log(minYValue, maxYValue);

    const yScalePositionY = this.calcBarChartsXScalePosition(
      contentHeight,
      minYValue,
      maxYValue,
    );

    // Add Y axis
    const yScale = scaleLinear()
      .domain([minYValue, maxYValue] as number[])
      .nice()
      .range([contentHeight - this.chartBars.xScaleHeight, 0]);
    gyAttribute
      .attr(
        'transform',
        'translate(' +
          this.chartBars.yScaleWidth +
          ',' +
          (yScalePositionY.a === YScalePosition.Top
            ? '' + this.chartBars.xScaleHeight
            : '' + 0) +
          ')',
      )
      .call(
        axisLeft(yScale as unknown as AxisScale<number>) as (
          selection: Selection<SVGGElement, ChartBar, HTMLElement, any>,
          ...args: any[]
        ) => void,
      );

    const yScalePosition = this.calcBarChartsXScalePosition(
      contentHeight,
      min(yScale.domain()) || 0,
      max(yScale.domain()) || 0,
    );

    gxAttribute
      .attr(
        'transform',
        'translate(' +
          this.chartBars.yScaleWidth +
          ',' +
          yScalePosition.b +
          ')',
      )
      .call(
        axisBottom(xScale as unknown as AxisScale<number>) as (
          selection: Selection<SVGGElement, ChartBar, HTMLElement, any>,
          ...args: any[]
        ) => void,
      )
      .selectAll('text')
      .attr(
        'transform',
        yScalePosition.a === YScalePosition.Top
          ? 'translate(-10,-15)rotate(-45)'
          : yScalePosition.a === YScalePosition.Bottom
            ? 'translate(-10,0)rotate(-45)'
            : `translate(-10,${
                contentHeight - yScalePosition.b - this.chartBars.xScaleHeight
              })rotate(-45)`,
      )
      .style(
        'text-anchor',
        yScalePosition.a === YScalePosition.Top ? 'start' : 'end',
      );

    //console.log(yScale.domain());

    //console.log(this.gAttribute);

    //console.log(yScalePosition.a === YScalePosition.Top);

    // Bars
    this.d3Svg.selectAll('#my-chart').remove();
    this.d3Svg
      .append('g')
      .attr('my-chart', 'my-chart')
      .selectAll('#my-chart')
      .data(this.chartBars.chartBars)
      .attr('transform', 'translate(' + this.chartBars.yScaleWidth + ', 0)')
      .join('rect')
      .attr(
        'x',
        (d) => (xScale(d.x) as unknown as number) + this.chartBars.yScaleWidth,
      )
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .transition()
      .duration(800)
      .attr('y', (d) =>
        yScalePosition.a === YScalePosition.Top
          ? this.chartBars.xScaleHeight
          : yScalePosition.a === YScalePosition.Bottom || d.y > 0
            ? yScale(d.y)
            : yScalePosition.b,
      )
      .attr('height', (d) => {
        let result = 0;
        if (yScalePosition.a === YScalePosition.Top) {
          result = yScale(d.y);
        } else if (yScalePosition.a === YScalePosition.Bottom) {
          result = contentHeight - this.chartBars.xScaleHeight - yScale(d.y);
        } else {
          result =
            d.y < 0
              ? yScale(d.y) - yScalePosition.b
              : yScalePosition.b - yScale(d.y);
        }
        return result;
      })
      .attr(
        'class',
        (d) =>
          'bar bar-' +
          d.x.split(/[^a-zA-Z0-9\-]/)[0].toLowerCase() +
          `${d.x === this.chartBars.title ? ' bar-portfolio' : ''}`,
      )
      .delay((d, i) => i * 100);
  }
}
