import { Component } from '@angular/core';
import { StatsWidget } from './statswidget';

@Component({
    selector: 'app-statistics',
    imports: [StatsWidget],
    standalone: true,
    template: ` 
    <div class="grid grid-cols-12 gap-8">    
        <app-stats-widget class="contents" />    
    </div>`
})
export class Statistics { }
