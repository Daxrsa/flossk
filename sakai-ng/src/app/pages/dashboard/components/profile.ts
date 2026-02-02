import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { AccordionModule } from 'primeng/accordion';
import { AuthService, DEFAULT_AVATAR } from '@/pages/service/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment.prod';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    biography: string;
    phoneNumber: string;
    location: string;
    websiteUrl: string;
    socialLinks: string[];
    skills: string[];
    createdAt: string;
    roles: string[];
    profilePictureUrl: string;
}

@Component({
    selector: 'app-profile',
    imports: [CommonModule, FormsModule, AvatarModule, ButtonModule, TagModule, ChipModule, BadgeModule, DividerModule, PanelModule, ProgressBarModule, AvatarGroupModule, DialogModule, InputTextModule, TextareaModule, FileUploadModule, SelectModule, SkeletonModule, AccordionModule],
    template: `
        <!-- Loading Skeleton -->
        <div *ngIf="isLoading" class="grid grid-cols-12 gap-8">
            <div class="col-span-12">
                <div class="card">
                    <div class="flex flex-col lg:flex-row gap-8">
                        <div class="flex flex-col items-center">
                            <p-skeleton shape="circle" size="18rem" styleClass="mb-4"></p-skeleton>
                        </div>
                        <div class="flex-1">
                            <p-skeleton width="60%" height="2rem" styleClass="mb-4"></p-skeleton>
                            <p-skeleton width="40%" styleClass="mb-4"></p-skeleton>
                            <div class="flex gap-2 mb-4">
                                <p-skeleton width="5rem" height="2.5rem"></p-skeleton>
                                <p-skeleton width="5rem" height="2.5rem"></p-skeleton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12">
                <div class="grid grid-cols-12 gap-8">
                    <div *ngFor="let i of [1,2,3,4]" class="col-span-12 md:col-span-6 lg:col-span-3">
                        <div class="card h-full">
                            <p-skeleton width="50%" height="1.5rem" styleClass="mb-4"></p-skeleton>
                            <p-skeleton width="100%" height="4rem"></p-skeleton>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <ng-container *ngIf="!isLoading">
        <p-dialog [(visible)]="editDialogVisible" header="Edit Profile" [modal]="true" [style]="{width: '70rem'}" [contentStyle]="{'overflow-y': 'auto'}" appendTo="body" [maximizable]="true">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Column 1: Profile Picture -->
                <div class="flex flex-col gap-4">
                    <h4 class="text-lg font-semibold text-surface-900 dark:text-surface-0 m-0">Profile Picture</h4>
                    <div class="flex flex-col gap-4">
                        <img 
                            [src]="editProfile.picture" 
                            alt="Profile Picture"
                            class="w-70 h-70 object-cover rounded-full border-4 border-surface-200 dark:border-surface-700"
                        >
                        <div class="flex gap-2 w-full">
                            <p-fileupload 
                                mode="basic" 
                                chooseLabel="Change" 
                                accept="image/*"
                                [maxFileSize]="1000000"
                                (onSelect)="onFileSelect($event)"
                                [auto]="true"
                            ></p-fileupload>
                            <p-button 
                                icon="pi pi-trash" 
                                label="Delete"
                                severity="danger" 
                                [outlined]="true"
                                (onClick)="deleteProfilePicture()"
                            ></p-button>
                        </div>
                    </div>
                </div>
                
                <!-- Column 2: Biography, Phone, Location, Skills -->
                <div class="flex flex-col gap-4">
                    <h4 class="text-lg font-semibold text-surface-900 dark:text-surface-0 m-0">Personal Information</h4>
                    
                    <div>
                        <label for="biography" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Biography</label>
                        <textarea pInputTextarea id="biography" [(ngModel)]="editProfile.biography" [rows]="5" class="w-full"></textarea>
                    </div>
                    
                    <div>
                        <label for="phone" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Phone</label>
                        <input pInputText id="phone" [(ngModel)]="editProfile.phone" class="w-full" />
                    </div>
                    
                    <div>
                        <label for="location" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Location</label>
                        <input pInputText id="location" [(ngModel)]="editProfile.location" class="w-full" />
                    </div>

                    <div>
                        <label for="skills" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Skills (comma-separated)</label>
                        <input pInputText id="skills" [(ngModel)]="skillsString" placeholder="e.g. Angular, TypeScript, Python" class="w-full" />
                    </div>
                </div>
                
                <!-- Column 3: Social Links -->
                <div class="flex flex-col gap-4">
                    <h4 class="text-lg font-semibold text-surface-900 dark:text-surface-0 m-0">Social Links</h4>
                    
                    <div>
                        <label for="github" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                            <i class="pi pi-github mr-2"></i>GitHub
                        </label>
                        <input pInputText id="github" [(ngModel)]="editProfile.socialLinks.github" placeholder="https://github.com/username" class="w-full" />
                    </div>
                    
                    <div>
                        <label for="linkedin" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                            <i class="pi pi-linkedin mr-2"></i>LinkedIn
                        </label>
                        <input pInputText id="linkedin" [(ngModel)]="editProfile.socialLinks.linkedin" placeholder="https://linkedin.com/in/username" class="w-full" />
                    </div>
                    
                    <div>
                        <label for="twitter" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                            <i class="pi pi-twitter mr-2"></i>X (Twitter)
                        </label>
                        <input pInputText id="twitter" [(ngModel)]="editProfile.socialLinks.twitter" placeholder="https://x.com/username" class="w-full" />
                    </div>
                    
                    <div>
                        <label for="steam" class="flex text-surface-900 dark:text-surface-0 font-medium mb-2">
                            <i class="pi pi-steam mr-2" style="font-size: 1.25rem"></i>Steam
                        </label>
                        <input pInputText id="steam" [(ngModel)]="editProfile.socialLinks.steam" placeholder="https://steamcommunity.com/id/username" class="w-full" />
                    </div>

                    <div>
                        <label for="instagram" class="flex text-surface-900 dark:text-surface-0 font-medium mb-2">
                            <i class="pi pi-instagram mr-2" style="font-size: 1.25rem"></i>Instagram
                        </label>
                        <input pInputText id="instagram" [(ngModel)]="editProfile.socialLinks.instagram" placeholder="https://instagram.com/username" class="w-full" />
                    </div>
                    
                    <div>
                        <label for="youtube" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                            <i class="pi pi-youtube mr-2"></i>YouTube
                        </label>
                        <input pInputText id="youtube" [(ngModel)]="editProfile.socialLinks.youtube" placeholder="https://youtube.com/@username" class="w-full" />
                    </div>

                    <div>
                        <label for="spotify" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                            <i class="pi pi-spotify mr-2"></i>Spotify
                        </label>
                        <input pInputText id="spotify" [(ngModel)]="editProfile.socialLinks.spotify" placeholder="https://open.spotify.com/user/username" class="w-full" />
                    </div>
                    
                    <div>
                        <label for="website" class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                            <i class="pi pi-link mr-2"></i>Personal Website
                        </label>
                        <input pInputText id="website" [(ngModel)]="editProfile.website" placeholder="https://yourwebsite.com" class="w-full" />
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancel" severity="secondary" (onClick)="editDialogVisible = false" />
                <p-button label="Save Changes" (onClick)="saveProfile()" />
            </div>
        </p-dialog>
        
        <div class="grid grid-cols-12 gap-8">
            <!-- Profile Header Card -->
            <div class="col-span-12">
                <div class="card">
                    <div class="flex flex-col lg:flex-row gap-8">
                        <!-- Profile Picture and Status -->
                        <div class="flex flex-col items-center">
                            <!-- Custom Avatar -->
                            <div class="relative inline-block">
                                <img 
                                    [src]="userProfile.picture" 
                                    [alt]="userProfile.firstName + ' ' + userProfile.lastName"
                                    class="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 object-cover rounded-full border-4 border-surface-0 dark:border-surface-900 shadow-lg hover:scale-105 transition-transform duration-300"
                                >
                                <!-- Status Badge -->
                                <!-- <div class="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4">
                                    <span 
                                        [class]="userProfile.activity === 'Active' ? 'bg-green-500' : 'bg-red-500'"
                                        class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-4 border-surface-0 dark:border-surface-900 shadow-md"
                                    >
                                        <i [class]="userProfile.activity === 'Active'" class="text-white text-base sm:text-lg md:text-xl"></i>
                                    </span>
                                </div> -->
                            </div>
                        </div>
                        
                        <!-- Profile Information -->
                        <div class="flex-1">
                            <div class="flex flex-col gap-6">
                                <div class="flex flex-col gap-2 mb-2">
                                    <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                                        {{ userProfile.firstName }} {{ userProfile.lastName }}
                                    </h2>
                                    <p class="text-muted-color flex items-center gap-1">
                                        <i class="pi pi-envelope text-sm"></i>
                                         {{ userProfile.email }}
                                    </p>
                                 
                                    <p *ngIf="userProfile.phone" class="text-muted-color flex items-center gap-1">
                                        <i class="pi pi-phone text-sm"></i>
                                        {{ userProfile.phone }}
                                    </p>
                                    <p *ngIf="userProfile.location" class="text-muted-color flex items-center gap-1">
                                        <i class="pi pi-map-marker text-sm"></i>
                                        {{ userProfile.location }}
                                    </p>
                                    
                                    
                                </div>

                                <div class="flex gap-3">
                                        <a *ngIf="userProfile.socialLinks.github" [href]="userProfile.socialLinks.github" target="_blank" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-github" style="font-size: 1.25rem"></i>
                                        </a>
                                        <a *ngIf="userProfile.socialLinks.linkedin" [href]="userProfile.socialLinks.linkedin" target="_blank" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-linkedin" style="font-size: 1.25rem"></i>
                                        </a>
                                        <a *ngIf="userProfile.socialLinks.twitter" [href]="userProfile.socialLinks.twitter" target="_blank" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-twitter" style="font-size: 1.25rem"></i>
                                        </a>
                                        <a *ngIf="userProfile.socialLinks.youtube" [href]="userProfile.socialLinks.youtube" target="_blank" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-youtube" style="font-size: 1.25rem"></i>
                                        </a>
                                        <a *ngIf="userProfile.socialLinks.steam" [href]="userProfile.socialLinks.steam" target="_blank" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi-steam" style="font-size: 1.25rem"></i>
                                        </a>
                                        <a *ngIf="userProfile.socialLinks.instagram" [href]="userProfile.socialLinks.instagram" target="_blank" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-instagram" style="font-size: 1.25rem"></i>
                                        </a>
                                        <a *ngIf="userProfile.socialLinks.spotify" [href]="userProfile.socialLinks.spotify" target="_blank" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-spotify" style="font-size: 1.25rem"></i>
                                        </a>
                                        <a *ngIf="userProfile.website" [href]="userProfile.website" target="_blank" class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors">
                                            <i class="pi pi-link" style="font-size: 1.25rem"></i>
                                        </a>
                                    </div>
                                
                                <div class="flex flex-wrap gap-4">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-calendar text-muted-color"></i>
                                        <span class="text-muted-color">Joined: </span>
                                        <span class="font-semibold">{{ userProfile.dateJoined }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-briefcase text-muted-color"></i>
                                        <span class="text-muted-color">Role: </span>
                                        <span class="font-semibold">{{ userProfile.role }}</span>
                                    </div>
                                </div>
                                
                                <div class="flex gap-2" *ngIf="isOwnProfile">
                                    <p-button label="Edit" icon="pi pi-pencil" outlined (onClick)="openEditDialog()"></p-button>
                                    <!-- <p-button label="Settings" icon="pi pi-cog" severity="secondary" outlined></p-button> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Information Cards Section -->
            <div class="col-span-12">
                <div class="grid grid-cols-12 gap-8 items-start">
                    <!-- Biography, Skills & Statistics Accordion -->
                    <div class="col-span-12 md:col-span-6">
                        <div class="card">
                            <p-accordion [multiple]="true" [value]="[]">
                                <p-accordion-panel value="0">
                                    <p-accordion-header>
                                        <span class="flex items-center gap-2">
                                            <i class="pi pi-user text-primary"></i>
                                            <span>Biography</span>
                                        </span>
                                    </p-accordion-header>
                                    <p-accordion-content>
                                        <p class="text-surface-700 dark:text-surface-300 leading-relaxed m-0">
                                            {{ userProfile.biography || 'Not provided' }}
                                        </p>
                                    </p-accordion-content>
                                </p-accordion-panel>
                                
                                <p-accordion-panel value="1">
                                    <p-accordion-header>
                                        <span class="flex items-center gap-2">
                                            <i class="pi pi-star text-primary"></i>
                                            <span>Skills & Expertise</span>
                                        </span>
                                    </p-accordion-header>
                                    <p-accordion-content>
                                        <div class="flex flex-wrap gap-2">
                                            <p-chip 
                                                *ngFor="let skill of userProfile.skills" 
                                                [label]="skill"
                                                styleClass="bg-primary-100 dark:bg-primary-400/10 text-primary-700 dark:text-primary-400"
                                            ></p-chip>
                                            <span *ngIf="!userProfile.skills || userProfile.skills.length === 0" class="text-surface-700 dark:text-surface-300">Not provided</span>
                                        </div>
                                    </p-accordion-content>
                                </p-accordion-panel>
                                
                                <p-accordion-panel value="2">
                                    <p-accordion-header>
                                        <span class="flex items-center gap-2">
                                            <i class="pi pi-chart-bar text-primary"></i>
                                            <span>Statistics</span>
                                        </span>
                                    </p-accordion-header>
                                    <p-accordion-content>
                                        <div class="flex flex-col gap-6">
                                            <div class="flex justify-between items-center">
                                                <div>
                                                    <div class="text-muted-color text-sm mb-1">Projects</div>
                                                    <div class="text-2xl font-bold text-surface-900 dark:text-surface-0">24</div>
                                                </div>
                                                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 3rem; height: 3rem">
                                                    <i class="pi pi-folder text-blue-500 text-xl"></i>
                                                </div>
                                            </div>

                                            <p-divider></p-divider>

                                            <div class="flex justify-between items-center">
                                                <div>
                                                    <div class="text-muted-color text-sm mb-1">Contributions</div>
                                                    <div class="text-2xl font-bold text-surface-900 dark:text-surface-0">156</div>
                                                </div>
                                                <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 3rem; height: 3rem">
                                                    <i class="pi pi-code text-green-500 text-xl"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </p-accordion-content>
                                </p-accordion-panel>
                            </p-accordion>
                        </div>
                    </div>

                    <!-- Projects Accordion -->
                    <div class="col-span-12 md:col-span-6">
                        <div class="card h-full">
                            <p-accordion [multiple]="true" [value]="[]">
                                <p-accordion-panel value="projects">
                                    <p-accordion-header>
                                        <span class="flex items-center gap-2">
                                            <i class="pi pi-hammer text-primary"></i>
                                            <span>{{ userProfile.firstName }}'s Projects</span>
                                        </span>
                                    </p-accordion-header>
                                    <p-accordion-content>
                                        <p-accordion [multiple]="true" [value]="[]">
                                            <p-accordion-panel *ngFor="let project of userProjects; let i = index" [value]="'project-' + i">
                                                <p-accordion-header>
                                                    <div class="flex justify-between items-center w-full pr-4">
                                                        <span class="font-semibold">{{ project.name }}</span>
                                                        <p-tag 
                                                            [value]="project.status" 
                                                            [severity]="getStatusSeverity(project.status)"
                                                        ></p-tag>
                                                    </div>
                                                </p-accordion-header>
                                                <p-accordion-content>
                                                    <p class="text-surface-700 dark:text-surface-300 text-sm mb-3">
                                                        {{ project.description }}
                                                    </p>
                                                    
                                                    <div class="flex items-center gap-2 text-xs text-muted-color mb-3">
                                                        <i class="pi pi-user"></i>
                                                        <span>{{ project.role }}</span>
                                                    </div>
                                                    
                                                    <div class="mb-3" *ngIf="project.status === 'in-progress'">
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
                                                                *ngFor="let member of project.team.slice(0, 3)" 
                                                                [image]="member.avatar" 
                                                                shape="circle"
                                                                size="normal"
                                                            ></p-avatar>
                                                            <p-avatar 
                                                                *ngIf="project.team.length > 3"
                                                                [label]="'+' + (project.team.length - 3)" 
                                                                shape="circle"
                                                                size="normal"
                                                                [style]="{'background-color': 'var(--primary-color)', 'color': 'var(--primary-color-text)'}"
                                                            ></p-avatar>
                                                        </p-avatargroup>
                                                    </div>
                                                </p-accordion-content>
                                            </p-accordion-panel>
                                        </p-accordion>
                                    </p-accordion-content>
                                </p-accordion-panel>
                            </p-accordion>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </ng-container>
    `
})
export class Profile implements OnInit {
    isLoading = true;
    isOwnProfile = true;
    private route = inject(ActivatedRoute);

