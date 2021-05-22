# NgxSimpleCharts

This is a small chart library for Angular based on D3js. It currently supports line charts. Its purpose is to enable fast updates to new Angular versions. To enable the fast updates and due to limited time the library will continue have a small feature set. 

## Minimum Supported Angular Version
Angular 12 (ivy only)

## Line Charts
To use the line chart component this module has to be imported: [NgxSimpleChartsModule](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/src/lib/ngx-simple-charts.module.ts)

Then the component can be used: [<sc-line-chart [chartPoints]="..."></sc-line-chart>](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/src/lib/sc-line-chart/sc-line-chart.component.ts) 

The interface for the chartPoints can be found here: [ChartPoints](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/src/lib/model/chart-points.ts)

To enable some styling of the chart these classes can be used: [Component.scss](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/src/lib/sc-line-chart/sc-line-chart.component.scss)

## Some time in the future
There might Bar Charts be added at some time in the future. For more features pull requests are welcome.