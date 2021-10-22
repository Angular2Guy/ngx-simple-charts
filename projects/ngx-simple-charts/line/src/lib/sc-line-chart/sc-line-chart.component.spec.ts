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
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartPoint, ChartPoints } from './model/chart-points';

import { ScLineChartComponent } from './sc-line-chart.component';

describe('ScLineChartComponent', () => {
  let component: ScLineChartComponent;
  let fixture: ComponentFixture<ScLineChartComponent>;
  const chartPoints: ChartPoints = {
    name: 'myChartPoints',
    xScaleHeight: 250,
    yScaleWidth: 250,
    chartPointList: [],
  };
  const myChartPointList: ChartPoint[] = [
    { x: new Date(2021, 0, 1), y: 50 },
    { x: new Date(2021, 0, 2), y: 75 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScLineChartComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a chart', () => {
    /*	const newChartPoints = JSON.parse(JSON.stringify(chartPoints));
	newChartPoints.chartPointList.push(...JSON.parse(JSON.stringify(myChartPointList)));
	component.chartPoints = [newChartPoints];
	component.ngAfterViewInit();
	fixture.detectChanges();
	const myElement = component.d3Svg.selectAll('path').nodes()
		.filter(myNode => (myNode as Element).classList.contains('line'))[0] as Element;
	expect(myElement.getAttribute('d')?.split(',').length).toBeGreaterThan(1);*/
  });

  it('should update a chart', () => {
    /*	const newChartPoints = JSON.parse(JSON.stringify(chartPoints));
	newChartPoints.chartPointList.push(...JSON.parse(JSON.stringify(myChartPointList)));
	newChartPoints.chartPointList.push({x: new Date(2021, 0,3), y: 100});	
	const myChanges: SimpleChanges = {chartPoints: {currentValue: [newChartPoints], firstChange: false, 
		previousValue: [chartPoints], isFirstChange: () => false} as SimpleChange};
	component.chartPoints = [newChartPoints];
	component.ngOnChanges(myChanges);
	fixture.detectChanges();	
	const myElement = component.d3Svg.selectAll('path').nodes()
		.filter(myNode => (myNode as Element).classList.contains('line'))[0] as Element;
	expect(myElement.getAttribute('d')?.split(',').length).toBeGreaterThan(2);*/
  });
});
