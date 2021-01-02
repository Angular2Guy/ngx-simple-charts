import { TestBed } from '@angular/core/testing';

import { NgxSimpleChartsService } from './ngx-simple-charts.service';

describe('NgxSimpleChartsService', () => {
  let service: NgxSimpleChartsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxSimpleChartsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
