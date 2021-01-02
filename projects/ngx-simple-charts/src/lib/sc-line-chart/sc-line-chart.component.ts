import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { select, Selection, ContainerElement } from 'd3-selection';
import { ChartPoint } from '../model/chart-point';

@Component({
  selector: 'sc-line-chart',
  templateUrl: './sc-line-chart.component.html',
  styleUrls: ['./sc-line-chart.component.scss'],
})
export class ScLineChartComponent implements OnInit {
  @ViewChild("svgchart")
  private chartContainer!: ElementRef;
  private d3Svg!: Selection<ContainerElement, ChartPoint, HTMLElement, any>;  

  ngOnInit(): void {
	this.d3Svg = select<ContainerElement,ChartPoint>(this.chartContainer.nativeElement);
  }

}
