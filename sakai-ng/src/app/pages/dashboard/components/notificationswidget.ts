import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

interface Notification {
    id: number;
    icon: string;
    iconColor: string;
    bgColor: string;
    message: string;
    category: string;
}

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notifications</div>
        </div>

        <span class="block text-muted-color font-medium mb-4">TODAY</span>
        <ul class="p-0 mx-0 mt-0 mb-6 list-none">
            <li *ngFor="let notification of getTodayNotifications()" class="flex items-center justify-between py-2 border-b border-surface">
                <div class="flex items-center flex-1">
                    <div [class]="'w-12 h-12 flex items-center justify-center rounded-full mr-4 shrink-0 ' + notification.bgColor">
                        <i [class]="'pi ' + notification.icon + ' text-xl! ' + notification.iconColor"></i>
                    </div>
                    <span class="text-surface-900 dark:text-surface-0 leading-normal" [innerHTML]="notification.message"></span>
                </div>
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (onClick)="deleteNotification(notification.id)"></p-button>
            </li>
        </ul>
    </div>
    `
})
export class NotificationsWidget {
    notifications: Notification[] = [
        {
            id: 1,
            icon: 'pi-dollar',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-400/10',
            message: 'Richard Jones <span class="text-surface-700 dark:text-surface-100">has purchased a blue t-shirt for <span class="text-primary font-bold">$79.00</span></span>',
            category: 'today'
        },
        {
            id: 2,
            icon: 'pi-download',
            iconColor: 'text-orange-500',
            bgColor: 'bg-orange-100 dark:bg-orange-400/10',
            message: '<span class="text-surface-700 dark:text-surface-100">Your request for withdrawal of <span class="text-primary font-bold">$2500.00</span> has been initiated.</span>',
            category: 'today'
        }
    ];

    getTodayNotifications() {
        return this.notifications.filter(n => n.category === 'today');
    }

    deleteNotification(id: number) {
        this.notifications = this.notifications.filter(n => n.id !== id);
    }
}