    constructor(private authService: AuthService, private http: HttpClient) {
        // Use effect to reactively update when currentUser signal changes (only for own profile)
        effect(() => {
            const user = this.authService.currentUser();
            if (user && this.isOwnProfile) {
                this.loadUserProfile();
                this.isLoading = false;
            }
        });
    }

    editDialogVisible = false;
    editProfile: any = {
        picture: '',
        firstName: '',
        lastName: '',
        email: '',
        biography: '',
        phone: '',
        location: '',
        website: '',
        skills: [],
        socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            steam: '',
            instagram: '',
            youtube: '',
            spotify: ''
        }
    };
    skillsString = '';
    selectedFile: File | null = null;

    roleOptions = [
        { label: 'Member', value: 'Member' },
        { label: 'Board Member', value: 'Board Member' },
        { label: 'Admin', value: 'Admin' }
    ];

    userProfile = {
        picture: DEFAULT_AVATAR,
        firstName: '',
        lastName: '',
        email: '',
        dateJoined: '',
        activity: 'Online',
        role: '',
        biography: '',
        skills: [] as string[],
        phone: '',
        location: '',
        website: '',
        socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            steam: '',
            instagram: '',
            youtube: '',
            spotify: ''
        }
    };

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const userId = params.get('userId');
            
            if (userId) {
                // Viewing another user's profile
                this.isOwnProfile = false;
                this.loadUserById(userId);
            } else {
                // Viewing own profile
                this.isOwnProfile = true;
                this.loadUserProfile();
            }
        });
    }

    loadUserById(userId: string) {
        this.isLoading = true;
        this.http.get<User>(`${environment.apiUrl}/Auth/users/${userId}`).subscribe({
            next: (user) => {
                console.log('Fetched user data:', user);
                this.mapUserToProfile(user);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading user:', err);
                this.isLoading = false;
            }
        });
    }

    mapUserToProfile(user: User) {
        let pictureUrl = DEFAULT_AVATAR;
        if (user.profilePictureUrl) {
            pictureUrl = user.profilePictureUrl.startsWith('http')
                ? user.profilePictureUrl
                : `${environment.baseUrl}${user.profilePictureUrl}`;
        }

        this.userProfile = {
            ...this.userProfile,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: user.roles?.[0] || 'Member',
            dateJoined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
            picture: pictureUrl,
            biography: user.biography || '',
            phone: user.phoneNumber || '',
            location: user.location || '',
            website: user.websiteUrl || '',
            skills: user.skills || [],
            socialLinks: this.parseSocialLinks(user.socialLinks)
        };
    }

    loadUserProfile() {
        const user = this.authService.currentUser() as User | null;
        console.log('Logged in user data:', user);
        if (user) {
            // Construct full picture URL if it's a relative path
            let pictureUrl = DEFAULT_AVATAR;
            if (user.profilePictureUrl) {
                pictureUrl = user.profilePictureUrl.startsWith('http')
                    ? user.profilePictureUrl
                    : `${environment.baseUrl}${user.profilePictureUrl}`;
            }

            this.userProfile = {
                ...this.userProfile,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                role: user.roles?.[0] || 'Member',
                dateJoined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                picture: pictureUrl,
                biography: user.biography || '',
                phone: user.phoneNumber || '',
                location: user.location || '',
                website: user.websiteUrl || '',
                skills: user.skills || [],
                socialLinks: this.parseSocialLinks(user.socialLinks)
            };
        }
    }

    userProjects = [
        {
            id: 1,
            name: 'Smart Home Automation System',
            description: 'Develop an IoT-based home automation system using Arduino and Raspberry Pi to control lights, temperature, and security.',
            status: 'in-progress',
            role: 'Project Lead',
            progress: 65,
            team: [
                { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
                { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png' },
                { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png' },
                { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' }
            ]
        },
        {
            id: 2,
            name: '3D Printer Upgrade Project',
            description: 'Upgrade existing 3D printers with auto-leveling sensors and improved cooling systems.',
            status: 'in-progress',
            role: 'Contributor',
            progress: 40,
            team: [
                { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png' },
                { name: 'Ioni Bowcher', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png' }
            ]
        },
        {
            id: 3,
            name: 'Robotics Competition Team',
            description: 'Build and program a robot for the regional robotics competition in March 2026.',
            status: 'completed',
            role: 'Programmer',
            progress: 100,
            team: [
                { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png' },
                { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
                { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png' }
            ]
        }
    ];

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' {
        switch (status) {
            case 'completed': return 'success';
            case 'in-progress': return 'info';
            case 'upcoming': return 'warn';
            default: return 'info';
        }
    }

    // Parse social links array from backend into object
    parseSocialLinks(links: string[] | null | undefined): { github: string; linkedin: string; twitter: string; steam: string; instagram: string; youtube: string; spotify: string } {
        const socialLinks = { github: '', linkedin: '', twitter: '', steam: '', instagram: '', youtube: '', spotify: '' };
        if (!links || !Array.isArray(links)) {
            return socialLinks;
        }
        links.forEach(link => {
            if (!link) return;
            if (link.includes('github.com')) {
                socialLinks.github = link;
            } else if (link.includes('linkedin.com')) {
                socialLinks.linkedin = link;
            } else if (link.includes('twitter.com') || link.includes('x.com')) {
                socialLinks.twitter = link;
            } else if (link.includes('steamcommunity.com') || link.includes('steam')) {
                socialLinks.steam = link;
            } else if (link.includes('instagram.com')) {
                socialLinks.instagram = link;
            } else if (link.includes('youtube.com') || link.includes('youtu.be')) {
                socialLinks.youtube = link;
            } else if (link.includes('spotify.com')) {
                socialLinks.spotify = link;
            }
        });
        return socialLinks;
    }

    // Serialize social links object back to array for backend
    serializeSocialLinks(socialLinks: { github: string; linkedin: string; twitter: string; steam: string; instagram: string; youtube: string; spotify: string }): string[] {
        const links: string[] = [];
        if (socialLinks.github) links.push(socialLinks.github);
        if (socialLinks.linkedin) links.push(socialLinks.linkedin);
        if (socialLinks.twitter) links.push(socialLinks.twitter);
        if (socialLinks.steam) links.push(socialLinks.steam);
        if (socialLinks.instagram) links.push(socialLinks.instagram);
        if (socialLinks.youtube) links.push(socialLinks.youtube);
        if (socialLinks.spotify) links.push(socialLinks.spotify);
        return links;
    }

    openEditDialog() {
        // Clone the current profile for editing
        console.log('userProfile.socialLinks:', this.userProfile.socialLinks);
        this.editProfile = {
            ...this.userProfile,
            socialLinks: {
                github: this.userProfile.socialLinks.github || '',
                linkedin: this.userProfile.socialLinks.linkedin || '',
                twitter: this.userProfile.socialLinks.twitter || '',
                steam: this.userProfile.socialLinks.steam || '',
                instagram: this.userProfile.socialLinks.instagram || '',
                youtube: this.userProfile.socialLinks.youtube || '',
                spotify: this.userProfile.socialLinks.spotify || ''
            }
        };
        console.log('editProfile.socialLinks:', this.editProfile.socialLinks);
        this.skillsString = this.userProfile.skills.join(', ');
        this.editDialogVisible = true;
    }

    onFileSelect(event: any) {
        const file = event.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.editProfile.picture = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    deleteProfilePicture() {
        this.http.delete(`${environment.apiUrl}/Auth/me/profile-picture`).subscribe({
            next: () => {
                console.log('Profile picture deleted successfully');
                // Reset to default avatar
                this.editProfile.picture = DEFAULT_AVATAR;
                this.userProfile.picture = DEFAULT_AVATAR;
                this.selectedFile = null;
                
                // Update auth service
                const currentUser = this.authService.currentUser() as User | null;
                if (currentUser) {
                    this.authService.updateCurrentUser({
                        ...currentUser,
                        profilePictureUrl: ''
                    } as any);
                }
            },
            error: (error) => {
                console.error('Error deleting profile picture:', error);
            }
        });
    }

    saveProfile() {
        // Parse skills string into array
        this.editProfile.skills = this.skillsString
            .split(',')
            .map((skill: string) => skill.trim())
            .filter((skill: string) => skill.length > 0);

        // Prepare FormData for multipart/form-data
        const formData = new FormData();
        formData.append('biography', this.editProfile.biography || '');
        formData.append('phoneNumber', this.editProfile.phone || '');
        formData.append('location', this.editProfile.location || '');
        formData.append('websiteUrl', this.editProfile.website || '');

        // Append skills as separate entries
        this.editProfile.skills.forEach((skill: string) => {
            formData.append('skills', skill);
        });

        // Append social links as separate entries
        const socialLinksArray = this.serializeSocialLinks(this.editProfile.socialLinks);
        socialLinksArray.forEach((link: string) => {
            formData.append('socialLinks', link);
        });

        // Append profile picture if a new one was selected
        if (this.selectedFile) {
            formData.append('profilePicture', this.selectedFile);
        }

        this.http.patch(`${environment.apiUrl}/Auth/me`, formData).subscribe({
            next: (response: any) => {
                console.log('Profile updated successfully:', response);
                // Update the local user profile
                Object.assign(this.userProfile, this.editProfile);

                // If response contains new profile picture URL, update it
                if (response.profilePictureUrl) {
                    this.userProfile.picture = response.profilePictureUrl.startsWith('http')
                        ? response.profilePictureUrl
                        : `${environment.baseUrl}${response.profilePictureUrl}`;
                }

                // Update the auth service's currentUser signal with the new data
                this.authService.updateCurrentUser({
                    ...response,
                    role: response.roles?.length > 0 ? response.roles[0] : undefined
                });

                this.selectedFile = null;
                this.editDialogVisible = false;
            },
            error: (error) => {
                console.error('Error updating profile:', error);
            }
        });
    }
}
