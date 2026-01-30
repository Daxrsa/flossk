import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    joinDate: string;
    avatar: string;
    rfid: string;
    contributions?: number;
    projectsCompleted?: number;
    eventsAttended?: number;
    codeContributions?: number;
    hardwareContributions?: number;
    eventContributions?: number;
}

@Component({
    selector: 'app-leaderboard',
    standalone: true,
    imports: [CommonModule, AvatarModule],
    template: `
    <div class="grid grid-cols-12 gap-4">
        <!-- Top Contributors Leaderboard -->
        <div class="col-span-12 lg:col-span-4">
            <div class="card">
                <div class="font-semibold text-xl mb-4">🏆 Top Contributors</div>
                <div class="flex flex-col gap-3">
                    <div *ngFor="let contributor of topContributors; let i = index" class="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <div class="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white" 
                             [ngClass]="{
                                'bg-yellow-500': i === 0,
                                'bg-gray-400': i === 1,
                                'bg-orange-600': i === 2,
                                'bg-blue-500': i > 2
                             }">
                            {{ i + 1 }}
                        </div>
                        <p-avatar [image]="contributor.avatar" shape="circle" size="large"></p-avatar>
                        <div class="flex-1">
                            <div class="font-semibold">{{ contributor.name }}</div>
                            <div class="text-sm text-muted-color">{{ contributor.role }}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-primary">{{ contributor.contributions }}</div>
                            <div class="text-xs text-muted-color">contributions</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Contribution Breakdown -->
        <div class="col-span-12 lg:col-span-8">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Contribution Stats</div>
                <div class="grid grid-cols-12 gap-4">
                    <div *ngFor="let contributor of topContributors.slice(0, 3)" class="col-span-12 sm:col-span-4">
                        <div class="p-4 border border-surface rounded-lg">
                            <div class="flex items-center gap-3 mb-3">
                                <p-avatar [image]="contributor.avatar" shape="circle"></p-avatar>
                                <div class="font-semibold">{{ contributor.name }}</div>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <div class="text-muted-color">Code</div>
                                    <div class="font-bold text-lg text-blue-600 dark:text-blue-400">{{ contributor.codeContributions }}</div>
                                </div>
                                <div>
                                    <div class="text-muted-color">Hardware</div>
                                    <div class="font-bold text-lg text-orange-600 dark:text-orange-400">{{ contributor.hardwareContributions }}</div>
                                </div>
                                <div>
                                    <div class="text-muted-color">Events</div>
                                    <div class="font-bold text-lg text-green-600 dark:text-green-400">{{ contributor.eventContributions }}</div>
                                </div>
                                <div>
                                    <div class="text-muted-color">Projects</div>
                                    <div class="font-bold text-lg text-purple-600 dark:text-purple-400">{{ contributor.projectsCompleted }}</div>
                                </div>
                                <div class="col-span-2 mt-2 pt-2 border-t border-surface">
                                    <div class="text-muted-color">Total Contributions</div>
                                    <div class="font-bold text-xl text-primary">{{ contributor.contributions }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
})
export class Leaderboard {
    topContributors: User[] = [];
    
    constructor() {
        this.calculateTopContributors();
    }
    
    calculateTopContributors() {
        this.topContributors = [...this.users]
            .filter(u => u.contributions && u.contributions > 0)
            .sort((a, b) => (b.contributions || 0) - (a.contributions || 0))
            .slice(0, 5);
    }

    users: User[] = [
        {
            id: 1,
            name: 'Amy Elsner',
            email: 'amy.elsner@flossk.com',
            role: 'Project Lead',
            rfid: 'Yes',
            joinDate: '2023-01-15',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
            contributions: 127,
            projectsCompleted: 15,
            eventsAttended: 22,
            codeContributions: 52,
            hardwareContributions: 38,
            eventContributions: 37
        },
        {
            id: 2,
            name: 'Anna Fali',
            email: 'anna.fali@flossk.com',
            role: 'Software Developer',
            rfid: 'No',
            joinDate: '2023-03-22',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png',
            contributions: 98,
            projectsCompleted: 12,
            eventsAttended: 18,
            codeContributions: 65,
            hardwareContributions: 12,
            eventContributions: 21
        },
        {
            id: 3,
            name: 'Asiya Javayant',
            email: 'asiya.javayant@flossk.com',
            role: 'UI/UX Designer',
            rfid: 'Yes',
            joinDate: '2023-05-10',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png',
            contributions: 85,
            projectsCompleted: 10,
            eventsAttended: 15,
            codeContributions: 48,
            hardwareContributions: 15,
            eventContributions: 22
        },
        {
            id: 4,
            name: 'Bernardo Dominic',
            email: 'bernardo.dominic@flossk.com',
            role: 'Hardware Engineer',
            rfid: 'Yes',
            joinDate: '2023-07-08',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png',
            contributions: 73,
            projectsCompleted: 9,
            eventsAttended: 13,
            codeContributions: 18,
            hardwareContributions: 42,
            eventContributions: 13
        },
        {
            id: 5,
            name: 'Elwin Sharvill',
            email: 'elwin.sharvill@flossk.com',
            role: 'Lead Engineer',
            rfid: 'No',
            joinDate: '2023-09-14',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png',
            contributions: 64,
            projectsCompleted: 8,
            eventsAttended: 12,
            codeContributions: 28,
            hardwareContributions: 24,
            eventContributions: 12
        },
        {
            id: 6,
            name: 'Ioni Bowcher',
            email: 'ioni.bowcher@flossk.com',
            role: 'Technician',
            rfid: 'Yes',
            joinDate: '2023-10-20',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png',
            contributions: 52,
            projectsCompleted: 7,
            eventsAttended: 10,
            codeContributions: 15,
            hardwareContributions: 27,
            eventContributions: 10
        },
        {
            id: 7,
            name: 'Xuxue Feng',
            email: 'xuxue.feng@flossk.com',
            role: 'Member',
            rfid: 'No',
            joinDate: '2023-11-05',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png',
            contributions: 38,
            projectsCompleted: 5,
            eventsAttended: 8,
            codeContributions: 22,
            hardwareContributions: 8,
            eventContributions: 8
        },
        {
            id: 8,
            name: 'Ivan Magalhaes',
            email: 'ivan.magalhaes@flossk.com',
            role: 'Member',
            rfid: 'Yes',
            joinDate: '2024-01-12',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ivanmagalhaes.png',
            contributions: 29,
            projectsCompleted: 4,
            eventsAttended: 6,
            codeContributions: 16,
            hardwareContributions: 7,
            eventContributions: 6
        },
        {
            id: 9,
            name: 'Onyama Limba',
            email: 'onyama.limba@flossk.com',
            role: 'Member',
            rfid: 'No',
            joinDate: '2024-02-18',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png',
            contributions: 18,
            projectsCompleted: 3,
            eventsAttended: 4,
            codeContributions: 10,
            hardwareContributions: 4,
            eventContributions: 4
        },
        {
            id: 10,
            name: 'Stephen Shaw',
            email: 'stephen.shaw@flossk.com',
            role: 'Member',
            rfid: 'Yes',
            joinDate: '2024-04-22',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/stephenshaw.png',
            contributions: 12,
            projectsCompleted: 2,
            eventsAttended: 3,
            codeContributions: 6,
            hardwareContributions: 3,
            eventContributions: 3
        },
        {
            id: 11,
            name: 'Walter White',
            email: 'walter.white@flossk.com',
            role: 'Member',
            rfid: 'No',
            joinDate: '2024-06-10',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/walterwhite.png',
            contributions: 5,
            projectsCompleted: 1,
            eventsAttended: 2,
            codeContributions: 2,
            hardwareContributions: 1,
            eventContributions: 2
        }
    ];
}
