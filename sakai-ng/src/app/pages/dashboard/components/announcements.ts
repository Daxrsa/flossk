import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ConfirmationService } from 'primeng/api';
import { AnnouncementsService, Announcement } from '@/pages/service/announcements.service';

interface AnnouncementDisplay {
    id: string;
    title: string;
    content: string;
    author: string;
    authorAvatar: string;
    date: string;
    category: string;
    priority: string;
    views: number;
}

@Component({
    selector: 'app-announcements',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TagModule,
        AvatarModule,
        DividerModule,
        ConfirmDialogModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        SelectModule
    ],
    providers: [ConfirmationService],
    template: `
        <p-confirmdialog></p-confirmdialog>
        
        <p-dialog [(visible)]="dialogVisible" [header]="dialogMode === 'add' ? 'New Announcement' : 'Edit Announcement'" [modal]="true" [style]="{width: '50rem'}" [contentStyle]="{'max-height': '70vh', 'overflow': 'visible'}" appendTo="body" [maximizable]="true">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="title" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Title</label>
                    <input pInputText id="title" [(ngModel)]="currentAnnouncement.title" class="w-full" />
                </div>
                
                <div>
                    <label for="content" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Content</label>
                    <textarea pInputTextarea id="content" [(ngModel)]="currentAnnouncement.content" [rows]="5" class="w-full"></textarea>
                </div>
                
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="category" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Category</label>
                        <p-select id="category" [(ngModel)]="currentAnnouncement.category" [options]="categoryOptions" placeholder="Select Category" class="w-full" />
                    </div>
                    
                    <div class="col-span-6">
                        <label for="priority" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Priority</label>
                        <p-select id="priority" [(ngModel)]="currentAnnouncement.priority" [options]="priorityOptions" placeholder="Select Priority" class="w-full" />
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="dialogVisible = false" />
                <p-button [label]="dialogMode === 'add' ? 'Create' : 'Save'" (onClick)="saveAnnouncement()" />
            </div>
        </p-dialog>
        
        <p-dialog [(visible)]="viewDialogVisible" [header]="selectedAnnouncement?.title" [modal]="true" [style]="{width: '50rem'}" appendTo="body">
            <div *ngIf="selectedAnnouncement" class="flex flex-col gap-4">
                <!-- Author Info -->
                <div class="flex items-center gap-3 mb-2">
                    <p-avatar [image]="selectedAnnouncement.authorAvatar" shape="circle" size="large"></p-avatar>
                    <div>
                        <div class="font-semibold text-surface-900 dark:text-surface-0">{{ selectedAnnouncement.author }}</div>
                        <div class="text-sm text-muted-color">{{ selectedAnnouncement.date }}</div>
                    </div>
                </div>
                
                <!-- Tags -->
                <div class="flex items-center gap-2">
                    <p-tag 
                        [value]="selectedAnnouncement.priority.toUpperCase()" 
                        [severity]="getPrioritySeverity(selectedAnnouncement.priority)"
                    ></p-tag>
                    <p-tag [value]="selectedAnnouncement.category"></p-tag>
                    <p-tag icon="pi pi-eye" [value]="selectedAnnouncement.views + ' views'" severity="secondary"></p-tag>
                </div>
                
                <p-divider></p-divider>
                
                <!-- Content -->
                <div class="text-surface-700 dark:text-surface-300 leading-relaxed">
                    {{ selectedAnnouncement.content }}
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Close" severity="secondary" (onClick)="viewDialogVisible = false" />
            </div>
        </p-dialog>
        
        <div class="card">
            <div class="flex justify-end items-center mb-6">
                <p-button label="New Announcement" icon="pi pi-plus" size="small" (onClick)="openAddDialog()"></p-button>
            </div>

            <div class="flex flex-col gap-6">
                <div *ngFor="let announcement of announcements" class="p-4 border border-surface rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                    <div class="cursor-pointer" (click)="viewAnnouncement(announcement)">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-3">
                                <div>
                                    <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0 m-0 mb-1">
                                        {{ announcement.title }}
                                    </h3>
                                <div class="flex items-center gap-2 text-sm text-muted-color">
                                    <span>{{ announcement.author }}</span>
                                    <span>•</span>
                                    <span>{{ announcement.date }}</span>
                                    <span>•</span>
                                    <span class="flex items-center gap-1"><i class="pi pi-eye"></i> {{ announcement.views }} views</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <p-tag 
                                [value]="announcement.priority?.toUpperCase()" 
                                [severity]="getPrioritySeverity(announcement.priority)"
                            ></p-tag>
                            <p-tag [value]="announcement.category"></p-tag>
                        </div>
                        </div>

                        <p class="text-surface-700 dark:text-surface-300 mb-4 leading-relaxed">
                            {{ (announcement.content?.length || 0) > 200 ? announcement.content.substring(0, 200) + '...' : announcement.content }}
                        </p>
                        
                        <span *ngIf="(announcement.content?.length || 0) > 200" class="text-primary text-sm font-semibold">
                            Read more →
                        </span>
                    </div>

                    <p-divider></p-divider>

                    <div class="flex justify-end gap-2 mt-3">
                        <p-button label="Edit" icon="pi pi-pencil" severity="secondary" [text]="true" size="small" (onClick)="openEditDialog(announcement)"></p-button>
                        <p-button label="Delete" icon="pi pi-trash" severity="danger" [text]="true" size="small" (onClick)="confirmDelete(announcement)"></p-button>
                    </div>
                </div>

                <div *ngIf="announcements.length === 0" class="text-center py-8">
                    <i class="pi pi-megaphone text-6xl text-muted-color mb-4"></i>
                    <p class="text-muted-color text-lg">No announcements yet</p>
                </div>
            </div>
        </div>
    `
})
export class Announcements implements OnInit {
    constructor(
        private confirmationService: ConfirmationService,
        private announcementsService: AnnouncementsService
    ) {}

