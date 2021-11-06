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
import { extent, max, min } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleBand, scaleLinear } from 'd3-scale';
import { ContainerElement, select, selectAll, Selection } from 'd3-selection';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ChartBar, ChartBars } from './model/chart-bars';

interface ResizeEvent {
  type: string;
}

@Component({
  selector: 'sc-bar-chart',
  templateUrl: './sc-bar-chart.component.html',
  styleUrls: ['./sc-bar-chart.component.scss'],
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
      this.chartContainer.nativeElement
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

    this.d3Svg.selectAll('g').remove();
    const gxAttributeTemp = this.d3Svg.append('g');
    const gxAttribute = gxAttributeTemp.attr('class', 'x axis');
    const gyAttributeTemp = this.d3Svg.append('g');
    const gyAttribute = gyAttributeTemp.attr('class', 'y axis');

    // X axis
    const xScale = scaleBand()
      .domain(this.chartBars.chartBars.map((myBar) => myBar.x))
      .rangeRound([contentWidth - this.chartBars.yScaleWidth, 0])
      .padding(0.2);

    gxAttribute
      .attr(
        'transform',
        'translate(' +
          this.chartBars.yScaleWidth +
          ',' +
          (contentHeight - this.chartBars.xScaleHeight) +
          ')'
      )
      .call(axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Add Y axis
    const yScale = scaleLinear()
      .domain(
        [
          min([0, ...this.chartBars.chartBars.map((myBar) => myBar.y)]),
          max(this.chartBars.chartBars.map((myBar) => myBar.y)),
        ] as number[]
        /*extent<ChartBar, number>(this.chartBars.chartBars, (p) => p.y) as [
          number,
          number
        ]*/
      )
      .nice()
      .range([contentHeight - this.chartBars.xScaleHeight, 0]);
    gyAttribute
      .attr(
        'transform',
        'translate(' + this.chartBars.yScaleWidth + ',' + 0 + ')'
      )
      .call(axisLeft(yScale));

    //console.log(this.gAttribute);

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
        (d) => (xScale(d.x) as unknown as number) + this.chartBars.yScaleWidth
      )
      .attr('y', (d) => yScale(d.y))
      .attr('width', xScale.bandwidth())
      .attr(
        'height',
        (d) => contentHeight - this.chartBars.xScaleHeight - yScale(d.y)
      )
      .attr('fill', '#0000ff');
  }
}
