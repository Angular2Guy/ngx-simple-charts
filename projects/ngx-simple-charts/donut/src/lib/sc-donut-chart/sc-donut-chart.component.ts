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
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition,
  group,
} from '@angular/animations';
import { ContainerElement, select, Selection } from 'd3-selection';
import { Subject, Subscription } from 'rxjs';
import { ChartSlice, ChartSlices } from './model/chart-slices';
import { debounceTime } from 'rxjs/operators';
import 'd3-transition';
import { scaleOrdinal } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';
import { arc, pie } from 'd3-shape';
import { range } from 'd3-array';

interface ResizeEvent {
  type: string;
}

@Component({
  selector: 'sc-donut-chart',
  templateUrl: './sc-donut-chart.component.html',
  styleUrls: ['./sc-donut-chart.component.scss'],
  animations: [
    trigger('fadeInGrow', [
      transition('* => ready', [
        style({ opacity: 0, transform: 'scale(0.1)' }),
        group([
          animate('300ms linear', style({ opacity: 1 })),
          animate('1000ms linear', style({ transform: 'scale(1)' })),
        ]),
      ]),
    ]),
  ],
  standalone: false,
})
export class ScDonutChartComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  @ViewChild('svgchart', { static: true })
  private chartContainer!: ElementRef;
  d3Svg!: Selection<ContainerElement, ChartSlice, HTMLElement, any>;
  private chartUpdateSubject = new Subject();
  private chartUpdateSubscription!: Subscription;
  @Input()
  chartSlices!: ChartSlices;
  @Input()
  chartState: 'ready' | 'not-ready' = 'not-ready';

  constructor() {}

  ngAfterViewInit(): void {
    this.d3Svg = select<ContainerElement, ChartSlice>(
      this.chartContainer.nativeElement,
    );

    this.chartUpdateSubscription = this.chartUpdateSubject
      .pipe(debounceTime(100))
      .subscribe(() => this.updateChart());
    this.chartUpdateSubject.next({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes['chartSlices'] && !changes['chartSlices'].firstChange) {
      this.chartUpdateSubject.next({});
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: ResizeEvent): void {
    event && this.chartUpdateSubject.next({});
  }

  ngOnDestroy(): void {
    this.chartUpdateSubject.complete();
    this.chartUpdateSubscription.unsubscribe();
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

    const innerRadius = Math.min(contentWidth, contentHeight) / 3; // inner radius of pie, in pixels (non-zero for donut)
    const outerRadius = Math.min(contentWidth, contentHeight) / 2; // outer radius of pie, in pixels
    const labelRadius = (innerRadius + outerRadius) / 2; // center radius of labels
    const stroke = innerRadius > 0 ? 'none' : 'white'; // stroke separating widths
    const strokeWidth = 1; // width of stroke separating wedges
    const strokeLinejoin = 'round'; // line join of stroke separating wedges
    const padAngle = stroke === 'none' ? 1 / outerRadius : 0;
    const slices = !this?.chartSlices?.chartSlices
      ? []
      : this.chartSlices.chartSlices;
    const ids = range(slices.length).filter((i) => !isNaN(slices[i]?.value));
    const colors = ids.map((myId) =>
      !slices[myId]?.color
        ? interpolateSpectral(myId)
        : (slices[myId].color as string),
    );
    const sliceNames = slices.map((mySlice) => mySlice.name);
    const colorOrdinals = scaleOrdinal(sliceNames, colors);
    const arcs = pie<ChartSlice>()
      .padAngle(padAngle)
      .sort(null)
      .value((v) => v.value);
    const myArc = arc<ChartSlice>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);
    const arcLabel = arc().innerRadius(labelRadius).outerRadius(labelRadius);

    this.d3Svg.attr('viewBox', [0, 0, contentWidth, contentHeight] as any);

    this.d3Svg.selectAll('g').remove();

    this.d3Svg.selectAll('path').remove();
    this.d3Svg
      .append('g')
      .attr('my-chart', 'my-chart')
      .attr('transform', `translate(${contentWidth / 2},${contentHeight / 2})`)
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-linejoin', strokeLinejoin)
      .selectAll('path')
      .data(arcs(slices))
      .join('path')
      .attr('fill', (d, i) => colorOrdinals(slices[i].name))
      .attr('d', myArc as any)
      .append('title')
      .text(() => this.chartSlices.title);

    this.d3Svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(arcs(slices))
      .join('text')
      .attr('transform', (d) => {
        const result = arcLabel.centroid(d as any);
        result[0] = result[0] + contentWidth / 2;
        result[1] = result[1] + contentHeight / 2;
        return `translate(${result})`;
      })
      .selectAll('tspan')
      .data((d) => [d])
      .join('tspan')
      .text((d) => d?.data?.name);
  }
}