    dialogVisible = false;
    viewDialogVisible = false;
    dialogMode: 'add' | 'edit' = 'add';
    currentAnnouncement: AnnouncementDisplay = this.getEmptyAnnouncement();
    selectedAnnouncement: AnnouncementDisplay | null = null;
    
    categoryOptions = [
        { label: 'General', value: 'General' },
        { label: 'Events', value: 'Events' },
        { label: 'Updates', value: 'Updates' },
        { label: 'Maintenance', value: 'Maintenance' },
        { label: 'Meetings', value: 'Meetings' }
    ];
    
    priorityOptions = [
        { label: 'Normal', value: 'normal' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' }
    ];

    announcements: AnnouncementDisplay[] = [];

    ngOnInit() {
        this.loadAnnouncements();
    }

    loadAnnouncements() {
        this.announcementsService.getAll(1, 50).subscribe({
            next: (response: any) => {
                console.log('Announcements API response:', response);
                // Adjust based on actual API response structure
                const announcementsArray = response.announcements || response.items || response || [];
                this.announcements = announcementsArray.map((a: any) => this.mapToDisplay(a));
            },
            error: (err) => {
                console.error('Failed to load announcements:', err);
            }
        });
    }

    mapToDisplay(a: any): AnnouncementDisplay {
        return {
            id: a.id,
            title: a.title,
            content: a.body || a.content,
            author: a.createdByFirstName && a.createdByLastName 
                ? `${a.createdByFirstName} ${a.createdByLastName}` 
                : 'Unknown',
            authorAvatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
            date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
            category: a.category || 'General',
            priority: a.importance?.toLowerCase() || a.priority?.toLowerCase() || 'normal',
            views: a.views || 0
        };
    }

    getPrioritySeverity(priority: string): 'success' | 'info' | 'warn' | 'danger' {
        switch(priority?.toLowerCase()) {
            case 'urgent': return 'danger';
            case 'high': return 'warn';
            case 'normal': return 'info';
            case 'low': return 'success';
            default: return 'info';
        }
    }

    getEmptyAnnouncement(): AnnouncementDisplay {
        return {
            id: '',
            title: '',
            content: '',
            author: 'Current User',
            authorAvatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            category: 'General',
            priority: 'normal',
            views: 0
        };
    }
    
    openAddDialog() {
        this.dialogMode = 'add';
        this.currentAnnouncement = this.getEmptyAnnouncement();
        this.dialogVisible = true;
    }
    
    openEditDialog(announcement: AnnouncementDisplay) {
        this.dialogMode = 'edit';
        this.currentAnnouncement = { ...announcement };
        this.dialogVisible = true;
    }
    
    saveAnnouncement() {
        const announcementData = {
            title: this.currentAnnouncement.title,
            body: this.currentAnnouncement.content,
            category: this.currentAnnouncement.category,
            importance: this.currentAnnouncement.priority
        };

        if (this.dialogMode === 'add') {
            this.announcementsService.create(announcementData).subscribe({
                next: () => {
                    this.dialogVisible = false;
                    this.loadAnnouncements();
                },
                error: (err) => {
                    console.error('Failed to create announcement:', err);
                }
            });
        } else {
            this.announcementsService.update(this.currentAnnouncement.id, announcementData).subscribe({
                next: () => {
                    this.dialogVisible = false;
                    this.loadAnnouncements();
                },
                error: (err) => {
                    console.error('Failed to update announcement:', err);
                }
            });
        }
    }

    viewAnnouncement(announcement: AnnouncementDisplay) {
        // Fetch full details from API
        this.announcementsService.getById(announcement.id).subscribe({
            next: (response: any) => {
                this.selectedAnnouncement = this.mapToDisplay(response);
                this.viewDialogVisible = true;
            },
            error: (err) => {
                console.error('Failed to fetch announcement details:', err);
                // Fallback to local data
                this.selectedAnnouncement = announcement;
                this.viewDialogVisible = true;
            }
        });
    }

    confirmDelete(announcement: AnnouncementDisplay) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${announcement.title}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteAnnouncement(announcement);
            }
        });
    }

    deleteAnnouncement(announcement: AnnouncementDisplay) {
        this.announcementsService.delete(announcement.id).subscribe({
            next: () => {
                this.loadAnnouncements();
            },
            error: (err) => {
                console.error('Failed to delete announcement:', err);
            }
        });
    }
}
