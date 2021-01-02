import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSimpleChartsComponent } from './ngx-simple-charts.component';

describe('NgxSimpleChartsComponent', () => {
  let component: NgxSimpleChartsComponent;
  let fixture: ComponentFixture<NgxSimpleChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxSimpleChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxSimpleChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
