import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabsModule } from 'primeng/tabs';
import { DragDropModule } from 'primeng/dragdrop';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { ProjectsService } from '../../service/projects.service';
import { AuthService, DEFAULT_AVATAR } from '../../service/auth.service';
import { environment } from '@environments/environment.prod';

interface Member {
    id?: string;
    userId?: string;
    name: string;
    avatar: string;
    role: string;
}

interface Resource {
    id: number;
    title: string;
    url: string;
    description: string;
    type: 'documentation' | 'tutorial' | 'tool' | 'reference' | 'other';
}

interface Objective {
    id: number;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'completed';
    assignedTo: Member;
    members?: Member[];
    resources?: Resource[];
}

interface Project {
    id: number;
    title: string;
    description: string;
    status: 'upcoming' | 'in-progress' | 'completed';
    startDate: string;
    endDate: string;
    progress: number;
    participants: Member[];
    objectives: Objective[];
    resources?: Resource[];
    githubRepo?: string; // GitHub repository URL for tracking commits
}

interface GitHubCommit {
    sha: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
    };
    html_url: string;
    author?: {
        login: string;
        avatar_url: string;
    };
}

interface GitHubRepo {
    name: string;
    full_name: string;
    html_url: string;
    updated_at: string;
}

@Component({
    selector: 'app-projects',
    imports: [CommonModule, FormsModule, ButtonModule, TagModule, AvatarModule, AvatarGroupModule, DividerModule, ProgressBarModule, TabsModule, DragDropModule, DialogModule, InputTextModule, TextareaModule, SelectModule, DatePickerModule, ConfirmDialogModule, MultiSelectModule, TooltipModule],
    providers: [ConfirmationService],
    template: `
        <p-confirmdialog></p-confirmdialog>
        
        <p-dialog [(visible)]="dialogVisible" [header]="dialogMode === 'add' ? 'New Project' : 'Edit Project'" [modal]="true" [style]="{width: '50rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body" [maximizable]="true">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="projectName" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Project Name</label>
                    <input pInputText id="projectName" [(ngModel)]="currentProject.title" class="w-full" />
                </div>

                <div class="flex flex-col md:flex-row align-center justify-between">
                    <div class="">
                        <label for="startDate" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Start Date</label>
                        <p-datepicker id="startDate" [(ngModel)]="startDate" dateFormat="M d, yy" [showIcon]="true" class="w-full" />
                    </div>
                    
                    <div class="">
                        <label for="endDate" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">End Date</label>
                        <p-datepicker id="endDate" [(ngModel)]="endDate" dateFormat="M d, yy" [showIcon]="true" class="w-full" />
                    </div>
                </div>
                
                <div>
                    <label for="description" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Description</label>
                    <textarea pInputTextarea id="description" [(ngModel)]="currentProject.description" [rows]="4" class="w-full"></textarea>
                </div>
                
                <!-- <div>
                    <label for="teamMembers" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Team Members</label>
                    <p-multiselect 
                        id="teamMembers" 
                        [(ngModel)]="selectedMemberNames" 
                        [options]="availableMembers" 
                        optionLabel="name" 
                        optionValue="name"
                        placeholder="Select Team Members" 
                        class="w-full"
                        [showClear]="true"
                        display="chip"
                    />
                </div> -->
                
                <div>
                    <label for="status" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Status</label>
                    <p-select id="status" [(ngModel)]="currentProject.status" [options]="statusOptions" placeholder="Select Status" class="w-full" />
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="dialogVisible = false" />
                <p-button [label]="dialogMode === 'add' ? 'Create' : 'Save'" (onClick)="saveProject()" [disabled]="dialogMode === 'add' && !isProjectFormValid()" />
            </div>
        </p-dialog>
        
        <p-dialog [(visible)]="objectiveDialogVisible" [header]="objectiveDialogMode === 'add' ? 'New Objective' : 'Edit Objective'" [modal]="true" [style]="{width: '40rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body" [maximizable]="true">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="objectiveTitle" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Title</label>
                    <input pInputText id="objectiveTitle" [(ngModel)]="currentObjective.title" class="w-full" />
                </div>
                
                <div>
                    <label for="objectiveDescription" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Description</label>
                    <textarea pInputTextarea id="objectiveDescription" [(ngModel)]="currentObjective.description" [rows]="3" class="w-full"></textarea>
                </div>
                
                <div>
                    <label for="objectiveStatus" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Status</label>
                    <p-select id="objectiveStatus" [(ngModel)]="currentObjective.status" [options]="objectiveStatusOptions" placeholder="Select Status" class="w-full" />
                </div>
                
                <div>
                    <label for="objectiveMembers" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Team Members</label>
                    <p-multiSelect id="objectiveMembers" [(ngModel)]="selectedObjectiveMemberNames" [options]="getProjectParticipantsForObjective()" optionLabel="name" optionValue="name" placeholder="Select Team Members" display="chip" class="w-full" />
                    <p class="flex gap-1 text-xs text-muted-color mt-2"><i class="pi pi-info-circle"></i> Only project members can be assigned to objectives</p>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="objectiveDialogVisible = false" />
                <p-button [label]="objectiveDialogMode === 'add' ? 'Create' : 'Save'" (onClick)="saveObjective()" [disabled]="objectiveDialogMode === 'add' && !isObjectiveFormValid()" />
            </div>
        </p-dialog> 
        
        <!-- Resource Dialog -->
        <p-dialog [(visible)]="resourceDialogVisible" [header]="resourceDialogMode === 'add' ? 'Add Resource' : 'Edit Resource'" [modal]="true" [style]="{width: '40rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="resourceTitle" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Title</label>
                    <input pInputText id="resourceTitle" [(ngModel)]="currentResource.title" class="w-full" />
                </div>
                
                <div>
                    <label for="resourceUrl" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">URL</label>
                    <input pInputText id="resourceUrl" [(ngModel)]="currentResource.url" placeholder="https://example.com" class="w-full" />
                </div>
                
                <div>
                    <label for="resourceDescription" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Description</label>
                    <textarea pInputTextarea id="resourceDescription" [(ngModel)]="currentResource.description" [rows]="2" class="w-full"></textarea>
                </div>
                
                <div>
                    <label for="resourceType" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Type</label>
                    <p-select id="resourceType" [(ngModel)]="currentResource.type" [options]="resourceTypeOptions" placeholder="Select Type" class="w-full" />
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="resourceDialogVisible = false" />
                <p-button [label]="resourceDialogMode === 'add' ? 'Add' : 'Save'" (onClick)="saveResource()" />
            </div>
        </p-dialog>
        
        <!-- Objective Detail Dialog -->
        <p-dialog [(visible)]="objectiveDetailDialogVisible" [header]="viewingObjective?.title" [modal]="true" [style]="{width: '50rem'}" [contentStyle]="{'max-height': '80vh', 'overflow': 'auto'}" appendTo="body" [maximizable]="true">
            <div *ngIf="viewingObjective" class="flex flex-col gap-5">
                <!-- Status and Progress
                <div class="flex items-center justify-between">
                    <p-tag 
                        [value]="viewingObjective.status === 'todo' ? 'To Do' : viewingObjective.status === 'in-progress' ? 'In Progress' : 'Completed'" 
                        [severity]="getObjectiveStatusSeverity(viewingObjective.status)"
                        styleClass="text-sm"
                    ></p-tag>
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-muted-color">Progress</span>
                        <div class="flex items-center gap-2">
                            <div style="width: 120px;">
                                <p-progressbar [value]="viewingObjective.progress" [showValue]="false"></p-progressbar>
                            </div>
                            <span class="font-semibold">{{ viewingObjective.progress }}%</span>
                        </div>
                    </div>
                </div> -->
                
                <!-- Description -->
                <!-- <div>
                    <h6 class="text-sm font-semibold text-muted-color mb-2 tracking-wide">Description</h6>
                    <p class="text-surface-700 dark:text-surface-300 leading-relaxed m-0">{{ viewingObjective.description || 'No description provided.' }}</p>
                </div> -->
                
                <p-divider></p-divider>
                
                <!-- Team Members -->
                <div>
                    <div class="flex justify-between items-center mb-3">
                        <h6 class="text-sm font-semibold text-muted-color m-0 tracking-wide">Team Members</h6>
                        <p-button icon="pi pi-user-plus" label="Assign Members" size="small" [text]="true" (onClick)="openAssignMembersToObjectiveFromDetail()" />
                    </div>
                    <div *ngIf="viewingObjective.members && viewingObjective.members.length > 0" class="flex flex-col gap-3">
                        <div *ngFor="let member of viewingObjective.members" class="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                            <p-avatar [image]="member.avatar" shape="circle" size="large"></p-avatar>
                            <div class="flex-1">
                                <p class="font-semibold text-surface-900 dark:text-surface-0 m-0">{{ member.name }}</p>
                                <p class="text-sm text-muted-color m-0">{{ member.role }}</p>
                            </div>
                            <p-button icon="pi pi-times" size="small" [text]="true" [rounded]="true" severity="danger" pTooltip="Remove Member" (onClick)="removeMemberFromObjectiveDetail(member)" />
                        </div>
                    </div>
                    <div *ngIf="!viewingObjective.members || viewingObjective.members.length === 0" class="text-center text-muted-color py-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <i class="pi pi-users text-2xl mb-2"></i>
                        <p class="m-0">No team members assigned yet</p>
                    </div>
                </div>
                
                <p-divider></p-divider>
                
                <!-- Resources -->
                <div>
                    <div class="flex justify-between items-center mb-3">
                        <h6 class="text-sm font-semibold text-muted-color m-0 tracking-wide">Resources</h6>
                        <p-button icon="pi pi-plus" label="Add Resource" size="small" [text]="true" (onClick)="openAddObjectiveResourceDialog()" />
                    </div>
                    <div *ngIf="viewingObjective.resources && viewingObjective.resources.length > 0" class="flex flex-col gap-2">
                        <div *ngFor="let resource of viewingObjective.resources" class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex-1">
                                    <a [href]="resource.url" target="_blank" class="font-semibold text-primary hover:underline flex items-center gap-2">
                                        <i [class]="getResourceIcon(resource.type)"></i>
                                        {{ resource.title }}
                                        <i class="pi pi-external-link text-xs"></i>
                                    </a>
                                    <p class="text-sm text-muted-color m-0 mt-1">{{ resource.description }}</p>
                                </div>
                                <div class="flex gap-1">
                                    <p-button icon="pi pi-pencil" size="small" [text]="true" severity="secondary" (onClick)="openEditObjectiveResourceDialog(resource)" />
                                    <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (onClick)="confirmDeleteObjectiveResource(resource)" />
                                </div>
                            </div>
                            <p-tag [value]="resource.type" severity="secondary" styleClass="text-xs"></p-tag>
                        </div>
                    </div>
                    <div *ngIf="!viewingObjective.resources || viewingObjective.resources.length === 0" class="text-center text-muted-color py-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <i class="pi pi-link text-2xl mb-2"></i>
                        <p class="m-0">No resources added yet</p>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-between gap-2 mt-6">
                <div class="flex gap-2">
                    @if (viewingObjective && !isUserInObjective(viewingObjective)) {
                        <p-button label="Join Objective" icon="pi pi-user-plus" [outlined]="true" (onClick)="joinObjectiveFromDetail()" />
                    } @else if (viewingObjective) {
                        <p-button label="Leave Objective" icon="pi pi-user-minus" [outlined]="true" severity="warn" (onClick)="leaveObjectiveFromDetail()" />
                    }
                </div>
                <div class="flex gap-2">
                    <p-button label="Edit" icon="pi pi-pencil" severity="secondary" (onClick)="editObjectiveFromDetail()" />
                    <p-button label="Close" severity="secondary" [outlined]="true" (onClick)="objectiveDetailDialogVisible = false" />
                </div>
            </div>
        </p-dialog>
        
        <!-- Objective Resource Dialog -->
        <p-dialog [(visible)]="objectiveResourceDialogVisible" [header]="objectiveResourceDialogMode === 'add' ? 'Add Resource to Objective' : 'Edit Resource'" [modal]="true" [style]="{width: '35rem'}" appendTo="body">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="objResourceTitle" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Title</label>
                    <input pInputText id="objResourceTitle" [(ngModel)]="currentObjectiveResource.title" class="w-full" />
                </div>
                
                <div>
                    <label for="objResourceUrl" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">URL</label>
                    <input pInputText id="objResourceUrl" [(ngModel)]="currentObjectiveResource.url" placeholder="https://example.com" class="w-full" />
                </div>
                
                <div>
                    <label for="objResourceDescription" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Description</label>
                    <textarea pInputTextarea id="objResourceDescription" [(ngModel)]="currentObjectiveResource.description" [rows]="2" class="w-full"></textarea>
                </div>
                
                <div>
                    <label for="objResourceType" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Type</label>
                    <p-select id="objResourceType" [(ngModel)]="currentObjectiveResource.type" [options]="resourceTypeOptions" placeholder="Select Type" class="w-full" />
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="objectiveResourceDialogVisible = false" />
                <p-button [label]="objectiveResourceDialogMode === 'add' ? 'Add' : 'Save'" (onClick)="saveObjectiveResource()" />
            </div>
        </p-dialog>
        
        <!-- Assign Members to Project Dialog -->
        <p-dialog [(visible)]="assignMembersToProjectDialogVisible" header="Assign Members to Project" [modal]="true" [style]="{width: '40rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body">
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Select Team Members</label>
                    <p-multiselect 
                        [(ngModel)]="tempSelectedProjectMembers" 
                        [options]="availableMembers" 
                        optionLabel="name" 
                        optionValue="name"
                        placeholder="Select members to assign" 
                        class="w-full"
                        [showClear]="true"
                        display="chip"
                    >
                        <ng-template let-member pTemplate="item">
                            <div class="flex items-center gap-2">
                                <p-avatar [image]="member.avatar" shape="circle" size="normal"></p-avatar>
                                <div>
                                    <span class="font-medium">{{ member.name }}</span>
                                    <span class="text-xs text-muted-color ml-2">{{ member.role }}</span>
                                </div>
                            </div>
                        </ng-template>
                    </p-multiselect>
                </div>
                
                <div *ngIf="selectedProject?.participants?.length" class="mt-2">
                    <p class="text-sm text-muted-color mb-2">Current team members:</p>
                    <div class="flex flex-wrap gap-2">
                        <div *ngFor="let member of selectedProject?.participants" class="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 rounded-full pl-3 pr-1 py-1">
                            <p-avatar [image]="member.avatar" shape="circle" size="normal"></p-avatar>
                            <span class="text-sm">{{ member.name }}</span>
                            <p-button icon="pi pi-times" size="small" [text]="true" [rounded]="true" severity="danger" (onClick)="removeProjectMemberFromDialog(member)" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="assignMembersToProjectDialogVisible = false" />
                <p-button label="Save" (onClick)="saveProjectMembers()" />
            </div>
        </p-dialog> 
        
        <!-- Assign Members to Objective Dialog -->
        <p-dialog [(visible)]="assignMembersToObjectiveDialogVisible" [header]="'Assign Members to: ' + (assigningObjective?.title || '')" [modal]="true" [style]="{width: '40rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body">
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Select Team Members</label>
                    <p-multiselect 
                        [(ngModel)]="tempSelectedObjectiveMembers" 
                        [options]="getProjectParticipantsForObjective()" 
                        optionLabel="name" 
                        optionValue="name"
                        placeholder="Select project members to assign" 
                        class="w-full"
                        [showClear]="true"
                        display="chip"
                    >
                        <ng-template let-member pTemplate="item">
                            <div class="flex items-center gap-2">
                                <p-avatar [image]="member.avatar" shape="circle" size="normal"></p-avatar>
                                <div>
                                    <span class="font-medium">{{ member.name }}</span>
                                    <span class="text-xs text-muted-color ml-2">{{ member.role }}</span>
                                </div>
                            </div>
                        </ng-template>
                    </p-multiselect>
                    <p class="text-xs text-muted-color mt-5">Only project participants can be assigned to objectives</p>
                </div>
                
                <div *ngIf="assigningObjective?.members?.length" class="mt-2">
                    <p class="text-sm text-muted-color mb-2">Currently assigned:</p>
                    <div class="flex flex-wrap gap-2">
                        <div *ngFor="let member of assigningObjective?.members" class="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 rounded-full pl-3 pr-1 py-1">
                            <p-avatar [image]="member.avatar" shape="circle" size="normal"></p-avatar>
                            <span class="text-sm">{{ member.name }}</span>
                            <p-button icon="pi pi-times" size="small" [text]="true" [rounded]="true" severity="danger" (onClick)="removeObjectiveMemberFromDialog(member)" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="assignMembersToObjectiveDialogVisible = false" />
                <p-button label="Save" (onClick)="saveObjectiveMembers()" />
            </div>
        </p-dialog>
        
        <div class="card">
            <div class="flex justify-end items-center mb-6">
                <p-button label="New Project" icon="pi pi-plus" size="small" (onClick)="openAddDialog()"></p-button>
            </div>

            <!-- Kanban-style Board -->
            <div class="grid grid-cols-12 gap-4">
                <!-- Upcoming Column -->
                <div class="col-span-12 md:col-span-4">
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4" pDroppable="projects" (onDrop)="onDrop($event, 'upcoming')">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-lg m-0">Upcoming</h3>
                            <p-tag [value]="getProjectsByStatus('upcoming').length.toString()" severity="warn"></p-tag>
                        </div>
                        <div class="flex flex-col gap-3 min-h-32">
                            <div *ngFor="let project of getProjectsByStatus('upcoming')" pDraggable="projects" (onDragStart)="dragStart(project)" (onDragEnd)="dragEnd()" class="bg-surface-0 dark:bg-surface-900 border border-surface rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" (click)="selectProject(project)">
                                <div class="flex justify-between items-start mb-3">
                                    <h4 class="text-base font-semibold text-surface-900 dark:text-surface-0 m-0">
                                        {{ project.title }}
                                    </h4>
                                    <div class="flex justify-content-center align-content-end">
                                        <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" (onClick)="openEditDialog(project); $event.stopPropagation()" />
                                        <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDeleteProject(project)" />
                                    </div>
                                </div>

                                <p class="text-surface-700 dark:text-surface-300 text-sm mb-3 line-clamp-2">
                                    {{ project.description }}
                                </p>

                                <div class="flex items-center gap-2 text-xs text-muted-color mb-3">
                                    <i class="pi pi-calendar"></i>
                                    <span>Starts {{ project.startDate }}</span>
                                </div>

                                <div class="mb-3">
                                    <p-button 
                                        *ngIf="!isUserMember(project)"
                                        label="Join"
                                        icon="pi pi-user-plus"
                                        size="small"
                                        [outlined]="true"
                                        (onClick)="joinProject(project, $event)"
                                        styleClass="w-full"
                                    />
                                    <p-button 
                                        *ngIf="isUserMember(project)"
                                        label="Leave"
                                        icon="pi pi-user-minus"
                                        size="small"
                                        [outlined]="true"
                                        severity="danger"
                                        (onClick)="leaveProject(project, $event)"
                                        styleClass="w-full"
                                    />
                                </div>

                                <p-divider></p-divider>

                                <div class="mt-3">
                                    <p class="text-xs text-muted-color mb-2">Team</p>
                                    <p-avatargroup>
                                        <p-avatar 
                                            *ngFor="let member of project.participants.slice(0, 3)" 
                                            [image]="member.avatar" 
                                            shape="circle"
                                            size="normal"
                                        ></p-avatar>
                                        <p-avatar 
                                            *ngIf="project.participants.length > 3"
                                            [label]="'+' + (project.participants.length - 3)" 
                                            shape="circle"
                                            size="normal"
                                            [style]="{'background-color': 'var(--primary-color)', 'color': 'var(--primary-color-text)'}"
                                        ></p-avatar>
                                    </p-avatargroup>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- In Progress Column -->
                <div class="col-span-12 md:col-span-4">
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4" pDroppable="projects" (onDrop)="onDrop($event, 'in-progress')">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-lg m-0">In Progress</h3>
                            <p-tag [value]="getProjectsByStatus('in-progress').length.toString()" severity="info"></p-tag>
                        </div>
                        <div class="flex flex-col gap-3 min-h-32">
                            <div *ngFor="let project of getProjectsByStatus('in-progress')" pDraggable="projects" (onDragStart)="dragStart(project)" (onDragEnd)="dragEnd()" class="bg-surface-0 dark:bg-surface-900 border border-surface rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" (click)="selectProject(project)">
                                <div class="flex justify-between items-start mb-3">
                                    <h4 class="text-base font-semibold text-surface-900 dark:text-surface-0 m-0">
                                        {{ project.title }}
                                    </h4>
                                    <div class="flex justify-content-center align-content-end">
                                    <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" (onClick)="openEditDialog(project); $event.stopPropagation()" />
                                    <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDeleteProject(project)" />
                                    </div>
                                </div>

                                <p class="text-surface-700 dark:text-surface-300 text-sm mb-3 line-clamp-2">
                                    {{ project.description }}
                                </p>

                                <div class="mb-3">
                                    <div class="flex justify-between text-xs mb-2">
                                        <span class="text-muted-color">Progress</span>
                                        <span class="font-semibold">{{ project.progress }}%</span>
                                    </div>
                                    <p-progressbar [value]="project.progress" [showValue]="false"></p-progressbar>
                                </div>

                                <div class="mb-3">
                                    <p-button 
                                        *ngIf="!isUserMember(project)"
                                        label="Join"
                                        icon="pi pi-user-plus"
                                        size="small"
                                        [outlined]="true"
                                        (onClick)="joinProject(project, $event)"
                                        styleClass="w-full"
                                    />
                                    <p-button 
                                        *ngIf="isUserMember(project)"
                                        label="Leave"
                                        icon="pi pi-user-minus"
                                        size="small"
                                        [outlined]="true"
                                        severity="danger"
                                        (onClick)="leaveProject(project, $event)"
                                        styleClass="w-full"
                                    />
                                </div>

                                <p-divider></p-divider>

                                <div class="mt-3">
                                    <p class="text-xs text-muted-color mb-2">Team</p>
                                    <p-avatargroup>
                                        <p-avatar 
                                            *ngFor="let member of project.participants.slice(0, 3)" 
                                            [image]="member.avatar" 
                                            shape="circle"
                                            size="normal"
                                        ></p-avatar>
                                        <p-avatar 
                                            *ngIf="project.participants.length > 3"
                                            [label]="'+' + (project.participants.length - 3)" 
                                            shape="circle"
                                            size="normal"
                                            [style]="{'background-color': 'var(--primary-color)', 'color': 'var(--primary-color-text)'}"
                                        ></p-avatar>
                                    </p-avatargroup>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Completed Column -->
                <div class="col-span-12 md:col-span-4">
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4" [ngClass]="{'border-2 border-dashed border-orange-400': showCompletedWarning}" pDroppable="projects" (onDrop)="onDrop($event, 'completed')">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-lg m-0">Completed</h3>
                            <p-tag [value]="getProjectsByStatus('completed').length.toString()" severity="success"></p-tag>
                        </div>
                        <!-- Warning message when dragging incomplete project -->
                        <div *ngIf="showCompletedWarning" class="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg p-3 mb-3 flex items-center gap-2">
                            <i class="pi pi-exclamation-triangle text-orange-500"></i>
                            <span class="text-sm text-orange-700 dark:text-orange-300">All project objectives must be completed first</span>
                        </div>
                        <div class="flex flex-col gap-3 min-h-32">
                            <div *ngFor="let project of getProjectsByStatus('completed')" pDraggable="projects" (onDragStart)="dragStart(project)" (onDragEnd)="dragEnd()" class="bg-surface-0 dark:bg-surface-900 border border-surface rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" (click)="selectProject(project)">
                                <div class="flex justify-between items-start mb-3">
                                    <div class="flex items-baseline gap-2 flex-1">
                                        <h4 class="text-base font-semibold text-surface-900 dark:text-surface-0 m-0">
                                            {{ project.title }}
                                        </h4>
                                        <!-- <i class="pi pi-check-circle text-green-500 text-xl"></i> -->
                                    </div>
                                    <div class="flex justify-content-center align-content-end">
                                        <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" (onClick)="openEditDialog(project); $event.stopPropagation()" />
                                        <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDeleteProject(project)" />
                                    </div>
                                </div>

                                <p class="text-surface-700 dark:text-surface-300 text-sm mb-3 line-clamp-2">
                                    {{ project.description }}
                                </p>

                                <div class="flex items-center gap-2 text-xs text-muted-color mb-3">
                                    <i class="pi pi-calendar"></i>
                                    <span>Completed {{ project.endDate }}</span>
                                </div>

                                <div class="mb-3">
                                    <div class="flex justify-between text-xs mb-2">
                                        <span class="text-muted-color">Progress</span>
                                        <span class="font-semibold">{{ project.progress }}%</span>
                                    </div>
                                    <p-progressbar [value]="project.progress" [showValue]="false"></p-progressbar>
                                </div>

                                <p-divider></p-divider>

                                <div class="mt-3">
                                    <p class="text-xs text-muted-color mb-2">Team</p>
                                    <p-avatargroup>
                                        <p-avatar 
                                            *ngFor="let member of project.participants.slice(0, 3)" 
                                            [image]="member.avatar" 
                                            shape="circle"
                                            size="normal"
                                        ></p-avatar>
                                        <p-avatar 
                                            *ngIf="project.participants.length > 3"
                                            [label]="'+' + (project.participants.length - 3)" 
                                            shape="circle"
                                            size="normal"
                                            [style]="{'background-color': 'var(--primary-color)', 'color': 'var(--primary-color-text)'}"
                                        ></p-avatar>
                                    </p-avatargroup>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Project Details Modal/Section -->
            <div *ngIf="selectedProject" class="mt-8 border-t border-surface pt-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">{{ selectedProject.title }}</h2>
                    <div class="flex gap-2">
                        <p-button label="Edit" icon="pi pi-pencil" severity="secondary" [outlined]="true" (onClick)="openEditDialog(selectedProject)" />
                        <p-button label="Delete" icon="pi pi-trash" severity="danger" [outlined]="true" (onClick)="confirmDeleteProject(selectedProject)" />
                        <p-button icon="pi pi-times" [text]="true" [rounded]="true" (onClick)="selectedProject = null"></p-button>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12 lg:col-span-8">
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold m-0">Objectives</h3>
                                <p-button label="Add Objective" icon="pi pi-plus" size="small" (onClick)="openAddObjectiveDialog()" />
                            </div>
                            
                            <!-- Kanban Board for Objectives -->
                            <div class="grid grid-cols-12 gap-4">
                                <!-- Todo Column -->
                                <div class="col-span-12 md:col-span-4">
                                    <div class="bg-surface-100 dark:bg-surface-800 rounded-lg p-3" pDroppable="objectives" (onDrop)="onDropObjective($event, 'todo')">
                                        <div class="flex items-center justify-between mb-3">
                                            <h4 class="font-semibold text-sm m-0 text-surface-600 dark:text-surface-400">To Do</h4>
                                            <p-tag [value]="getObjectivesByStatus('todo').length.toString()" severity="secondary" styleClass="text-xs"></p-tag>
                                        </div>
                                        <div class="flex flex-col gap-2 min-h-24">
                                            <div *ngFor="let objective of getObjectivesByStatus('todo')" 
                                                pDraggable="objectives" 
                                                (onDragStart)="dragStartObjective(objective)" 
                                                (onDragEnd)="dragEndObjective()"
                                                (click)="openObjectiveDetailDialog(objective)"
                                                class="bg-surface-0 dark:bg-surface-900 border border-surface rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                                                <div class="flex justify-between items-start mb-2">
                                                    <h5 class="font-semibold text-sm text-surface-900 dark:text-surface-0 m-0 flex-1">{{ objective.title }}</h5>
                                                    <div class="flex gap-1">
                                                        <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" (onClick)="openEditObjectiveDialog(objective); $event.stopPropagation()" />
                                                        <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDeleteObjective(objective); $event.stopPropagation()" />
                                                    </div>
                                                </div>
                                                <p class="text-xs text-surface-600 dark:text-surface-400 mb-2 line-clamp-2">{{ objective.description }}</p>
                                                <div class="flex items-center justify-between">
                                                    <div class="flex items-center gap-1">
                                                        @if (objective.members && objective.members.length > 0) {
                                                            <p-avatarGroup>
                                                                @for (member of objective.members.slice(0, 2); track member.name) {
                                                                    <p-avatar [image]="member.avatar" shape="circle" size="normal" [pTooltip]="member.name"></p-avatar>
                                                                }
                                                                @if (objective.members.length > 2) {
                                                                    <p-avatar [label]="'+' + (objective.members.length - 2)" shape="circle" size="normal" [style]="{'background-color': 'var(--primary-color)', 'color': 'var(--primary-color-text)', 'font-size': '0.7rem'}"></p-avatar>
                                                                }
                                                            </p-avatarGroup>
                                                        }
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        <p-button class="" icon="pi pi-users" size="small" [text]="true" [rounded]="true" severity="info" pTooltip="Assign Members" (onClick)="openAssignMembersToObjectiveDialog(objective, $event)" />
                                                        @if (!isUserInObjective(objective)) {
                                                            <p-button icon="pi pi-user-plus" size="small" [text]="true" [rounded]="true" severity="secondary" pTooltip="Join" (onClick)="joinObjective(objective, $event)" />
                                                        } @else {
                                                            <p-button icon="pi pi-user-minus" size="small" [text]="true" [rounded]="true" severity="warn" pTooltip="Leave" (onClick)="leaveObjective(objective, $event)" />
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- In Progress Column -->
                                <div class="col-span-12 md:col-span-4">
                                    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3" pDroppable="objectives" (onDrop)="onDropObjective($event, 'in-progress')">
                                        <div class="flex items-center justify-between mb-3">
                                            <h4 class="font-semibold text-sm m-0 text-blue-600 dark:text-blue-400">In Progress</h4>
                                            <p-tag [value]="getObjectivesByStatus('in-progress').length.toString()" severity="info" styleClass="text-xs"></p-tag>
                                        </div>
                                        <div class="flex flex-col gap-2 min-h-24">
                                            <div *ngFor="let objective of getObjectivesByStatus('in-progress')" 
                                                pDraggable="objectives" 
                                                (onDragStart)="dragStartObjective(objective)" 
                                                (onDragEnd)="dragEndObjective()"
                                                (click)="openObjectiveDetailDialog(objective)"
                                                class="bg-surface-0 dark:bg-surface-900 border border-blue-200 dark:border-blue-800 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                                                <div class="flex justify-between items-start mb-2">
                                                    <h5 class="font-semibold text-sm text-surface-900 dark:text-surface-0 m-0 flex-1">{{ objective.title }}</h5>
                                                    <div class="flex gap-1">
                                                        <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" (onClick)="openEditObjectiveDialog(objective); $event.stopPropagation()" />
                                                        <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDeleteObjective(objective); $event.stopPropagation()" />
                                                    </div>
                                                </div>
                                                <p class="text-xs text-surface-600 dark:text-surface-400 mb-2 line-clamp-2">{{ objective.description }}</p>
                                                <div class="flex items-center justify-between">
                                                    <div class="flex items-center gap-1">
                                                        @if (objective.members && objective.members.length > 0) {
                                                            <p-avatarGroup>
                                                                @for (member of objective.members.slice(0, 2); track member.name) {
                                                                    <p-avatar [image]="member.avatar" shape="circle" size="normal" [pTooltip]="member.name"></p-avatar>
                                                                }
                                                                @if (objective.members.length > 2) {
                                                                    <p-avatar [label]="'+' + (objective.members.length - 2)" shape="circle" size="normal" [style]="{'background-color': 'var(--primary-color)', 'color': 'var(--primary-color-text)', 'font-size': '0.7rem'}"></p-avatar>
                                                                }
                                                            </p-avatarGroup>
                                                        }
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        <p-button icon="pi pi-users" size="small" [text]="true" [rounded]="true" severity="info" pTooltip="Assign Members" (onClick)="openAssignMembersToObjectiveDialog(objective, $event)" />
                                                        @if (!isUserInObjective(objective)) {
                                                            <p-button icon="pi pi-user-plus" size="small" [text]="true" [rounded]="true" severity="secondary" pTooltip="Join" (onClick)="joinObjective(objective, $event)" />
                                                        } @else {
                                                            <p-button icon="pi pi-user-minus" size="small" [text]="true" [rounded]="true" severity="warn" pTooltip="Leave" (onClick)="leaveObjective(objective, $event)" />
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Completed Column -->
                                <div class="col-span-12 md:col-span-4">
                                    <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3" pDroppable="objectives" (onDrop)="onDropObjective($event, 'completed')">
                                        <div class="flex items-center justify-between mb-3">
                                            <h4 class="font-semibold text-sm m-0 text-green-600 dark:text-green-400">Completed</h4>
                                            <p-tag [value]="getObjectivesByStatus('completed').length.toString()" severity="success" styleClass="text-xs"></p-tag>
                                        </div>
                                        <div class="flex flex-col gap-2 min-h-24">
                                            <div *ngFor="let objective of getObjectivesByStatus('completed')" 
                                                pDraggable="objectives" 
                                                (onDragStart)="dragStartObjective(objective)" 
                                                (onDragEnd)="dragEndObjective()"
                                                (click)="openObjectiveDetailDialog(objective)"
                                                class="bg-surface-0 dark:bg-surface-900 border border-green-200 dark:border-green-800 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                                                <div class="flex justify-between items-start mb-2">
                                                    <div class="flex items-center gap-2 flex-1">
                                                        <h5 class="font-semibold text-sm text-surface-900 dark:text-surface-0 m-0">{{ objective.title }}</h5>
                                                        <!-- <i class="pi pi-check-circle text-green-500 text-sm"></i> -->
                                                    </div>
                                                    <div class="flex gap-1">
                                                        <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" (onClick)="openEditObjectiveDialog(objective); $event.stopPropagation()" />
                                                        <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDeleteObjective(objective); $event.stopPropagation()" />
                                                    </div>
                                                </div>
                                                <p class="text-xs text-surface-600 dark:text-surface-400 mb-2 line-clamp-2">{{ objective.description }}</p>
                                                <div class="flex items-center justify-between">
                                                    <div class="flex items-center gap-1">
                                                        @if (objective.members && objective.members.length > 0) {
                                                            <p-avatarGroup>
                                                                @for (member of objective.members.slice(0, 2); track member.name) {
                                                                    <p-avatar [image]="member.avatar" shape="circle" size="normal" [pTooltip]="member.name"></p-avatar>
                                                                }
                                                                @if (objective.members.length > 2) {
                                                                    <p-avatar [label]="'+' + (objective.members.length - 2)" shape="circle" size="normal" [style]="{'background-color': 'var(--primary-color)', 'color': 'var(--primary-color-text)', 'font-size': '0.7rem'}"></p-avatar>
                                                                }
                                                            </p-avatarGroup>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-span-12 lg:col-span-4">
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold m-0">Team Members</h3>
                                <p-button *ngIf="selectedProject.status !== 'completed'" icon="pi pi-user-plus" size="small" [text]="true" [rounded]="true" pTooltip="Assign Members" (onClick)="openAssignMembersToProjectDialog()" />
                            </div>
                            <div class="flex flex-col gap-3">
                                <div *ngFor="let member of selectedProject.participants" class="flex items-center gap-3">
                                    <p-avatar [image]="member.avatar" shape="circle" size="large"></p-avatar>
                                    <div class="flex-1">
                                        <p class="font-semibold m-0">{{ member.name }}</p>
                                        <p class="text-sm text-muted-color m-0">{{ member.role }}</p>
                                    </div>
                                    <p-button *ngIf="selectedProject.status !== 'completed'" icon="pi pi-times" size="small" [text]="true" [rounded]="true" severity="danger" pTooltip="Remove Member" (onClick)="removeMemberFromProject(member)" />
                                </div>
                                <div *ngIf="!selectedProject.participants || selectedProject.participants.length === 0" class="text-center text-muted-color py-4">
                                    <i class="pi pi-users text-2xl mb-2"></i>
                                    <p class="m-0">No team members assigned yet</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-semibold m-0">Resources</h3>
                                <p-button icon="pi pi-plus" size="small" [text]="true" [rounded]="true" (onClick)="openAddResourceDialog()" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <div *ngFor="let resource of selectedProject.resources" class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                                    <div class="flex justify-between items-start mb-2">
                                        <div class="flex-1">
                                            <a [href]="resource.url" target="_blank" class="font-semibold text-primary hover:underline flex items-center gap-2">
                                                {{ resource.title }}
                                                <i class="pi pi-external-link text-xs"></i>
                                            </a>
                                            <p class="text-xs text-muted-color m-0 mt-1">{{ resource.description }}</p>
                                        </div>
                                        <div class="flex gap-1">
                                            <p-button icon="pi pi-pencil" size="small" [text]="true" severity="secondary" (onClick)="openEditResourceDialog(resource)" />
                                            <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (onClick)="confirmDeleteResource(resource)" />
                                        </div>
                                    </div>
                                    <p-tag [value]="resource.type" severity="secondary" styleClass="text-xs"></p-tag>
                                </div>
                                <div *ngIf="!selectedProject.resources || selectedProject.resources.length === 0" class="text-center text-muted-color text-sm py-4">
                                    No resources added yet
                                </div>
                            </div>
                        </div>

                        <!-- GitHub Commits Section -->
                        <div *ngIf="selectedProject.githubRepo">
                            <!-- <div class="flex justify-between items-center mb-4">
                                <div class="flex flex-col">
                                    <h3 class="text-lg font-semibold m-0 flex items-baseline gap-2">
                                        <i style="font-size: 1.5rem" class="pi pi-github text-xl"></i>
                                        GitHub Commits
                                    </h3>
                                    <span *ngIf="getTotalCommitsCount(selectedProject.id) > 0" class="text-xs text-muted-color">
                                        Showing {{ getTotalCommitsCount(selectedProject.id) }} commits
                                    </span>
                                </div>
                                <div class="flex gap-2">
                                    <p-button 
                                        icon="pi pi-refresh" 
                                        size="small" 
                                        [text]="true" 
                                        [rounded]="true" 
                                        (onClick)="loadGithubCommits(selectedProject)"
                                        [loading]="isLoadingGithubCommits(selectedProject.id)"
                                    />
                                    <a [href]="getGithubRepoUrl(selectedProject.githubRepo)" target="_blank">
                                        <p-button 
                                            icon="pi pi-external-link" 
                                            size="small" 
                                            [text]="true" 
                                            [rounded]="true"
                                            severity="secondary"
                                        />
                                    </a>
                                </div>
                            </div> -->

                            <div class="flex flex-col gap-2">
                                <!-- <div *ngIf="isLoadingGithubCommits(selectedProject.id)" class="text-center text-muted-color text-sm py-4">
                                    <i class="pi pi-spin pi-spinner"></i> Loading commits...
                                </div> -->

                                <!-- <div *ngIf="getGithubError(selectedProject.id)" class="text-center text-red-500 text-sm py-4">
                                    <i class="pi pi-exclamation-triangle"></i>
                                    {{ getGithubError(selectedProject.id) }}
                                </div> -->

                                <div *ngIf="!isLoadingGithubCommits(selectedProject.id) && !getGithubError(selectedProject.id)">
                                    <!-- <div *ngFor="let commit of getGithubCommits(selectedProject.id)" class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                                        <div class="flex items-start gap-3">
                                            <p-avatar 
                                                *ngIf="commit.author?.avatar_url; else defaultAvatar"
                                                [image]="commit.author!.avatar_url" 
                                                shape="circle" 
                                                size="normal"
                                            />
                                            <ng-template #defaultAvatar>
                                                <p-avatar 
                                                    icon="pi pi-user" 
                                                    shape="circle" 
                                                    size="normal"
                                                    styleClass="bg-surface-300"
                                                />
                                            </ng-template>
                                            
                                            <div class="flex-1 min-w-0">
                                                <a [href]="commit.html_url" target="_blank" class="text-sm font-medium text-surface-900 dark:text-surface-0 hover:text-primary hover:underline line-clamp-2">
                                                    {{ truncateCommitMessage(commit.commit.message) }}
                                                </a>
                                                <div class="flex items-center gap-2 mt-1 text-xs text-muted-color">
                                                    <span>{{ commit.author?.login || commit.commit.author.name }}</span>
                                                    <span>•</span>
                                                    <span>{{ formatCommitDate(commit.commit.author.date) }}</span>
                                                </div>
                                                <div class="text-xs text-muted-color font-mono mt-1">
                                                    {{ commit.sha.substring(0, 7) }}
                                                </div>
                                            </div>
                                        </div>
                                    </div> -->

                                    <!-- Load More Button -->
                                    <!-- <div *ngIf="getGithubCommits(selectedProject.id).length > 0 && hasMoreCommits(selectedProject.id)" class="text-center py-3">
                                        <p-button 
                                            label="Load More Commits" 
                                            icon="pi pi-chevron-down" 
                                            size="small"
                                            [outlined]="true"
                                            [loading]="isLoadingMoreCommits(selectedProject.id)"
                                            (onClick)="loadMoreCommits(selectedProject)"
                                        />
                                    </div> -->

                                    <!-- Loading More Indicator -->
                                    <!-- <div *ngIf="isLoadingMoreCommits(selectedProject.id)" class="text-center text-muted-color text-sm py-3">
                                        <i class="pi pi-spin pi-spinner"></i> Loading more commits...
                                    </div> -->

                                    <!-- No commits found -->
                                    <!-- <div *ngIf="getGithubCommits(selectedProject.id).length === 0 && !isLoadingGithubCommits(selectedProject.id) && !getGithubError(selectedProject.id)" class="text-center text-muted-color text-sm py-4">
                                        <p-button 
                                            label="Load Commits" 
                                            icon="pi pi-github" 
                                            size="small"
                                            [outlined]="true"
                                            (onClick)="loadGithubCommits(selectedProject)"
                                        />
                                    </div> -->

                                    <!-- End of commits indicator -->
                                    <!-- <div *ngIf="getGithubCommits(selectedProject.id).length > 0 && !hasMoreCommits(selectedProject.id)" class="text-center text-muted-color text-xs py-2">
                                        <i class="pi pi-check-circle"></i> All commits loaded
                                    </div> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Projects {
    constructor(
        private confirmationService: ConfirmationService,
        private http: HttpClient,
        private projectsService: ProjectsService,
        private authService: AuthService
    ) {
        this.loadProjectsByStatus();
        this.loadAvailableMembers();
        this.loadCurrentUser();

        // Watch for auth user changes (handles page reload where user is loaded async)
        effect(() => {
            const user = this.authService.currentUser();
            if (user && (!this.currentUser.userId || this.currentUser.userId !== (user as any).id)) {
                this.loadCurrentUser();
            }
        });
    }

    // Projects loaded from API by status
    upcomingProjects: Project[] = [];
    inProgressProjects: Project[] = [];
    completedProjects: Project[] = [];
    isLoading = false;

    loadProjectsByStatus() {
        this.isLoading = true;
        
        // Load upcoming projects
        this.projectsService.getProjects('Upcoming').subscribe({
            next: (projects) => {
                console.log('Upcoming projects received:', projects);
                this.upcomingProjects = this.mapProjectsFromApi(projects);
            },
            error: (err) => console.error('Error loading upcoming projects:', err)
        });

        // Load in-progress projects
        this.projectsService.getProjects('InProgress').subscribe({
            next: (projects) => {
                console.log('InProgress projects received:', projects);
                this.inProgressProjects = this.mapProjectsFromApi(projects);
            },
            error: (err) => console.error('Error loading in-progress projects:', err)
        });

        // Load completed projects
        this.projectsService.getProjects('Completed').subscribe({
            next: (projects) => {
                console.log('Completed projects received:', projects);
                this.completedProjects = this.mapProjectsFromApi(projects);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading completed projects:', err);
                this.isLoading = false;
            }
        });
    }

    // Map API response to frontend Project interface
    mapProjectsFromApi(apiProjects: any[]): Project[] {
        return apiProjects.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            status: this.mapStatusFromApi(p.status),
            startDate: p.startDate,
            endDate: p.endDate,
            progress: p.progressPercentage || 0,
            participants: this.mapTeamMembersFromApi(p.teamMembers || []),
            objectives: p.objectives || [],
            resources: p.resources || [],
            githubRepo: p.githubRepo
        }));
    }

    // Map team members from API to frontend Member interface
    mapTeamMembersFromApi(teamMembers: any[]): Member[] {
        return teamMembers.map(tm => {
            let avatarUrl = DEFAULT_AVATAR;
            if (tm.profilePictureUrl) {
                avatarUrl = tm.profilePictureUrl.startsWith('http')
                    ? tm.profilePictureUrl
                    : `${environment.baseUrl}${tm.profilePictureUrl}`;
            }
            
            return {
                id: tm.id,
                userId: tm.userId,
                name: `${tm.firstName || ''} ${tm.lastName || ''}`.trim() || tm.email || 'Unknown',
                avatar: avatarUrl,
                role: tm.role || 'Member'
            };
        });
    }

    // Map API status (PascalCase) to frontend status (lowercase with hyphen)
    mapStatusFromApi(status: string): 'upcoming' | 'in-progress' | 'completed' {
        switch (status?.toLowerCase()) {
            case 'upcoming': return 'upcoming';
            case 'inprogress': return 'in-progress';
            case 'completed': return 'completed';
            default: return 'upcoming';
        }
    }
    
    // Current logged-in user (loaded from auth service)
    currentUser: Member = {
        userId: '',
        name: '',
        avatar: DEFAULT_AVATAR,
        role: 'Member'
    };

    loadCurrentUser() {
        const user = this.authService.currentUser();
        if (user) {
            const firstName = (user as any).firstName || '';
            const lastName = (user as any).lastName || '';
            const fullName = `${firstName} ${lastName}`.trim() || (user as any).fullName || user.email || '';
            
            let avatarUrl = DEFAULT_AVATAR;
            if ((user as any).profilePictureUrl) {
                avatarUrl = (user as any).profilePictureUrl.startsWith('http')
                    ? (user as any).profilePictureUrl
                    : `${environment.baseUrl}${(user as any).profilePictureUrl}`;
            }
            
            this.currentUser = {
                userId: (user as any).id || '',
                name: fullName,
                avatar: avatarUrl,
                role: user.roles?.[0] || user.role || 'Member'
            };
            console.log('Current user loaded:', this.currentUser);
        }
    }
    
    selectedProject: Project | null = null;
    draggedProject: Project | null = null;

    // Check if the dragged project cannot be moved to Completed (progress < 100%)
    get showCompletedWarning(): boolean {
        return this.draggedProject !== null && this.draggedProject.progress < 100;
    }
    dialogVisible = false;
    dialogMode: 'add' | 'edit' = 'add';
    currentProject: Project = this.getEmptyProject();
    startDate: Date | null = null;
    endDate: Date | null = null;
    
    objectiveDialogVisible = false;
    objectiveDialogMode: 'add' | 'edit' = 'add';
    currentObjective: Objective = this.getEmptyObjective();
    selectedMemberNames: string[] = [];
    selectedObjectiveMemberNames: string[] = [];
    
    // Objective drag and drop
    draggedObjective: Objective | null = null;
    
    // Objective detail dialog
    objectiveDetailDialogVisible = false;
    viewingObjective: Objective | null = null;
    
    // Objective resource dialog
    objectiveResourceDialogVisible = false;
    objectiveResourceDialogMode: 'add' | 'edit' = 'add';
    currentObjectiveResource: Resource = this.getEmptyResource();
    
    // Member assignment dialogs
    assignMembersToProjectDialogVisible = false;
    assignMembersToObjectiveDialogVisible = false;
    assigningObjective: Objective | null = null;
    tempSelectedProjectMembers: string[] = [];
    tempSelectedObjectiveMembers: string[] = [];
    
    resourceDialogVisible = false;
    resourceDialogMode: 'add' | 'edit' = 'add';
    currentResource: Resource = this.getEmptyResource();
    
    availableMembers: Member[] = [];
    
    loadAvailableMembers() {
        this.projectsService.getAllUsers().subscribe({
            next: (response) => {
                console.log('Users loaded:', response.users);
                this.availableMembers = response.users.map(user => ({
                    name: `${user.firstName} ${user.lastName}`.trim() || user.email,
                    avatar: user.profilePictureUrl || DEFAULT_AVATAR,
                    role: user.roles?.length > 0 ? user.roles[0] : 'Member'
                }));
            },
            error: (err) => {
                console.error('Error loading users:', err);
                // Keep availableMembers empty on error
            }
        });
    }
    
    statusOptions = [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' }
    ];
    
    objectiveStatusOptions = [
        { label: 'To Do', value: 'todo' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' }
    ];
    
    resourceTypeOptions = [
        { label: 'Documentation', value: 'documentation' },
        { label: 'Tutorial', value: 'tutorial' },
        { label: 'Tool', value: 'tool' },
        { label: 'Reference', value: 'reference' },
        { label: 'Other', value: 'other' }
    ];

    getProjectsByStatus(status: string): Project[] {
        switch (status) {
            case 'upcoming':
                return this.upcomingProjects;
            case 'in-progress':
                return this.inProgressProjects;
            case 'completed':
                return this.completedProjects;
            default:
                return [];
        }
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'secondary' {
        switch (status) {
            case 'completed': return 'success';
            case 'in-progress': return 'info';
            case 'upcoming': return 'warn';
            default: return 'secondary';
        }
    }

    getObjectiveStatusSeverity(status: string): 'success' | 'info' | 'secondary' {
        switch (status) {
            case 'completed': return 'success';
            case 'in-progress': return 'info';
            case 'todo': return 'secondary';
            default: return 'secondary';
        }
    }

    getObjectivesByStatus(status: 'todo' | 'in-progress' | 'completed'): Objective[] {
        if (!this.selectedProject) return [];
        return this.selectedProject.objectives.filter(o => o.status === status);
    }

    dragStartObjective(objective: Objective) {
        this.draggedObjective = objective;
    }

    dragEndObjective() {
        this.draggedObjective = null;
    }

    onDropObjective(event: any, newStatus: 'todo' | 'in-progress' | 'completed') {
        if (this.draggedObjective && this.selectedProject) {
            const oldStatus = this.draggedObjective.status;
            const objectiveId = this.draggedObjective.id;
            const objective = this.draggedObjective;
            
            // Map frontend status to backend status (PascalCase)
            const apiStatus = this.mapObjectiveStatusToApi(newStatus);
            
            console.log(`Objective "${this.draggedObjective.title}" status changed: ${oldStatus} -> ${newStatus}`);
            
            // Update status locally
            this.draggedObjective.status = newStatus;
            
            // Update the objective in the selected project's objectives array
            const objectiveIndex = this.selectedProject.objectives?.findIndex(o => o.id === this.draggedObjective!.id);
            if (objectiveIndex !== undefined && objectiveIndex >= 0 && this.selectedProject.objectives) {
                this.selectedProject.objectives[objectiveIndex].status = newStatus;
            }
            
            // Recalculate project progress based on completed objectives
            this.updateProjectProgress();
            
            // Send PATCH request to update status on backend
            this.projectsService.updateObjectiveStatus(objectiveId, apiStatus).subscribe({
                next: (response) => {
                    console.log('Objective status updated successfully:', response);
                },
                error: (err) => {
                    console.error('Error updating objective status:', err);
                    // Revert the UI change on error
                    this.revertObjectiveStatus(objective, oldStatus, newStatus);
                }
            });
            
            this.draggedObjective = null;
        }
    }

    // Map frontend objective status to API status (PascalCase)
    mapObjectiveStatusToApi(status: 'todo' | 'in-progress' | 'completed'): string {
        switch (status) {
            case 'todo': return 'Todo';
            case 'in-progress': return 'InProgress';
            case 'completed': return 'Completed';
            default: return 'Todo';
        }
    }

    // Revert objective status change on API error
    revertObjectiveStatus(objective: Objective, oldStatus: 'todo' | 'in-progress' | 'completed', newStatus: 'todo' | 'in-progress' | 'completed') {
        console.log(`Reverting objective "${objective.title}" status from ${newStatus} back to ${oldStatus}`);
        
        // Restore old status
        objective.status = oldStatus;
        
        // Update in the selected project's objectives array
        if (this.selectedProject?.objectives) {
            const objectiveIndex = this.selectedProject.objectives.findIndex(o => o.id === objective.id);
            if (objectiveIndex >= 0) {
                this.selectedProject.objectives[objectiveIndex].status = oldStatus;
            }
        }
        
        // Recalculate project progress after revert
        this.updateProjectProgress();
    }

    // Calculate and update project progress based on completed objectives
    updateProjectProgress() {
        if (!this.selectedProject || !this.selectedProject.objectives || this.selectedProject.objectives.length === 0) {
            return;
        }
        
        const totalObjectives = this.selectedProject.objectives.length;
        const completedObjectives = this.selectedProject.objectives.filter(o => o.status === 'completed').length;
        const newProgress = Math.round((completedObjectives / totalObjectives) * 100);
        
        this.selectedProject.progress = newProgress;
        
        // Also update the project in the appropriate status list
        const projectInList = [...this.upcomingProjects, ...this.inProgressProjects, ...this.completedProjects]
            .find(p => p.id === this.selectedProject!.id);
        
        if (projectInList) {
            projectInList.progress = newProgress;
        }
        
        console.log(`Project progress updated: ${completedObjectives}/${totalObjectives} = ${newProgress}%`);
    }

    dragStart(project: Project) {
        this.draggedProject = project;
    }

    dragEnd() {
        this.draggedProject = null;
    }

    onDrop(event: any, newStatus: 'upcoming' | 'in-progress' | 'completed') {
        if (this.draggedProject) {
            // Prevent moving to Completed if project progress is not 100%
            if (newStatus === 'completed' && this.draggedProject.progress < 100) {
                console.log(`Cannot move project "${this.draggedProject.title}" to Completed - progress is ${this.draggedProject.progress}%`);
                this.draggedProject = null;
                return;
            }
            
            const oldStatus = this.draggedProject.status;
            const projectId = this.draggedProject.id;
            const project = this.draggedProject;
            
            // Map frontend status to backend status (PascalCase)
            const apiStatus = this.mapStatusToApi(newStatus);
            
            console.log(`Project "${this.draggedProject.title}" status changed: ${oldStatus} -> ${newStatus}`);
            
            // Remove from old list
            this.upcomingProjects = this.upcomingProjects.filter(p => p.id !== this.draggedProject!.id);
            this.inProgressProjects = this.inProgressProjects.filter(p => p.id !== this.draggedProject!.id);
            this.completedProjects = this.completedProjects.filter(p => p.id !== this.draggedProject!.id);
            
            // Update project status locally
            this.draggedProject.status = newStatus;
            
            // Add to new list
            switch (newStatus) {
                case 'upcoming':
                    this.upcomingProjects.push(this.draggedProject);
                    break;
                case 'in-progress':
                    this.inProgressProjects.push(this.draggedProject);
                    break;
                case 'completed':
                    this.completedProjects.push(this.draggedProject);
                    break;
            }
            
            // Send PATCH request to update status on backend
            this.projectsService.updateProjectStatus(projectId, apiStatus).subscribe({
                next: (response) => {
                    console.log('Project status updated successfully:', response);
                },
                error: (err) => {
                    console.error('Error updating project status:', err);
                    // Revert the UI change on error
                    this.revertProjectStatus(project, oldStatus, newStatus);
                }
            });
            
            this.draggedProject = null;
        }
    }

    // Revert project status change on API error
    revertProjectStatus(project: Project, oldStatus: 'upcoming' | 'in-progress' | 'completed', newStatus: 'upcoming' | 'in-progress' | 'completed') {
        console.log(`Reverting project "${project.title}" status from ${newStatus} back to ${oldStatus}`);
        
        // Remove from new list
        switch (newStatus) {
            case 'upcoming':
                this.upcomingProjects = this.upcomingProjects.filter(p => p.id !== project.id);
                break;
            case 'in-progress':
                this.inProgressProjects = this.inProgressProjects.filter(p => p.id !== project.id);
                break;
            case 'completed':
                this.completedProjects = this.completedProjects.filter(p => p.id !== project.id);
                break;
        }
        
        // Restore old status
        project.status = oldStatus;
        
        // Add back to old list
        switch (oldStatus) {
            case 'upcoming':
                this.upcomingProjects.push(project);
                break;
            case 'in-progress':
                this.inProgressProjects.push(project);
                break;
            case 'completed':
                this.completedProjects.push(project);
                break;
        }
    }

    // Map frontend status (lowercase with hyphen) to API status (PascalCase)
    mapStatusToApi(status: 'upcoming' | 'in-progress' | 'completed'): string {
        switch (status) {
            case 'upcoming': return 'Upcoming';
            case 'in-progress': return 'InProgress';
            case 'completed': return 'Completed';
            default: return 'Upcoming';
        }
    }
    
    getEmptyProject(): Project {
        return {
            id: 0,
            title: '',
            description: '',
            status: 'upcoming',
            startDate: '',
            endDate: '',
            progress: 0,
            participants: [],
            objectives: []
        };
    }
    
    formatDate(date: Date): string {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
    
    openAddDialog() {
        this.dialogMode = 'add';
        this.currentProject = this.getEmptyProject();
        this.startDate = null;
        this.endDate = null;
        this.selectedMemberNames = [];
        this.dialogVisible = true;
    }
    
    openEditDialog(project: Project) {
        this.dialogMode = 'edit';
        this.currentProject = { ...project, participants: [...project.participants], objectives: [...project.objectives] };
        // Parse dates if they exist
        this.startDate = project.startDate ? new Date(project.startDate) : null;
        this.endDate = project.endDate ? new Date(project.endDate) : null;
        // Load current team member names
        this.selectedMemberNames = project.participants.map(p => p.name);
        this.dialogVisible = true;
    }

    isProjectFormValid(): boolean {
        return !!(
            this.currentProject.title?.trim() &&
            this.currentProject.description?.trim() &&
            this.startDate &&
            this.endDate
        );
    }

    isObjectiveFormValid(): boolean {
        return !!(
            this.currentObjective.title?.trim() &&
            this.currentObjective.description?.trim() &&
            this.currentObjective.status
        );
    }
    
    saveProject() {
        if (this.dialogMode === 'add') {
            if (!this.isProjectFormValid()) {
                return;
            }

            const payload = {
                title: this.currentProject.title.trim(),
                description: this.currentProject.description?.trim() || '',
                startDate: this.startDate?.toISOString() || '',
                endDate: this.endDate?.toISOString() || '',
                status: this.mapStatusToApi(this.currentProject.status)
            };

            this.projectsService.createProject(payload).subscribe({
                next: (createdProject) => {
                    const mappedProject = this.mapProjectFromApi(createdProject);

                    switch (mappedProject.status) {
                        case 'upcoming':
                            this.upcomingProjects.push(mappedProject);
                            break;
                        case 'in-progress':
                            this.inProgressProjects.push(mappedProject);
                            break;
                        case 'completed':
                            this.completedProjects.push(mappedProject);
                            break;
                    }

                    this.dialogVisible = false;
                    this.currentProject = this.getEmptyProject();
                    this.startDate = null;
                    this.endDate = null;
                    this.selectedMemberNames = [];
                },
                error: (err) => {
                    console.error('Error creating project:', err);
                }
            });

            return;
        }
    }
    
    confirmDeleteProject(project: Project) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteProject(project);
            }
        });
    }
    
    deleteProject(project: Project) {
        this.projectsService.deleteProject(project.id.toString()).subscribe({
            next: () => {
                // Remove from the appropriate list based on status
                switch (project.status) {
                    case 'upcoming':
                        this.upcomingProjects = this.upcomingProjects.filter(p => p.id !== project.id);
                        break;
                    case 'in-progress':
                        this.inProgressProjects = this.inProgressProjects.filter(p => p.id !== project.id);
                        break;
                    case 'completed':
                        this.completedProjects = this.completedProjects.filter(p => p.id !== project.id);
                        break;
                }
                
                // Clear selected project if it was deleted
                if (this.selectedProject?.id === project.id) {
                    this.selectedProject = null;
                }
                
                console.log('Project deleted successfully');
            },
            error: (err) => {
                console.error('Error deleting project:', err);
            }
        });
    }
    
    getEmptyObjective(): Objective {
        return {
            id: 0,
            title: '',
            description: '',
            status: 'todo',
            assignedTo: { name: 'Unassigned', avatar: DEFAULT_AVATAR, role: 'Member' },
            members: []
        };
    }
    
    openAddObjectiveDialog() {
        if (!this.selectedProject) return;
        this.objectiveDialogMode = 'add';
        this.currentObjective = this.getEmptyObjective();
        this.selectedObjectiveMemberNames = [];
        this.objectiveDialogVisible = true;
    }
    
    openEditObjectiveDialog(objective: Objective) {
        this.objectiveDialogMode = 'edit';
        this.currentObjective = { ...objective, assignedTo: { ...objective.assignedTo }, members: objective.members ? [...objective.members] : [] };
        this.selectedObjectiveMemberNames = objective.members ? objective.members.map(m => m.name) : [];
        this.objectiveDialogVisible = true;
    }
    
    saveObjective() {
        return;
    }
    
    confirmDeleteObjective(objective: Objective) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${objective.title}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteObjective(objective);
            }
        });
    }
    
    deleteObjective(objective: Objective) {
        return;
    }
    
    isUserMember(project: Project): boolean {
        return project.participants.some(p => p.userId === this.currentUser.userId);
    }
    
    joinProject(project: Project, event: Event) {
        event.stopPropagation();
        if (!this.isUserMember(project)) {
            this.projectsService.joinProject(project.id).subscribe({
                next: (response) => {
                    console.log('Successfully joined project:', response);
                    project.participants.push({ ...this.currentUser });
                },
                error: (err) => {
                    console.error('Error joining project:', err);
                }
            });
        }
    }
    
    leaveProject(project: Project, event: Event) {
        event.stopPropagation();
        this.projectsService.leaveProject(project.id).subscribe({
            next: (response) => {
                console.log('Successfully left project:', response);
                project.participants = project.participants.filter(p => p.userId !== this.currentUser.userId);
            },
            error: (err) => {
                console.error('Error leaving project:', err);
            }
        });
    }
    
    getEmptyResource(): Resource {
        return {
            id: 0,
            title: '',
            url: '',
            description: '',
            type: 'documentation'
        };
    }
    
    openAddResourceDialog() {
        if (!this.selectedProject) return;
        this.resourceDialogMode = 'add';
        this.currentResource = this.getEmptyResource();
        this.resourceDialogVisible = true;
    }
    
    openEditResourceDialog(resource: Resource) {
        this.resourceDialogMode = 'edit';
        this.currentResource = { ...resource };
        this.resourceDialogVisible = true;
    }
    
    saveResource() {
       return;
    }
    
    confirmDeleteResource(resource: Resource) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${resource.title}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteResource(resource);
            }
        });
    }
    
    deleteResource(resource: Resource) {
       return;
    }
    
    isUserInObjective(objective: Objective): boolean {
        return objective.members ? objective.members.some(m => m.userId === this.currentUser.userId) : false;
    }
    
    joinObjective(objective: Objective, event: Event) {
        event.stopPropagation();
        if (!objective.members) {
            objective.members = [];
        }
        if (!this.isUserInObjective(objective)) {
            objective.members.push({ ...this.currentUser });
        }
    }
    
    leaveObjective(objective: Objective, event: Event) {
        event.stopPropagation();
        if (objective.members) {
            objective.members = objective.members.filter(m => m.userId !== this.currentUser.userId);
        }
    }
    
    // Objective Detail Dialog Methods
    openObjectiveDetailDialog(objective: Objective) {
        this.viewingObjective = objective;
        this.objectiveDetailDialogVisible = true;
    }
    
    getResourceIcon(type: string): string {
        switch (type) {
            case 'documentation': return 'pi pi-file';
            case 'tutorial': return 'pi pi-book';
            case 'tool': return 'pi pi-wrench';
            case 'reference': return 'pi pi-bookmark';
            default: return 'pi pi-link';
        }
    }
    
    openAddObjectiveResourceDialog() {
        if (!this.viewingObjective) return;
        this.objectiveResourceDialogMode = 'add';
        this.currentObjectiveResource = this.getEmptyResource();
        this.objectiveResourceDialogVisible = true;
    }
    
    openEditObjectiveResourceDialog(resource: Resource) {
        this.objectiveResourceDialogMode = 'edit';
        this.currentObjectiveResource = { ...resource };
        this.objectiveResourceDialogVisible = true;
    }
    
    saveObjectiveResource() {
       return;
    }
    
    confirmDeleteObjectiveResource(resource: Resource) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${resource.title}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteObjectiveResource(resource);
            }
        });
    }
    
    deleteObjectiveResource(resource: Resource) {
        return;
    }
    
    joinObjectiveFromDetail() {
        if (!this.viewingObjective) return;
        if (!this.viewingObjective.members) {
            this.viewingObjective.members = [];
        }
        if (!this.isUserInObjective(this.viewingObjective)) {
            this.viewingObjective.members.push({ ...this.currentUser });
            this.updateObjectiveInProject();
        }
    }
    
    leaveObjectiveFromDetail() {
        if (!this.viewingObjective || !this.viewingObjective.members) return;
        this.viewingObjective.members = this.viewingObjective.members.filter(m => m.userId !== this.currentUser.userId);
        this.updateObjectiveInProject();
    }
    
    editObjectiveFromDetail() {
        if (!this.viewingObjective) return;
        this.objectiveDetailDialogVisible = false;
        this.openEditObjectiveDialog(this.viewingObjective);
    }
    
    updateObjectiveInProject() {
       return;
    }

    // Member Assignment Methods
    getProjectParticipantsForObjective(): Member[] {
        if (!this.selectedProject) return this.availableMembers;
        return this.selectedProject.participants.length > 0 
            ? this.selectedProject.participants 
            : this.availableMembers;
    }
    
    openAssignMembersToProjectDialog() {
        if (!this.selectedProject) return;
        this.tempSelectedProjectMembers = this.selectedProject.participants.map(p => p.name);
        this.assignMembersToProjectDialogVisible = true;
    }
    
    saveProjectMembers() {
        return;
    }
    
    openAssignMembersToObjectiveDialog(objective: Objective, event: Event) {
        event.stopPropagation();
        this.assigningObjective = objective;
        this.tempSelectedObjectiveMembers = objective.members ? objective.members.map(m => m.name) : [];
        this.assignMembersToObjectiveDialogVisible = true;
    }
    
    openAssignMembersToObjectiveFromDetail() {
        if (!this.viewingObjective) return;
        this.assigningObjective = this.viewingObjective;
        this.tempSelectedObjectiveMembers = this.viewingObjective.members ? this.viewingObjective.members.map(m => m.name) : [];
        this.assignMembersToObjectiveDialogVisible = true;
    }
    
    saveObjectiveMembers() {
        return;
    }

    // Remove Member Methods
    removeMemberFromProject(member: Member) {
        return;
    }
    
    removeMemberFromObjectiveDetail(member: Member) {
        if (!this.viewingObjective || !this.selectedProject) return;
        
        this.confirmationService.confirm({
            message: `Are you sure you want to remove "${member.name}" from this objective?`,
            header: 'Remove Member',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                if (!this.viewingObjective || !this.viewingObjective.members || !this.selectedProject) return;
                this.viewingObjective.members = this.viewingObjective.members.filter(m => m.name !== member.name);
                this.updateObjectiveInProject();
            }
        });
    }
    
    removeProjectMemberFromDialog(member: Member) {
        if (!this.selectedProject || !member.userId) {
            console.error('Cannot remove member: missing project or userId');
            return;
        }
        
        const projectId = this.selectedProject.id;
        const userId = member.userId;
        
        this.projectsService.removeTeamMember(projectId, userId).subscribe({
            next: (response) => {
                console.log('Team member removed successfully:', response);
                if (this.selectedProject?.participants) {
                    this.selectedProject.participants = this.selectedProject.participants.filter(p => p.userId !== userId);
                }
            },
            error: (err) => {
                console.error('Error removing team member:', err);
            }
        });
    }
    
    removeObjectiveMemberFromDialog(member: Member) {
        // Remove from temp selection
        return;
    }

    // GitHub Integration Properties
    githubCommits: Map<number, GitHubCommit[]> = new Map();
    loadingGithubCommits: Set<number> = new Set();
    githubError: Map<number, string> = new Map();
    githubPagination: Map<number, { currentPage: number; hasMore: boolean; totalCommits: number }> = new Map();
    loadingMoreCommits: Set<number> = new Set();

    // GitHub Integration Methods
    loadGithubCommits(project: Project, loadMore: boolean = false) {
        if (!project.githubRepo || this.loadingGithubCommits.has(project.id)) {
            return;
        }

        if (loadMore) {
            this.loadingMoreCommits.add(project.id);
        } else {
            this.loadingGithubCommits.add(project.id);
            this.githubError.delete(project.id);
            // Reset pagination for fresh load
            this.githubPagination.set(project.id, { currentPage: 1, hasMore: true, totalCommits: 0 });
        }

        // Extract owner and repo from the githubRepo format (owner/repo)
        const [owner, repo] = project.githubRepo.split('/');
        
        if (!owner || !repo) {
            this.githubError.set(project.id, 'Invalid GitHub repository format');
            this.loadingGithubCommits.delete(project.id);
            this.loadingMoreCommits.delete(project.id);
            return;
        }

        const paginationInfo = this.githubPagination.get(project.id) || { currentPage: 1, hasMore: true, totalCommits: 0 };
        const page = loadMore ? paginationInfo.currentPage : 1;
        const perPage = 10; // Load more commits per page
        
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`;

        this.http.get<GitHubCommit[]>(apiUrl, { observe: 'response' })
            .pipe(
                catchError(error => {
                    console.error('GitHub API Error:', error);
                    if (error.status === 403) {
                        this.githubError.set(project.id, 'GitHub API rate limit exceeded. Please try again later.');
                    } else if (error.status === 404) {
                        this.githubError.set(project.id, 'Repository not found or not accessible');
                    } else {
                        this.githubError.set(project.id, 'Failed to load GitHub commits');
                    }
                    return of(null);
                })
            )
            .subscribe({
                next: (response) => {
                    if (response && response.body) {
                        const commits = response.body;
                        
                        if (loadMore) {
                            // Append new commits to existing ones
                            const existingCommits = this.githubCommits.get(project.id) || [];
                            this.githubCommits.set(project.id, [...existingCommits, ...commits]);
                        } else {
                            // Set new commits
                            this.githubCommits.set(project.id, commits);
                        }

                        // Update pagination info
                        const linkHeader = response.headers.get('Link');
                        const hasNextPage = linkHeader ? linkHeader.includes('rel="next"') : commits.length === perPage;
                        
                        this.githubPagination.set(project.id, {
                            currentPage: page + 1,
                            hasMore: hasNextPage,
                            totalCommits: (this.githubCommits.get(project.id) || []).length
                        });
                    }
                    
                    this.loadingGithubCommits.delete(project.id);
                    this.loadingMoreCommits.delete(project.id);
                },
                error: (error) => {
                    console.error('Error loading GitHub commits:', error);
                    this.githubError.set(project.id, 'Failed to load GitHub commits');
                    this.loadingGithubCommits.delete(project.id);
                    this.loadingMoreCommits.delete(project.id);
                }
            });
    }

    getGithubCommits(projectId: number): GitHubCommit[] {
        return this.githubCommits.get(projectId) || [];
    }

    isLoadingGithubCommits(projectId: number): boolean {
        return this.loadingGithubCommits.has(projectId);
    }

    getGithubError(projectId: number): string | null {
        return this.githubError.get(projectId) || null;
    }

    hasMoreCommits(projectId: number): boolean {
        const paginationInfo = this.githubPagination.get(projectId);
        return paginationInfo ? paginationInfo.hasMore : false;
    }

    isLoadingMoreCommits(projectId: number): boolean {
        return this.loadingMoreCommits.has(projectId);
    }

    getTotalCommitsCount(projectId: number): number {
        const paginationInfo = this.githubPagination.get(projectId);
        return paginationInfo ? paginationInfo.totalCommits : 0;
    }

    loadMoreCommits(project: Project) {
        if (!this.hasMoreCommits(project.id) || this.isLoadingMoreCommits(project.id)) {
            return;
        }
        this.loadGithubCommits(project, true);
    }

    formatCommitDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    getGithubRepoUrl(githubRepo: string): string {
        return `https://github.com/${githubRepo}`;
    }

    truncateCommitMessage(message: string, maxLength: number = 60): string {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    }

    selectProject(project: Project) {
        // Fetch full project details from API
        this.projectsService.getProjectById(project.id).subscribe({
            next: (projectData) => {
                console.log('Project details received:', projectData);
                this.selectedProject = this.mapProjectFromApi(projectData);
                if (this.selectedProject.githubRepo) {
                    this.loadGithubCommits(this.selectedProject);
                }
            },
            error: (err) => {
                console.error('Error loading project details:', err);
                // Fallback to the project from the list
                this.selectedProject = project;
            }
        });
    }

    // Map single project from API response
    mapProjectFromApi(p: any): Project {
        return {
            id: p.id,
            title: p.title,
            description: p.description,
            status: this.mapStatusFromApi(p.status),
            startDate: p.startDate,
            endDate: p.endDate,
            progress: p.progressPercentage || 0,
            participants: this.mapTeamMembersFromApi(p.teamMembers || []),
            objectives: (p.objectives || []).map((o: any) => ({
                id: o.id,
                title: o.title,
                description: o.description,
                status: this.mapObjectiveStatusFromApi(o.status),
                progress: o.progressPercentage || 0,
                members: this.mapTeamMembersFromApi(o.teamMembers || []),
                resources: o.resources || []
            })),
            resources: p.resources || [],
            githubRepo: p.githubRepo
        };
    }

    // Map objective status from API
    mapObjectiveStatusFromApi(status: string): 'todo' | 'in-progress' | 'completed' {
        switch (status?.toLowerCase()) {
            case 'todo': return 'todo';
            case 'inprogress': return 'in-progress';
            case 'completed': return 'completed';
            default: return 'todo';
        }
    }
}