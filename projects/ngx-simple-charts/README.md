# NgxSimpleCharts

This is a small chart library for Angular based on D3js. It currently supports single line and multi line charts with a legend. Bar charts are now supported too. The Bar charts and line charts are in separate entry points to enable the Angular Compiler to  put only the required code in the modules that use the features. Its purpose is to enable fast updates to new Angular versions. To enable the fast updates and due to limited time the library will continue have a small feature set. 

## Minimum Supported Angular Version
Angular 14

## Articles
* [Developing and Using Angular Libraries](https://angular2guy.wordpress.com/2021/07/31/developing-and-using-angular-libraries/)
* [Ngx-Simple-Charts multiline and legend support howto](https://angular2guy.wordpress.com/2021/10/02/ngx-simple-charts-multiline-and-legend-support-howto/)
* [Multiple Entry Points for the NgxSimpleCharts Angular Library](https://angular2guy.wordpress.com/2021/12/26/multiple-entry-points-for-ngxsimplecharts-angular-library/)

## Line Charts
To use the line chart component this module has to be imported: [NgxLineChartsModule](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/line/src/lib/ngx-line-charts.module.ts)

Then the component can be used: [<sc-line-chart [chartPoints]="..." [replaceName]="..." [replaceSymbol]="..."></sc-line-chart>](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/line/src/lib/sc-line-chart/sc-line-chart.component.ts) 

The lines are defined in the ChartPoints interface. To draw multiple lines in a chart multiple chartPoints have to be provided.  The interface for the chartPoints can be found here: [ChartPoints](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/line/src/lib/sc-line-chart/model/chart-points.ts)

To enable styling of the chart these classes can be used: [Component.scss](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/line/src/lib/sc-line-chart/sc-line-chart.component.scss)
The classes have to be overwritten with '::ng-deep' and the ViewEncapsulation.ShadowDom is not supported for the enclosing component. To style multiple lines '::ng-deep' classes with the naming convention line-'ChartPoints.name'(for example: 'line-abc') with the name in lower case can be used. The ChartPoints.name is filtered with this Regex: '[^a-zA-Z0-9\-]' that cuts off the name if a character is found that is not a letter, number or '-'(for example 'line-Abc1.d' -> 'line-abc1') and changes it to lower case.

The legend shows the names of the ChartPoints in the color that set for the lines. If one 'ChartPoints.name' should be replaced the 'replaceSymbol' has to be a string that the 'ChartPoints.name' includes and is replaced with the 'replaceName'.

The Line Charts are animated.

## Bar Charts
To use the bar chart component this module has to be imported: [NgxBarChartsModule](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/bar/src/lib/ngx-bar-charts.module.ts)

Then the component can be used: [<sc-bar-chart [chartBars]="..."></sc-bar-chart>](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/bar/src/lib/sc-bar-chart/sc-bar-chart.component.ts) 

The bars are defined in the ChartBars interface. The interface for the chartPoints can be found here: [ChartBars](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/bar/src/lib/sc-bar-chart/model/chart-bars.ts)

To enable styling of the chart these classes can be used: [Component.scss](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/bar/src/lib/sc-bar-chart/sc-bar-chart.component.scss)
The classes have to be overwritten with '::ng-deep' and the ViewEncapsulation.ShadowDom is not supported for the enclosing component. To style multiple bars '::ng-deep' classes with the naming convention line-'ChartBar.x'(for example: 'bar-abc') with the name in lower case can be used. The ChartBar.x is filtered with this Regex: '[^a-zA-Z0-9\-]' that cuts off the name if a character is found that is not a letter, number or '-'(for example 'bar-Abc1.d' -> 'line-abc1') and changes it to lower case.

The Bar Charts are animated.

## Donut Charts
To use the bar chart component this module has to be imported: [NgxDonutChartsModule](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/donut/src/lib/ngx-donut-charts.module.ts)

Then the component can be used: [<sc-donut-chart [chartSlices]="..."></sc-donut-chart>](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/donut/src/lib/sc-donut-chart/sc-donut-chart.component.ts)

The slices are defined in the ChartSlices interface. The interface for the chartSlices can be found here: [ChartSlices](https://github.com/Angular2Guy/ngx-simple-charts/blob/master/projects/ngx-simple-charts/donut/src/lib/sc-donut-chart/model/chart-slices.ts)

## Some time in the future
For more features pull requests are welcome.
