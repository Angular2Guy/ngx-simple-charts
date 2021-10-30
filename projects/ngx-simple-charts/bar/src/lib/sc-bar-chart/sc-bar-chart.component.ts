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
} from '@angular/core';
import { extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleBand, scaleLinear } from 'd3-scale';
import { ContainerElement, select, Selection } from 'd3-selection';
import { ChartBar, ChartBars } from './model/chart-bars';

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
  private gAttribute!: Selection<SVGGElement, ChartBar, HTMLElement, any>;
  @Input()
  chartBars!: ChartBars;

  ngOnDestroy(): void {
    console.log('destroy');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('change');
  }

  ngAfterViewInit(): void {
    this.d3Svg = select<ContainerElement, ChartBar>(
      this.chartContainer.nativeElement
    );

    this.gAttribute = this.d3Svg.append('g');
    this.gAttribute = this.gAttribute.attr('class', 'x axis');
    this.gAttribute = this.gAttribute.attr('class', 'y axis');
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
    // X axis
    const x = scaleBand()
      .range([0, this.chartBars.chartBars.length - 1])
      .domain(
        extent(this.chartBars.chartBars, (cb) => cb.x as string) as [
          string,
          string
        ]
      )
      .padding(0.2);
    this.gAttribute
      .attr('transform', `translate(0, ${this.chartBars.yScaleWidth})`)
      .call(axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');
    // Add Y axis

    const y = scaleLinear()
      .domain(
        extent<ChartBar, number>(this.chartBars.chartBars, (p) => p.y) as [
          number,
          number
        ]
      )
      .nice()
      .range([contentHeight - this.chartBars.xScaleHeight, 0]);
    this.gAttribute.call(axisLeft(y));

    // Bars
    this.d3Svg.selectAll('path').remove();
    this.d3Svg
      .append('path')
      .data(this.chartBars.chartBars)
      .attr('transform', 'translate(' + this.chartBars.yScaleWidth + ', 0)')
      .join('rect')
      .attr('x', (d) => x(d.x) as unknown as string)
      .attr('y', (d) => y(d.y))
      .attr('width', x.bandwidth())
      .attr(
        'height',
        (d) => contentHeight - this.chartBars.xScaleHeight - y(d.y)
      )
      .attr('fill', '#69b3a2');
  }
}
