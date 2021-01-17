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
import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { select, Selection, ContainerElement } from 'd3-selection';
import { ChartPoint } from '../model/chart-point';
import { scaleLinear } from 'd3-scale';

@Component({
  selector: 'sc-line-chart',
  templateUrl: './sc-line-chart.component.html',
  styleUrls: ['./sc-line-chart.component.scss'],
})
export class ScLineChartComponent implements OnInit, OnChanges {
  @ViewChild("svgchart")
  private chartContainer!: ElementRef;
  private d3Svg!: Selection<ContainerElement, ChartPoint, HTMLElement, any>;  
  @Input()
  private chartPoints: ChartPoint[] = [];
  private gAttribute!: Selection<SVGGElement, ChartPoint, HTMLElement, any>;

  ngOnInit(): void {
	this.d3Svg = select<ContainerElement,ChartPoint>(this.chartContainer.nativeElement);	

    this.gAttribute = this.d3Svg.append('g').attr('transform', 'translate(0,0)');	
	this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {    
    if(!!changes['chartPoints']) {
		this.updateChart();
    }
  }

  private updateChart(): void {
	const contentWidth = isNaN(parseInt(this.d3Svg.style('width').replace(/[^0-9\.]+/g, ''), 10)) ? 0 : parseInt(this.d3Svg.style('width').replace(/[^0-9\.]+/g, ''), 10);
    const contentHeight = isNaN(parseInt(this.d3Svg.style('height').replace(/[^0-9\.]+/g, ''), 10)) ? 0 : parseInt(this.d3Svg.style('height').replace(/[^0-9\.]+/g, ''), 10);

  }
}
