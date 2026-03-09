import { Component } from '@angular/core';
import { StatsWidget } from './statswidget';
import { MembersPieChartWidget } from './memberspiechart';

@Component({
    selector: 'app-statistics',
    imports: [StatsWidget, MembersPieChartWidget],
    standalone: true,
    template: ` 
    <div class="grid grid-cols-12 gap-8">    
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <app-members-pie-chart-widget />
        </div>
    </div>`
})
export class Statistics { }
