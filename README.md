# NgxSimpleCharts

This is a small chart library for Angular based on D3js. It currently supports single line and multi line charts with a legend. Its purpose is to enable fast updates to new Angular versions. To enable the fast updates and due to limited time the library will continue have a small feature set. 

## Minimum Supported Angular Version
Angular 12 (ivy only)

## Articles
* [Developing and Using Angular Libraries](https://angular2guy.wordpress.com/2021/07/31/developing-and-using-angular-libraries/)

## Line Charts
To use the line chart component this module has to be imported: [NgxSimpleChartsModule](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/src/lib/ngx-simple-charts.module.ts)

Then the component can be used: [<sc-line-chart [chartPoints]="..." [replaceName]="..." [replaceSymbol]="..."></sc-line-chart>](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/src/lib/sc-line-chart/sc-line-chart.component.ts) 

The lines are defined in the ChartPoints interface. To draw multiple lines in a chart multiple chartPoints have to be provided.  The interface for the chartPoints can be found here: [ChartPoints](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/src/lib/model/chart-points.ts)

To enable styling of the chart these classes can be used: [Component.scss](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/src/lib/sc-line-chart/sc-line-chart.component.scss)
The classes have to be overwritten with '::ng-deep' and the ViewEncapsulation.ShadowDom is not supported for the enclosing component. To style multiple lines '::ng-deep' classes with the naming convention line-'ChartPoints.name'(for example: 'line-abc') with the name in lower case can be used. The ChartPoints.name is filtered with this Regex: '[^a-zA-Z0-9\-]' that cuts off the name if a character is found that is not a letter, number or '-'(for example 'line-Abc1.d' -> 'line-abc1') and changes it to lower case.

The legend shows the names of the ChartPoints in the color that set for the lines. If one 'ChartPoints.name' should be replaced the 'replaceSymbol' has to be a string that the 'ChartPoints.name' includes and is replaced with the 'replaceName'.

## Some time in the future
There might Bar Charts be added at some time in the future. For more features pull requests are welcome.
