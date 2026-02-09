import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { StepperModule } from 'primeng/stepper';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabsModule } from 'primeng/tabs';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { AuthService } from '@/pages/service/auth.service';

interface Candidate {
    id: string;
    name: string;
    photo: string;
    biography: string;
    position: 'leader' | 'board';
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
        RadioButtonModule,
        CheckboxModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        StepperModule,
        AvatarModule,
        TagModule,
        ProgressBarModule,
        TabsModule,
        ChipModule,
        DividerModule,
        ConfirmDialogModule,
        ToastModule,
        DatePickerModule
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast />
        <p-confirmDialog />
        
        <div class="flex flex-col">
            <!-- Page Header -->
            <div class="card">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0 mb-2">
                            Board Elections
                        </h3>
                        <p class="text-surface-600 dark:text-surface-400 m-0">
                            Vote for the next FLOSSK leadership — 1 Leader and 2 Board Members
                        </p>
                    </div>
                    <div class="flex gap-2" *ngIf="isAdmin">
                        <p-button 
                            label="New Election" 
                            icon="pi pi-plus" 
                            (onClick)="openCreateElectionDialog()"
                        />
                        <p-button 
                            label="Manage Candidates" 
                            icon="pi pi-users" 
                            [outlined]="true"
                            (onClick)="openManageCandidatesDialog()"
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
                        <p class="text-surface-600 dark:text-surface-400 m-0">
                            {{ activeElection.description }}
                        </p>
                    </div>
                    <div class="flex items-center gap-6 text-sm text-surface-600 dark:text-surface-400">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-calendar"></i>
                            <span>Ends {{ activeElection.endDate | date:'mediumDate' }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-users"></i>
                            <span>{{ activeElection.totalVotes }} votes</span>
                        </div>
                    </div>
                </div>

                <!-- Voting Interface -->
                <div *ngIf="activeElection.status === 'active' && !hasVoted">
                    <p-tabs [(value)]="activeTab">
                        <p-tablist>
                            <p-tab [value]="0">
                                <span class="flex items-center gap-2">
                                    <i class="pi pi-crown"></i>
                                    <span>Vote for Leader</span>
                                    <p-tag *ngIf="selectedLeader" value="1" severity="success" [rounded]="true" />
                                </span>
                            </p-tab>
                            <p-tab [value]="1">
                                <span class="flex items-center gap-2">
                                    <i class="pi pi-users"></i>
                                    <span>Vote for Board Members</span>
                                    <p-tag *ngIf="selectedBoardMembers.length > 0" [value]="selectedBoardMembers.length + '/2'" severity="success" [rounded]="true" />
                                </span>
                            </p-tab>
                            <p-tab [value]="2">
                                <span class="flex items-center gap-2">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Review & Submit</span>
                                </span>
                            </p-tab>
                        </p-tablist>
                        
                        <p-tabpanels>
                            <!-- Leader Selection -->
                            <p-tabpanel [value]="0">
                                <div class="py-4">
                                    <p class="text-surface-600 dark:text-surface-400 mb-6">
                                        Select one candidate to lead FLOSSK for the upcoming year.
                                    </p>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div 
                                            *ngFor="let candidate of getLeaderCandidates()"
                                            class="border rounded-lg p-5 cursor-pointer transition-all duration-200"
                                            [class.border-primary]="selectedLeader === candidate.id"
                                            [class.border-2]="selectedLeader === candidate.id"
                                            [class.bg-primary-50]="selectedLeader === candidate.id"
                                            [class.dark:bg-primary-900/20]="selectedLeader === candidate.id"
                                            [class.border-surface-200]="selectedLeader !== candidate.id"
                                            [class.dark:border-surface-700]="selectedLeader !== candidate.id"
                                            [class.hover:border-primary]="selectedLeader !== candidate.id"
                                            (click)="selectedLeader = candidate.id"
                                        >
                                            <div class="flex items-start gap-4">
                                                <div class="relative">
                                                    <img 
                                                        [src]="candidate.photo" 
                                                        [alt]="candidate.name"
                                                        class="w-16 h-16 rounded-full object-cover"
                                                    >
                                                    <div 
                                                        *ngIf="selectedLeader === candidate.id"
                                                        class="absolute -top-1 -right-1 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                    >
                                                        <i class="pi pi-check text-xs"></i>
                                                    </div>
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <h4 class="font-semibold text-surface-900 dark:text-surface-0 mb-1">
                                                        {{ candidate.name }}
                                                    </h4>
                                                    <p class="text-sm text-surface-600 dark:text-surface-400 line-clamp-3">
                                                        {{ candidate.biography }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="flex justify-end mt-6">
                                        <p-button 
                                            label="Continue to Board Members" 
                                            icon="pi pi-arrow-right" 
                                            iconPos="right"
                                            [disabled]="!selectedLeader"
                                            (onClick)="activeTab = 1"
                                        />
                                    </div>
                                </div>
                            </p-tabpanel>

                            <!-- Board Members Selection -->
                            <p-tabpanel [value]="1">
                                <div class="py-4">
                                    <p class="text-surface-600 dark:text-surface-400 mb-6">
                                        Select exactly 2 candidates for board member positions.
                                    </p>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div 
                                            *ngFor="let candidate of getBoardCandidates()"
                                            class="border rounded-lg p-5 cursor-pointer transition-all duration-200"
                                            [class.border-primary]="isSelectedBoardMember(candidate.id)"
                                            [class.border-2]="isSelectedBoardMember(candidate.id)"
                                            [class.bg-primary-50]="isSelectedBoardMember(candidate.id)"
                                            [class.dark:bg-primary-900/20]="isSelectedBoardMember(candidate.id)"
                                            [class.border-surface-200]="!isSelectedBoardMember(candidate.id)"
                                            [class.dark:border-surface-700]="!isSelectedBoardMember(candidate.id)"
                                            [class.hover:border-primary]="!isSelectedBoardMember(candidate.id) && selectedBoardMembers.length < 2"
                                            [class.opacity-50]="selectedBoardMembers.length === 2 && !isSelectedBoardMember(candidate.id)"
                                            [class.cursor-not-allowed]="selectedBoardMembers.length === 2 && !isSelectedBoardMember(candidate.id)"
                                            (click)="toggleBoardMember(candidate.id)"
                                        >
                                            <div class="flex items-start gap-4">
                                                <div class="relative">
                                                    <img 
                                                        [src]="candidate.photo" 
                                                        [alt]="candidate.name"
                                                        class="w-16 h-16 rounded-full object-cover"
                                                    >
                                                    <div 
                                                        *ngIf="isSelectedBoardMember(candidate.id)"
                                                        class="absolute -top-1 -right-1 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                    >
                                                        <i class="pi pi-check text-xs"></i>
                                                    </div>
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <h4 class="font-semibold text-surface-900 dark:text-surface-0 mb-1">
                                                        {{ candidate.name }}
                                                    </h4>
                                                    <p class="text-sm text-surface-600 dark:text-surface-400 line-clamp-3">
                                                        {{ candidate.biography }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="flex justify-between items-center mt-6">
                                        <p-button 
                                            label="Back" 
                                            icon="pi pi-arrow-left" 
                                            [outlined]="true"
                                            (onClick)="activeTab = 0"
                                        />
                                        <span class="text-surface-600 dark:text-surface-400">
                                            {{ selectedBoardMembers.length }}/2 selected
                                        </span>
                                        <p-button 
                                            label="Review Selection" 
                                            icon="pi pi-arrow-right" 
                                            iconPos="right"
                                            [disabled]="selectedBoardMembers.length !== 2"
                                            (onClick)="activeTab = 2"
                                        />
                                    </div>
                                </div>
                            </p-tabpanel>

                            <!-- Review & Submit -->
                            <p-tabpanel [value]="2">
                                <div class="py-4">
                                    <div class="max-w-2xl mx-auto">
                                        <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-6 text-center">
                                            Review Your Selections
                                        </h3>
                                        
                                        <!-- Leader Review -->
                                        <div class="mb-6">
                                            <div class="flex items-center gap-2 mb-3">
                                                <i class="pi pi-crown text-primary"></i>
                                                <span class="font-medium text-surface-900 dark:text-surface-0">Leader</span>
                                            </div>
                                            <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
                                                <div class="flex items-center gap-4" *ngIf="getSelectedLeaderCandidate()">
                                                    <img 
                                                        [src]="getSelectedLeaderCandidate()?.photo" 
                                                        [alt]="getSelectedLeaderCandidate()?.name"
                                                        class="w-14 h-14 rounded-full object-cover"
                                                    >
                                                    <div>
                                                        <h4 class="font-semibold text-surface-900 dark:text-surface-0">
                                                            {{ getSelectedLeaderCandidate()?.name }}
                                                        </h4>
                                                        <p class="text-sm text-surface-600 dark:text-surface-400">
                                                            {{ getSelectedLeaderCandidate()?.biography }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Board Members Review -->
                                        <div class="mb-8">
                                            <div class="flex items-center gap-2 mb-3">
                                                <i class="pi pi-users text-primary"></i>
                                                <span class="font-medium text-surface-900 dark:text-surface-0">Board Members</span>
                                            </div>
                                            <div class="flex flex-col gap-3">
                                                <div 
                                                    *ngFor="let memberId of selectedBoardMembers"
                                                    class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4"
                                                >
                                                    <div class="flex items-center gap-4">
                                                        <img 
                                                            [src]="getCandidateById(memberId)?.photo" 
                                                            [alt]="getCandidateById(memberId)?.name"
                                                            class="w-14 h-14 rounded-full object-cover"
                                                        >
                                                        <div>
                                                            <h4 class="font-semibold text-surface-900 dark:text-surface-0">
                                                                {{ getCandidateById(memberId)?.name }}
                                                            </h4>
                                                            <p class="text-sm text-surface-600 dark:text-surface-400">
                                                                {{ getCandidateById(memberId)?.biography }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p-divider />

                                        <p class="text-center text-surface-600 dark:text-surface-400 my-6">
                                            Your vote is final and cannot be changed once submitted.
                                        </p>

                                        <div class="flex justify-between">
                                            <p-button 
                                                label="Back" 
                                                icon="pi pi-arrow-left" 
                                                [outlined]="true"
                                                (onClick)="activeTab = 1"
                                            />
                                            <p-button 
                                                label="Submit Vote" 
                                                icon="pi pi-check" 
                                                severity="success"
                                                (onClick)="submitVote()"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </p-tabpanel>
                        </p-tabpanels>
                    </p-tabs>
                </div>

                <!-- Already Voted -->
                <div *ngIf="hasVoted" class="text-center py-10">
                    <i class="pi pi-check-circle text-green-500 text-5xl mb-4"></i>
                    <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">
                        Thank You for Voting!
                    </h3>
                    <p class="text-surface-600 dark:text-surface-400">
                        Your vote has been recorded. Results will be announced when voting ends.
                    </p>
                </div>

                <!-- Results (Completed or Admin) -->
                <div *ngIf="activeElection.status === 'completed' || (isAdmin && showResults)">
                    <p-divider *ngIf="hasVoted" />
                    
                    <div class="mt-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 m-0">
                                Results
                            </h3>
                            <span class="text-surface-600 dark:text-surface-400">
                                {{ activeElection.totalVotes }} total votes
                            </span>
                        </div>

                        <!-- Leader Results -->
                        <div class="mb-6">
                            <div class="flex items-center gap-2 mb-4">
                                <i class="pi pi-crown text-primary"></i>
                                <span class="font-medium text-surface-900 dark:text-surface-0">Leader</span>
                            </div>
                            <div class="flex flex-col gap-3">
                                <div 
                                    *ngFor="let candidate of getLeaderCandidates()"
                                    class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4"
                                >
                                    <div class="flex items-center gap-4 mb-3">
                                        <img 
                                            [src]="candidate.photo" 
                                            [alt]="candidate.name"
                                            class="w-12 h-12 rounded-full object-cover"
                                        >
                                        <div class="flex-1 min-w-0">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="font-medium text-surface-900 dark:text-surface-0">{{ candidate.name }}</span>
                                                <span class="font-semibold text-primary">{{ getVotePercentage(candidate.votes) }}%</span>
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

                        <!-- Board Results -->
                        <div>
                            <div class="flex items-center gap-2 mb-4">
                                <i class="pi pi-users text-primary"></i>
                                <span class="font-medium text-surface-900 dark:text-surface-0">Board Members</span>
                            </div>
                            <div class="flex flex-col gap-3">
                                <div 
                                    *ngFor="let candidate of getBoardCandidates()"
                                    class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4"
                                >
                                    <div class="flex items-center gap-4 mb-3">
                                        <img 
                                            [src]="candidate.photo" 
                                            [alt]="candidate.name"
                                            class="w-12 h-12 rounded-full object-cover"
                                        >
                                        <div class="flex-1 min-w-0">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="font-medium text-surface-900 dark:text-surface-0">{{ candidate.name }}</span>
                                                <span class="font-semibold text-primary">{{ getVotePercentage(candidate.votes) }}%</span>
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
                    </div>
                </div>

                <!-- Admin Results Toggle -->
                <div *ngIf="isAdmin && activeElection.status === 'active'" class="mt-6 text-center">
                    <p-button 
                        [label]="showResults ? 'Hide Results' : 'View Live Results'" 
                        icon="pi pi-chart-bar" 
                        [outlined]="true"
                        size="small"
                        (onClick)="showResults = !showResults"
                    />
                </div>
            </div>

            <!-- No Active Election -->
            <div *ngIf="!activeElection" class="card text-center py-12">
                <i class="pi pi-inbox text-surface-400 text-5xl mb-4"></i>
                <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">
                    No Active Elections
                </h3>
                <p class="text-surface-600 dark:text-surface-400 mb-6">
                    There are currently no elections in progress.
                </p>
                <p-button 
                    *ngIf="isAdmin"
                    label="Create Election" 
                    icon="pi pi-plus" 
                    (onClick)="openCreateElectionDialog()"
                />
            </div>

            <!-- Past Elections -->
            <div class="card" *ngIf="pastElections.length > 0">
                <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">
                    Past Elections
                </h2>
                <div class="flex flex-col gap-3">
                    <div 
                        *ngFor="let election of pastElections"
                        class="flex justify-between items-center p-4 bg-surface-50 dark:bg-surface-800 rounded-lg"
                    >
                        <div>
                            <h4 class="font-medium text-surface-900 dark:text-surface-0 mb-1">
                                {{ election.title }}
                            </h4>
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
                    <input pInputText [(ngModel)]="newElection.title" placeholder="e.g., 2026 Board Elections" class="w-full" />
                </div>
                <div>
                    <label class="block font-medium text-surface-900 dark:text-surface-0 mb-2">Description</label>
                    <textarea pInputTextarea [(ngModel)]="newElection.description" [rows]="3" class="w-full"></textarea>
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
            </div>
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" [outlined]="true" (onClick)="createElectionDialog = false" />
                <p-button label="Create" (onClick)="createElection()" />
            </div>
        </p-dialog>

        <!-- Manage Candidates Dialog -->
        <p-dialog 
            [(visible)]="manageCandidatesDialog" 
            header="Manage Candidates" 
            [modal]="true" 
            [style]="{width: '48rem'}"
        >
            <div class="mb-6">
                <h4 class="font-semibold text-surface-900 dark:text-surface-0 mb-4">Add Candidate</h4>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block font-medium text-surface-900 dark:text-surface-0 mb-2">Name</label>
                        <input pInputText [(ngModel)]="newCandidate.name" class="w-full" />
                    </div>
                    <div>
                        <label class="block font-medium text-surface-900 dark:text-surface-0 mb-2">Position</label>
                        <div class="flex gap-4 mt-3">
                            <div class="flex items-center">
                                <p-radiobutton value="leader" [(ngModel)]="newCandidate.position" inputId="posLeader" />
                                <label for="posLeader" class="ml-2">Leader</label>
                            </div>
                            <div class="flex items-center">
                                <p-radiobutton value="board" [(ngModel)]="newCandidate.position" inputId="posBoard" />
                                <label for="posBoard" class="ml-2">Board</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block font-medium text-surface-900 dark:text-surface-0 mb-2">Photo URL</label>
                        <input pInputText [(ngModel)]="newCandidate.photo" class="w-full" />
                    </div>
                    <div>
                        <label class="block font-medium text-surface-900 dark:text-surface-0 mb-2">Biography</label>
                        <input pInputText [(ngModel)]="newCandidate.biography" class="w-full" />
                    </div>
                </div>
                <p-button label="Add Candidate" icon="pi pi-plus" (onClick)="addCandidate()" />
            </div>

            <p-divider />

            <div>
                <h4 class="font-semibold text-surface-900 dark:text-surface-0 mb-4">Current Candidates</h4>
                <div class="flex flex-col gap-3">
                    <div 
                        *ngFor="let candidate of allCandidates"
                        class="flex items-center justify-between p-3 border border-surface-200 dark:border-surface-700 rounded-lg"
                    >
                        <div class="flex items-center gap-3">
                            <img [src]="candidate.photo" [alt]="candidate.name" class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <span class="font-medium text-surface-900 dark:text-surface-0">{{ candidate.name }}</span>
                                <p-tag [value]="candidate.position" size="small" />
                            </div>
                        </div>
                        <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="deleteCandidate(candidate.id)" />
                    </div>
                </div>
            </div>
        </p-dialog>
    `
})
export class Voting implements OnInit {
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    isAdmin = false;
    activeTab = 0;
    selectedLeader = '';
    selectedBoardMembers: string[] = [];
    hasVoted = false;
    showResults = false;
    today = new Date();
    
    createElectionDialog = false;
    manageCandidatesDialog = false;

    activeElection: Election | null = null;
    pastElections: Election[] = [];
    allCandidates: Candidate[] = [];

    newElection = { title: '', description: '', startDate: new Date(), endDate: new Date() };
    newCandidate = { name: '', photo: '', biography: '', position: 'leader' as 'leader' | 'board' };

    ngOnInit() {
        const currentUser = this.authService.currentUser();
        this.isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'BoardMember';
        this.loadMockData();
    }

    loadMockData() {
        this.allCandidates = [
            { id: '1', name: 'Arben Krasniqi', photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', biography: 'Passionate about open source. 5 years in tech leadership.', position: 'leader', votes: 45 },
            { id: '2', name: 'Blerta Morina', photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png', biography: 'Dedicated to innovation. Former CTO with 8 years experience.', position: 'leader', votes: 38 },
            { id: '3', name: 'Driton Gashi', photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', biography: 'Experienced project manager and community advocate.', position: 'board', votes: 42 },
            { id: '4', name: 'Eda Berisha', photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', biography: 'Software engineer passionate about education.', position: 'board', votes: 39 },
            { id: '5', name: 'Fatos Hoxha', photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png', biography: 'Community organizer and event coordinator.', position: 'board', votes: 35 },
            { id: '6', name: 'Genta Shala', photo: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', biography: 'Design thinking expert and UX advocate.', position: 'board', votes: 31 }
        ];

        this.activeElection = {
            id: 'e1',
            title: '2026 Annual Board Elections',
            description: 'Vote for the next FLOSSK leadership team.',
            startDate: new Date('2026-02-01'),
            endDate: new Date('2026-02-28'),
            status: 'active',
            candidates: this.allCandidates,
            totalVotes: 125
        };

        this.pastElections = [
            { id: 'e2', title: '2025 Annual Board Elections', description: '', startDate: new Date('2025-02-01'), endDate: new Date('2025-02-28'), status: 'completed', candidates: [], totalVotes: 98 },
            { id: 'e3', title: '2024 Annual Board Elections', description: '', startDate: new Date('2024-02-01'), endDate: new Date('2024-02-28'), status: 'completed', candidates: [], totalVotes: 87 }
        ];
    }

    getLeaderCandidates(): Candidate[] {
        return this.activeElection?.candidates.filter(c => c.position === 'leader') || [];
    }

    getBoardCandidates(): Candidate[] {
        return this.activeElection?.candidates.filter(c => c.position === 'board') || [];
    }

    isSelectedBoardMember(id: string): boolean {
        return this.selectedBoardMembers.includes(id);
    }

    toggleBoardMember(id: string) {
        const index = this.selectedBoardMembers.indexOf(id);
        if (index > -1) {
            this.selectedBoardMembers.splice(index, 1);
        } else if (this.selectedBoardMembers.length < 2) {
            this.selectedBoardMembers.push(id);
        }
    }

    getSelectedLeaderCandidate(): Candidate | undefined {
        return this.activeElection?.candidates.find(c => c.id === this.selectedLeader);
    }

    getCandidateById(id: string): Candidate | undefined {
        return this.activeElection?.candidates.find(c => c.id === id);
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
                    const leader = this.activeElection.candidates.find(c => c.id === this.selectedLeader);
                    if (leader) leader.votes++;
                    this.selectedBoardMembers.forEach(id => {
                        const candidate = this.activeElection!.candidates.find(c => c.id === id);
                        if (candidate) candidate.votes++;
                    });
                }
                this.messageService.add({ severity: 'success', summary: 'Vote Submitted', detail: 'Your vote has been recorded.', life: 3000 });
                this.activeTab = 0;
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
        this.newElection = { title: '', description: '', startDate: new Date(), endDate: new Date() };
        this.createElectionDialog = true;
    }

    createElection() {
        this.messageService.add({ severity: 'success', summary: 'Election Created', detail: 'New election has been created.', life: 3000 });
        this.createElectionDialog = false;
    }

    openManageCandidatesDialog() {
        this.newCandidate = { name: '', photo: '', biography: '', position: 'leader' };
        this.manageCandidatesDialog = true;
    }

    addCandidate() {
        const candidate: Candidate = {
            id: String(this.allCandidates.length + 1),
            name: this.newCandidate.name,
            photo: this.newCandidate.photo,
            biography: this.newCandidate.biography,
            position: this.newCandidate.position,
            votes: 0
        };
        this.allCandidates.push(candidate);
        if (this.activeElection) this.activeElection.candidates.push(candidate);
        this.messageService.add({ severity: 'success', summary: 'Candidate Added', detail: `${candidate.name} added.`, life: 3000 });
        this.newCandidate = { name: '', photo: '', biography: '', position: 'leader' };
    }

    deleteCandidate(id: string) {
        this.confirmationService.confirm({
            message: 'Delete this candidate?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.allCandidates = this.allCandidates.filter(c => c.id !== id);
                if (this.activeElection) this.activeElection.candidates = this.activeElection.candidates.filter(c => c.id !== id);
                this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Candidate removed.', life: 3000 });
            }
        });
    }

    viewElectionResults(election: Election) {
        this.messageService.add({ severity: 'info', summary: 'Results', detail: `Viewing ${election.title}`, life: 3000 });
    }
}
