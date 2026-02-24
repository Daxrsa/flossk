import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { AuthService } from '@/pages/service/auth.service';
import { environment } from '@environments/environment.prod';

interface Candidate {
    id: string;
    name: string;
    photo: string;
    biography: string;
    votes: number;
}

interface Election {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: 'upcoming' | 'active' | 'completed';
    candidates: Candidate[];
    totalVotes: number;
}

@Component({
    selector: 'app-voting',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CardModule,
        DialogModule,
        InputTextModule,
        TagModule,
        ProgressBarModule,
        DividerModule,
        ConfirmDialogModule,
        ToastModule,
        DatePickerModule,
        MultiSelectModule
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast />
        <p-confirmDialog />

        <div class="flex flex-col gap-4">
            <!-- Page Header -->
            <div class="card">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0 mb-2">
                            Board Elections
                        </h3>
                        <p class="text-surface-600 dark:text-surface-400 m-0">
                            Cast your vote for one candidate. The top 3 most voted members will be promoted to Admin — the most voted will become the Leader.
                        </p>
                    </div>
                    <div class="flex gap-2" *ngIf="isAdmin">
                        <p-button
                            label="New Election"
                            icon="pi pi-plus"
                            (onClick)="openCreateElectionDialog()"
                        />
                    </div>
                </div>
            </div>

            <!-- Active Election -->
            <div *ngIf="activeElection" class="card">
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">
                                {{ activeElection.title }}
                            </h2>
                            <p-tag
                                [value]="activeElection.status"
                                [severity]="getStatusSeverity(activeElection.status)"
                            />
                        </div>
                        <p class="text-surface-600 dark:text-surface-400 m-0">{{ activeElection.description }}</p>
                    </div>
                    <div class="flex items-center gap-6 text-sm text-surface-600 dark:text-surface-400">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-calendar"></i>
                            <span>Ends {{ activeElection.endDate | date:'mediumDate' }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-users"></i>
                            <span>{{ activeElection.totalVotes }} votes cast</span>
                        </div>
                    </div>
                </div>

                <!-- Voting Interface -->
                <div *ngIf="activeElection.status === 'active' && !hasVoted">
                    <p class="text-surface-600 dark:text-surface-400 mb-5">
                        Select one candidate you want to support.
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div
                            *ngFor="let candidate of activeElection.candidates"
                            class="border rounded-xl p-5 cursor-pointer transition-all duration-200"
                            [class.border-primary]="selectedCandidate === candidate.id"
                            [class.border-2]="selectedCandidate === candidate.id"
                            [class.bg-primary-50]="selectedCandidate === candidate.id"
                            [class.dark:bg-primary-900\/20]="selectedCandidate === candidate.id"
                            [class.border-surface-200]="selectedCandidate !== candidate.id"
                            [class.dark:border-surface-700]="selectedCandidate !== candidate.id"
                            (click)="selectedCandidate = candidate.id"
                        >
                            <div class="flex items-start gap-4">
                                <div class="relative shrink-0">
                                    <img
                                        [src]="candidate.photo"
                                        [alt]="candidate.name"
                                        class="w-16 h-16 rounded-full object-cover"
                                    >
                                    <div
                                        *ngIf="selectedCandidate === candidate.id"
                                        class="absolute -top-1 -right-1 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        <i class="pi pi-check text-xs"></i>
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-semibold text-surface-900 dark:text-surface-0 mb-1">{{ candidate.name }}</h4>
                                    <p class="text-sm text-surface-600 dark:text-surface-400 line-clamp-3">{{ candidate.biography }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end mt-6">
                        <p-button
                            label="Submit Vote"
                            icon="pi pi-check"
                            severity="success"
                            [disabled]="!selectedCandidate"
                            (onClick)="submitVote()"
                        />
                    </div>
                </div>

                <!-- Already Voted -->
                <div *ngIf="activeElection.status === 'active' && hasVoted" class="text-center py-10">
                    <i class="pi pi-check-circle text-green-500 text-5xl mb-4 block"></i>
                    <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">Thank You for Voting!</h3>
                    <p class="text-surface-600 dark:text-surface-400">
                        Your vote has been recorded. Results will be announced when the election period ends.
                    </p>
                </div>

                <!-- Results -->
                <div *ngIf="activeElection.status === 'completed' || (isAdmin && showResults)">
                    <p-divider *ngIf="hasVoted" />
                    <div class="mt-4">
                        <div class="flex justify-between items-center mb-5">
                            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 m-0">Results</h3>
                            <span class="text-surface-600 dark:text-surface-400 text-sm">{{ activeElection.totalVotes }} total votes</span>
                        </div>

                        <!-- Outcome legend -->
                        <div class="flex flex-wrap gap-3 mb-6">
                            <div class="flex items-center gap-2 text-sm">
                                <span class="inline-flex items-center justify-center bg-yellow-400 text-white rounded-full w-6 h-6 font-bold text-xs">1</span>
                                <span class="text-surface-700 dark:text-surface-300">Leader</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <span class="inline-flex items-center justify-center bg-primary text-white rounded-full w-6 h-6 font-bold text-xs">2</span>
                                <span class="text-surface-700 dark:text-surface-300">Admin</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <span class="inline-flex items-center justify-center bg-primary text-white rounded-full w-6 h-6 font-bold text-xs">3</span>
                                <span class="text-surface-700 dark:text-surface-300">Admin</span>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3">
                            <div
                                *ngFor="let candidate of getSortedCandidates(); let i = index"
                                class="flex items-center gap-4 rounded-xl p-4"
                                [class.bg-yellow-50]="i === 0"
                                [class.dark:bg-yellow-900\/10]="i === 0"
                                [class.border]="i < 3"
                                [class.border-yellow-300]="i === 0"
                                [class.border-primary-200]="i === 1 || i === 2"
                                [class.bg-primary-50]="i === 1 || i === 2"
                                [class.dark:bg-primary-900\/10]="i === 1 || i === 2"
                                [class.bg-surface-50]="i >= 3"
                                [class.dark:bg-surface-800]="i >= 3"
                            >
                                <!-- Rank badge -->
                                <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                                    [class.bg-yellow-400]="i === 0"
                                    [class.text-white]="i < 3"
                                    [class.bg-primary]="i === 1 || i === 2"
                                    [class.bg-surface-200]="i >= 3"
                                    [class.dark:bg-surface-700]="i >= 3"
                                    [class.text-surface-600]="i >= 3"
                                >
                                    {{ i + 1 }}
                                </div>

                                <img [src]="candidate.photo" [alt]="candidate.name" class="w-10 h-10 rounded-full object-cover shrink-0">

                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between mb-1">
                                        <div class="flex items-center gap-2">
                                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ candidate.name }}</span>
                                            <p-tag *ngIf="i === 0" value="Leader" severity="warn" />
                                            <p-tag *ngIf="i === 1 || i === 2" value="Admin" severity="info" />
                                        </div>
                                        <span class="font-semibold text-primary text-sm">{{ candidate.votes }} votes ({{ getVotePercentage(candidate.votes) }}%)</span>
                                    </div>
                                    <p-progressbar
                                        [value]="getVotePercentage(candidate.votes)"
                                        [showValue]="false"
                                        styleClass="h-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Admin live results toggle -->
                <div *ngIf="isAdmin && activeElection.status === 'active'" class="mt-6 text-center">
                    <p-button
                        [label]="showResults ? 'Hide Live Results' : 'View Live Results'"
                        icon="pi pi-chart-bar"
                        [outlined]="true"
                        size="small"
                        (onClick)="showResults = !showResults"
                    />
                </div>
            </div>

            <!-- No Active Election -->
            <div *ngIf="!activeElection" class="card text-center py-12">
                <i class="pi pi-inbox text-surface-400 text-5xl mb-4 block"></i>
                <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">No Active Elections</h3>
                <p class="text-surface-600 dark:text-surface-400 mb-6">There are currently no elections in progress.</p>
                <p-button
                    *ngIf="isAdmin"
                    label="Create Election"
                    icon="pi pi-plus"
                    (onClick)="openCreateElectionDialog()"
                />
            </div>

            <!-- Past Elections -->
            <div class="card" *ngIf="pastElections.length > 0">
                <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">Past Elections</h2>
                <div class="flex flex-col gap-3">
                    <div
                        *ngFor="let election of pastElections"
                        class="flex justify-between items-center p-4 bg-surface-50 dark:bg-surface-800 rounded-lg"
                    >
                        <div>
                            <h4 class="font-medium text-surface-900 dark:text-surface-0 mb-1">{{ election.title }}</h4>
                            <div class="flex items-center gap-4 text-sm text-surface-600 dark:text-surface-400">
                                <span>{{ election.endDate | date:'mediumDate' }}</span>
                                <span>{{ election.totalVotes }} votes</span>
                            </div>
                        </div>
                        <p-button
                            label="View Results"
                            [outlined]="true"
                            size="small"
                            (onClick)="viewElectionResults(election)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Create Election Dialog -->
        <p-dialog
            [(visible)]="createElectionDialog"
            header="Create Election"
            [modal]="true"
            [style]="{width: '32rem'}"
        >
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-medium text-surface-900 dark:text-surface-0 mb-2">Title</label>
                    <div class="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200 font-semibold">
                        {{ newElection.title }}
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-medium text-surface-900 dark:text-surface-0 mb-2">Start Date</label>
                        <p-datepicker
                            [(ngModel)]="newElection.startDate"
                            [showTime]="true"
                            [showIcon]="true"
                            [showButtonBar]="true"
                            dateFormat="dd/mm/yy"
                            hourFormat="24"
                            [minDate]="today"
                            placeholder="Select start date"
                            appendTo="body"
                            styleClass="w-full"
                        />
                    </div>
                    <div>
                        <label class="block font-medium text-surface-900 dark:text-surface-0 mb-2">End Date</label>
                        <p-datepicker
                            [(ngModel)]="newElection.endDate"
                            [showTime]="true"
                            [showIcon]="true"
                            [showButtonBar]="true"
                            dateFormat="dd/mm/yy"
                            hourFormat="24"
                            [minDate]="newElection.startDate"
                            placeholder="Select end date"
                            appendTo="body"
                            styleClass="w-full"
                        />
                    </div>
                </div>
                <div>
                    <label class="block font-medium text-surface-900 dark:text-surface-0 mb-2">Candidates</label>
                    <p-multiselect
                        [(ngModel)]="selectedCandidateIds"
                        [options]="fullMemberOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Full Members as candidates"
                        [loading]="loadingFullMembers"
                        [filter]="true"
                        filterPlaceholder="Search members..."
                        appendTo="body"
                        styleClass="w-full"
                    />
                </div>
            </div>
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" [outlined]="true" (onClick)="createElectionDialog = false" />
                <p-button label="Create" (onClick)="createElection()" />
            </div>
        </p-dialog>
    `
})
export class Voting implements OnInit {
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private http = inject(HttpClient);

    isAdmin = false;
    selectedCandidate = '';
    hasVoted = false;
    showResults = false;
    today = new Date();
    currentYear = new Date().getFullYear();

    createElectionDialog = false;

    activeElection: Election | null = null;
    pastElections: Election[] = [];

    newElection = { title: '', startDate: new Date(), endDate: new Date() };

    fullMemberOptions: { label: string; value: string }[] = [];
    selectedCandidateIds: string[] = [];
    loadingFullMembers = false;

    ngOnInit() {
        const currentUser = this.authService.currentUser();
        this.isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'BoardMember';
        this.loadMockData();
    }

    loadMockData() {
        const candidates: Candidate[] = [
            { id: '1', name: 'Arben Krasniqi',  photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',       biography: 'Passionate about open source. 5 years in tech leadership.',       votes: 45 },
            { id: '2', name: 'Blerta Morina',   photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png',         biography: 'Dedicated to innovation. Former CTO with 8 years experience.',    votes: 42 },
            { id: '3', name: 'Driton Gashi',    photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png',  biography: 'Experienced project manager and community advocate.',              votes: 38 },
            { id: '4', name: 'Eda Berisha',     photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png',    biography: 'Software engineer passionate about education.',                   votes: 31 },
            { id: '5', name: 'Fatos Hoxha',     photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png',     biography: 'Community organizer and event coordinator.',                      votes: 27 },
            { id: '6', name: 'Genta Shala',     photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png',   biography: 'Design thinking expert and UX advocate.',                         votes: 19 }
        ];

        this.activeElection = {
            id: 'e1',
            title: '2026 Annual Board Elections',
            description: 'Vote for one candidate. The top 3 will be promoted to Admin — the most voted becomes Leader.',
            startDate: new Date('2026-02-01'),
            endDate: new Date('2026-02-28'),
            status: 'active',
            candidates,
            totalVotes: 125
        };

        this.pastElections = [
            { id: 'e2', title: '2025 Annual Board Elections', description: '', startDate: new Date('2025-02-01'), endDate: new Date('2025-02-28'), status: 'completed', candidates: [], totalVotes: 98 },
            { id: 'e3', title: '2024 Annual Board Elections', description: '', startDate: new Date('2024-02-01'), endDate: new Date('2024-02-28'), status: 'completed', candidates: [], totalVotes: 87 }
        ];
    }

    getSortedCandidates(): Candidate[] {
        return [...(this.activeElection?.candidates ?? [])].sort((a, b) => b.votes - a.votes);
    }

    submitVote() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to submit your vote? This cannot be changed.',
            header: 'Confirm Vote',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.hasVoted = true;
                if (this.activeElection) {
                    this.activeElection.totalVotes++;
                    const candidate = this.activeElection.candidates.find(c => c.id === this.selectedCandidate);
                    if (candidate) candidate.votes++;
                }
                this.messageService.add({ severity: 'success', summary: 'Vote Submitted', detail: 'Your vote has been recorded.', life: 3000 });
            }
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' {
        switch (status) {
            case 'active': return 'success';
            case 'completed': return 'info';
            case 'upcoming': return 'warn';
            default: return 'info';
        }
    }

    getVotePercentage(votes: number): number {
        if (!this.activeElection || this.activeElection.totalVotes === 0) return 0;
        return Math.round((votes / this.activeElection.totalVotes) * 100);
    }

    openCreateElectionDialog() {
        this.newElection = {
            title: `Annual Board Elections ${this.currentYear}`,
            startDate: new Date(),
            endDate: new Date()
        };
        this.selectedCandidateIds = [];
        this.createElectionDialog = true;
        this.loadFullMembers();
    }

    loadFullMembers() {
        this.loadingFullMembers = true;
        this.http.get<any>(`${environment.apiUrl}/Auth/users?page=1&pageSize=200`).subscribe({
            next: (response) => {
                const users: any[] = response.users ?? [];
                this.fullMemberOptions = users
                    .filter((u: any) => (u.roles as string[]).includes('Full Member'))
                    .map((u: any) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
                this.loadingFullMembers = false;
            },
            error: () => { this.loadingFullMembers = false; }
        });
    }

    createElection() {
        this.messageService.add({ severity: 'success', summary: 'Election Created', detail: 'New election has been created.', life: 3000 });
        this.createElectionDialog = false;
    }

    viewElectionResults(election: Election) {
        this.messageService.add({ severity: 'info', summary: 'Results', detail: `Viewing ${election.title}`, life: 3000 });
    }
}
