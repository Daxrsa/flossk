import { Component } from '@angular/core';
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
import { ProjectsService } from '../../../service/projects.service';
import { GitHubCommit, Member, Objective, Project, Resource } from './interfaces';

@Component({
    selector: 'app-projects',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TagModule,
        AvatarModule,
        AvatarGroupModule,
        DividerModule,
        ProgressBarModule,
        TabsModule,
        DragDropModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        DatePickerModule,
        ConfirmDialogModule,
        MultiSelectModule,
        TooltipModule
    ],
    providers: [ConfirmationService],
    templateUrl: './projects.component.html',
    styleUrl: './projects.component.scss'
})
export class Projects {
    // API Projects
    apiProjects: any[] = [];
    
    // Current logged-in user
    currentUser: Member = {
        name: 'Ioni Bowcher',
        avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png',
        role: 'Developer'
    };
    
    // Project state
    selectedProject: Project | null = null;
    draggedProject: Project | null = null;
    dialogVisible = false;
    dialogMode: 'add' | 'edit' = 'add';
    currentProject: Project = this.getEmptyProject();
    startDate: Date | null = null;
    endDate: Date | null = null;
    
    // Objective state
    objectiveDialogVisible = false;
    objectiveDialogMode: 'add' | 'edit' = 'add';
    currentObjective: Objective = this.getEmptyObjective();
    selectedMemberNames: string[] = [];
    selectedObjectiveMemberNames: string[] = [];
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
    
    // Resource dialog
    resourceDialogVisible = false;
    resourceDialogMode: 'add' | 'edit' = 'add';
    currentResource: Resource = this.getEmptyResource();
    
    // Available members
    availableMembers: Member[] = [
        { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Project Lead' },
        { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', role: 'Hardware Engineer' },
        { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png', role: 'Software Developer' },
        { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'UI/UX Designer' },
        { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Lead Engineer' },
        { name: 'Ioni Bowcher', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png', role: 'Technician' }
    ];
    
    // Select options
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

    // Sample projects data
    projects: Project[] = [
        {
            id: 1,
            title: 'Smart Home Automation System',
            description: 'Develop an IoT-based home automation system using Arduino and Raspberry Pi to control lights, temperature, and security.',
            status: 'in-progress',
            startDate: 'Nov 1, 2025',
            endDate: 'Feb 28, 2026',
            progress: 65,
            participants: [
                { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Project Lead' },
                { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', role: 'Hardware Engineer' },
                { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png', role: 'Software Developer' },
                { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'UI/UX Designer' }
            ],
            objectives: [
                {
                    id: 1,
                    title: 'Circuit Design & Hardware Setup',
                    description: 'Design and assemble the circuit board with sensors and actuators',
                    status: 'completed',
                    assignedTo: { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', role: 'Hardware Engineer' },
                    progress: 100
                },
                {
                    id: 2,
                    title: 'Backend API Development',
                    description: 'Create RESTful API for device control and monitoring',
                    status: 'in-progress',
                    assignedTo: { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png', role: 'Software Developer' },
                    progress: 70
                },
                {
                    id: 3,
                    title: 'Mobile App UI Design',
                    description: 'Design user-friendly mobile interface for system control',
                    status: 'in-progress',
                    assignedTo: { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'UI/UX Designer' },
                    progress: 50
                },
                {
                    id: 4,
                    title: 'System Integration & Testing',
                    description: 'Integrate all components and perform end-to-end testing',
                    status: 'todo',
                    assignedTo: { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Project Lead' },
                    progress: 0
                }
            ],
            resources: [
                {
                    id: 1,
                    title: 'Arduino Home Automation Guide',
                    url: 'https://www.arduino.cc/en/Tutorial/HomePage',
                    description: 'Official Arduino tutorials for IoT projects',
                    type: 'tutorial'
                },
                {
                    id: 2,
                    title: 'MQTT Protocol Documentation',
                    url: 'https://mqtt.org/documentation',
                    description: 'Communication protocol for IoT devices',
                    type: 'documentation'
                },
                {
                    id: 3,
                    title: 'Home Assistant Integration',
                    url: 'https://www.home-assistant.io/',
                    description: 'Open source home automation platform',
                    type: 'tool'
                }
            ]
        },
        {
            id: 2,
            title: '3D Printer Upgrade Project',
            description: 'Upgrade existing 3D printers with auto-leveling sensors and improved cooling systems.',
            status: 'in-progress',
            startDate: 'Dec 1, 2025',
            endDate: 'Jan 15, 2026',
            progress: 40,
            participants: [
                { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Lead Engineer' },
                { name: 'Ioni Bowcher', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png', role: 'Technician' }
            ],
            objectives: [
                {
                    id: 1,
                    title: 'Install Auto-Leveling Sensors',
                    description: 'Add BLTouch sensors to all printers',
                    status: 'in-progress',
                    assignedTo: { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Lead Engineer' },
                    progress: 60
                },
                {
                    id: 2,
                    title: 'Upgrade Cooling Systems',
                    description: 'Replace fans with high-performance cooling solution',
                    status: 'todo',
                    assignedTo: { name: 'Ioni Bowcher', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png', role: 'Technician' },
                    progress: 20
                }
            ]
        },
        {
            id: 3,
            title: 'Community Website Redesign',
            description: 'Redesign the FLOSSK community website with modern UI and improved user experience.',
            status: 'upcoming',
            startDate: 'Jan 15, 2026',
            endDate: 'Mar 30, 2026',
            progress: 0,
            participants: [
                { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'Lead Designer' },
                { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png', role: 'Frontend Developer' }
            ],
            objectives: [
                {
                    id: 1,
                    title: 'Requirements Gathering',
                    description: 'Collect feedback and requirements from community members',
                    status: 'todo',
                    assignedTo: { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'Lead Designer' },
                    progress: 0
                },
                {
                    id: 2,
                    title: 'UI/UX Design',
                    description: 'Create wireframes and high-fidelity mockups',
                    status: 'completed',
                    assignedTo: { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png', role: 'Lead Designer' },
                    progress: 0
                }
            ]
        },
        {
            id: 4,
            title: 'Robotics Competition Team',
            description: 'Build and program a robot for the regional robotics competition in March 2026.',
            status: 'completed',
            startDate: 'Sep 1, 2025',
            endDate: 'Nov 30, 2025',
            progress: 100,
            participants: [
                { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', role: 'Team Captain' },
                { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Programmer' },
                { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Mechanical Engineer' }
            ],
            objectives: [
                {
                    id: 1,
                    title: 'Robot Design & Build',
                    description: 'Design and construct the robot chassis and mechanisms',
                    status: 'completed',
                    assignedTo: { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Mechanical Engineer' },
                    progress: 100
                },
                {
                    id: 2,
                    title: 'Programming & Testing',
                    description: 'Write control software and test robot performance',
                    status: 'completed',
                    assignedTo: { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Programmer' },
                    progress: 100
                }
            ]
        },
        {
            id: 5,
            title: 'Create FLOSSK Management System',
            description: 'Handles all NGO events including workshops, bootcamps, hackathons, speaking events, and meetups.',
            status: 'upcoming',
            startDate: 'Sep 1, 2025',
            endDate: 'Nov 30, 2025',
            progress: 100,
            githubRepo: 'Daxrsa/sakai-ng',
            participants: [
                { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png', role: 'Team Captain' },
                { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Programmer' },
                { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Mechanical Engineer' }
            ],
            objectives: [
                {
                    id: 1,
                    title: 'Create Frontend',
                    description: 'Create a responsive dashboard',
                    status: 'in-progress',
                    assignedTo: { name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png', role: 'Mechanical Engineer' },
                    progress: 40
                },
                {
                    id: 2,
                    title: 'Create Backend',
                    description: 'Create a REST API for handling requests',
                    status: 'todo',
                    assignedTo: { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Programmer' },
                    progress: 0
                }
            ],
            resources: [
                {
                    id: 1,
                    title: 'FLOSSK Management System Requirements',
                    url: 'https://docs.google.com/document/d/1TQnmEBGvfp3RGmQpFvrh2fJIs3a49xb18ECVs_x0XXY/edit?tab=t.0',
                    description: 'Project requirements and specifications document',
                    type: 'documentation'
                }
            ]
        }
    ];

    // GitHub Integration Properties
    githubCommits: Map<number, GitHubCommit[]> = new Map();
    loadingGithubCommits: Set<number> = new Set();
    githubError: Map<number, string> = new Map();
    githubPagination: Map<number, { currentPage: number; hasMore: boolean; totalCommits: number }> = new Map();
    loadingMoreCommits: Set<number> = new Set();

    constructor(
        private confirmationService: ConfirmationService,
        private http: HttpClient,
        private projectsService: ProjectsService
    ) {
        this.loadApiProjects();
    }

    // API Methods
    private loadApiProjects(): void {
        this.projectsService.getProjects().subscribe({
            next: (projects) => {
                this.apiProjects = projects;
                console.log('Projects loaded:', projects);
            },
            error: (error) => {
                console.error('Error fetching projects:', error);
            }
        });
    }

    // Project Methods
    getProjectsByStatus(status: string): Project[] {
        return this.projects.filter(p => p.status === status);
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

    // Drag and Drop - Objectives
    dragStartObjective(objective: Objective): void {
        this.draggedObjective = objective;
    }

    dragEndObjective(): void {
        this.draggedObjective = null;
    }

    onDropObjective(event: any, newStatus: 'todo' | 'in-progress' | 'completed'): void {
        if (this.draggedObjective && this.selectedProject) {
            const objective = this.selectedProject.objectives.find(o => o.id === this.draggedObjective!.id);
            if (objective && objective.status !== newStatus) {
                objective.status = newStatus;
                
                if (newStatus === 'todo') {
                    objective.progress = 0;
                } else if (newStatus === 'completed') {
                    objective.progress = 100;
                }
                if (newStatus === 'in-progress' && objective.progress === 0) {
                    objective.progress = 50;
                }
                
                const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
                if (projectIndex !== -1) {
                    this.projects[projectIndex] = this.selectedProject;
                }
            }
            this.draggedObjective = null;
        }
    }

    // Drag and Drop - Projects
    dragStart(project: Project): void {
        this.draggedProject = project;
    }

    dragEnd(): void {
        this.draggedProject = null;
    }

    onDrop(event: any, newStatus: 'upcoming' | 'in-progress' | 'completed'): void {
        if (this.draggedProject) {
            const project = this.projects.find(p => p.id === this.draggedProject!.id);
            if (project && project.status !== newStatus) {
                project.status = newStatus;

                if (newStatus === 'upcoming') {
                    project.progress = 0;
                } else if (newStatus === 'completed') {
                    project.progress = 100;
                }
            }
            this.draggedProject = null;
        }
    }
    
    // Empty Object Factories
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

    getEmptyObjective(): Objective {
        return {
            id: 0,
            title: '',
            description: '',
            status: 'todo',
            assignedTo: { name: 'Unassigned', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png', role: 'Member' },
            progress: 0,
            members: []
        };
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
    
    // Utility Methods
    formatDate(date: Date): string {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
    
    // Project Dialog Methods
    openAddDialog(): void {
        this.dialogMode = 'add';
        this.currentProject = this.getEmptyProject();
        this.startDate = null;
        this.endDate = null;
        this.selectedMemberNames = [];
        this.dialogVisible = true;
    }
    
    openEditDialog(project: Project): void {
        this.dialogMode = 'edit';
        this.currentProject = { ...project, participants: [...project.participants], objectives: [...project.objectives] };
        this.startDate = project.startDate ? new Date(project.startDate) : null;
        this.endDate = project.endDate ? new Date(project.endDate) : null;
        this.selectedMemberNames = project.participants.map(p => p.name);
        this.dialogVisible = true;
    }
    
    saveProject(): void {
        if (this.startDate) {
            this.currentProject.startDate = this.formatDate(this.startDate);
        }
        if (this.endDate) {
            this.currentProject.endDate = this.formatDate(this.endDate);
        }
        
        this.currentProject.participants = this.availableMembers.filter(m => 
            this.selectedMemberNames.includes(m.name)
        );
        
        if (this.dialogMode === 'add') {
            const maxId = this.projects.length > 0 
                ? Math.max(...this.projects.map(p => p.id)) 
                : 0;
            this.currentProject.id = maxId + 1;
            this.currentProject.status = 'upcoming';
            this.currentProject.progress = 0;
            this.currentProject.objectives = [];
            this.projects.push(this.currentProject);
        } else {
            const index = this.projects.findIndex(p => p.id === this.currentProject.id);
            if (index !== -1) {
                if (this.currentProject.status === 'upcoming') {
                    this.currentProject.progress = 0;
                } else if (this.currentProject.status === 'completed') {
                    this.currentProject.progress = 100;
                }
                this.projects[index] = this.currentProject;
            }
        }
        this.dialogVisible = false;
    }
    
    confirmDeleteProject(project: Project): void {
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
    
    deleteProject(project: Project): void {
        this.projects = this.projects.filter(p => p.id !== project.id);
        if (this.selectedProject?.id === project.id) {
            this.selectedProject = null;
        }
    }
    
    // Objective Dialog Methods
    openAddObjectiveDialog(): void {
        if (!this.selectedProject) return;
        this.objectiveDialogMode = 'add';
        this.currentObjective = this.getEmptyObjective();
        this.selectedObjectiveMemberNames = [];
        this.objectiveDialogVisible = true;
    }
    
    openEditObjectiveDialog(objective: Objective): void {
        this.objectiveDialogMode = 'edit';
        this.currentObjective = { ...objective, assignedTo: { ...objective.assignedTo }, members: objective.members ? [...objective.members] : [] };
        this.selectedObjectiveMemberNames = objective.members ? objective.members.map(m => m.name) : [];
        this.objectiveDialogVisible = true;
    }
    
    saveObjective(): void {
        if (!this.selectedProject) return;
        
        this.currentObjective.members = this.availableMembers.filter(m => 
            this.selectedObjectiveMemberNames.includes(m.name)
        );
        
        if (this.objectiveDialogMode === 'add') {
            const maxId = this.selectedProject.objectives.length > 0
                ? Math.max(...this.selectedProject.objectives.map(o => o.id))
                : 0;
            this.currentObjective.id = maxId + 1;
            this.selectedProject.objectives.push(this.currentObjective);
        } else {
            const index = this.selectedProject.objectives.findIndex(o => o.id === this.currentObjective.id);
            if (index !== -1) {
                this.selectedProject.objectives[index] = this.currentObjective;
            }
        }
        
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
        
        this.objectiveDialogVisible = false;
    }
    
    confirmDeleteObjective(objective: Objective): void {
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
    
    deleteObjective(objective: Objective): void {
        if (!this.selectedProject) return;
        this.selectedProject.objectives = this.selectedProject.objectives.filter(o => o.id !== objective.id);
        
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
    }
    
    // User Membership Methods
    isUserMember(project: Project): boolean {
        return project.participants.some(p => p.name === this.currentUser.name);
    }
    
    joinProject(project: Project, event: Event): void {
        event.stopPropagation();
        if (!this.isUserMember(project)) {
            project.participants.push({ ...this.currentUser });
        }
    }
    
    leaveProject(project: Project, event: Event): void {
        event.stopPropagation();
        project.participants = project.participants.filter(p => p.name !== this.currentUser.name);
    }
    
    isUserInObjective(objective: Objective): boolean {
        return objective.members ? objective.members.some(m => m.name === this.currentUser.name) : false;
    }
    
    joinObjective(objective: Objective, event: Event): void {
        event.stopPropagation();
        if (!objective.members) {
            objective.members = [];
        }
        if (!this.isUserInObjective(objective)) {
            objective.members.push({ ...this.currentUser });
        }
    }
    
    leaveObjective(objective: Objective, event: Event): void {
        event.stopPropagation();
        if (objective.members) {
            objective.members = objective.members.filter(m => m.name !== this.currentUser.name);
        }
    }
    
    // Resource Dialog Methods
    openAddResourceDialog(): void {
        if (!this.selectedProject) return;
        this.resourceDialogMode = 'add';
        this.currentResource = this.getEmptyResource();
        this.resourceDialogVisible = true;
    }
    
    openEditResourceDialog(resource: Resource): void {
        this.resourceDialogMode = 'edit';
        this.currentResource = { ...resource };
        this.resourceDialogVisible = true;
    }
    
    saveResource(): void {
        if (!this.selectedProject) return;
        
        if (!this.selectedProject.resources) {
            this.selectedProject.resources = [];
        }
        
        if (this.resourceDialogMode === 'add') {
            const maxId = this.selectedProject.resources.length > 0
                ? Math.max(...this.selectedProject.resources.map(r => r.id))
                : 0;
            this.currentResource.id = maxId + 1;
            this.selectedProject.resources.push(this.currentResource);
        } else {
            const index = this.selectedProject.resources.findIndex(r => r.id === this.currentResource.id);
            if (index !== -1) {
                this.selectedProject.resources[index] = this.currentResource;
            }
        }
        
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
        
        this.resourceDialogVisible = false;
    }
    
    confirmDeleteResource(resource: Resource): void {
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
    
    deleteResource(resource: Resource): void {
        if (!this.selectedProject || !this.selectedProject.resources) return;
        this.selectedProject.resources = this.selectedProject.resources.filter(r => r.id !== resource.id);
        
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
    }
    
    // Objective Detail Dialog Methods
    openObjectiveDetailDialog(objective: Objective): void {
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
    
    openAddObjectiveResourceDialog(): void {
        if (!this.viewingObjective) return;
        this.objectiveResourceDialogMode = 'add';
        this.currentObjectiveResource = this.getEmptyResource();
        this.objectiveResourceDialogVisible = true;
    }
    
    openEditObjectiveResourceDialog(resource: Resource): void {
        this.objectiveResourceDialogMode = 'edit';
        this.currentObjectiveResource = { ...resource };
        this.objectiveResourceDialogVisible = true;
    }
    
    saveObjectiveResource(): void {
        if (!this.viewingObjective || !this.selectedProject) return;
        
        if (!this.viewingObjective.resources) {
            this.viewingObjective.resources = [];
        }
        
        if (this.objectiveResourceDialogMode === 'add') {
            const maxId = this.viewingObjective.resources.length > 0
                ? Math.max(...this.viewingObjective.resources.map(r => r.id))
                : 0;
            this.currentObjectiveResource.id = maxId + 1;
            this.viewingObjective.resources.push({ ...this.currentObjectiveResource });
        } else {
            const index = this.viewingObjective.resources.findIndex(r => r.id === this.currentObjectiveResource.id);
            if (index !== -1) {
                this.viewingObjective.resources[index] = { ...this.currentObjectiveResource };
            }
        }
        
        const objectiveIndex = this.selectedProject.objectives.findIndex(o => o.id === this.viewingObjective!.id);
        if (objectiveIndex !== -1) {
            this.selectedProject.objectives[objectiveIndex] = this.viewingObjective;
        }
        
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
        
        this.objectiveResourceDialogVisible = false;
    }
    
    confirmDeleteObjectiveResource(resource: Resource): void {
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
    
    deleteObjectiveResource(resource: Resource): void {
        if (!this.viewingObjective || !this.viewingObjective.resources || !this.selectedProject) return;
        this.viewingObjective.resources = this.viewingObjective.resources.filter(r => r.id !== resource.id);
        
        const objectiveIndex = this.selectedProject.objectives.findIndex(o => o.id === this.viewingObjective!.id);
        if (objectiveIndex !== -1) {
            this.selectedProject.objectives[objectiveIndex] = this.viewingObjective;
        }
        
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
    }
    
    joinObjectiveFromDetail(): void {
        if (!this.viewingObjective) return;
        if (!this.viewingObjective.members) {
            this.viewingObjective.members = [];
        }
        if (!this.isUserInObjective(this.viewingObjective)) {
            this.viewingObjective.members.push({ ...this.currentUser });
            this.updateObjectiveInProject();
        }
    }
    
    leaveObjectiveFromDetail(): void {
        if (!this.viewingObjective || !this.viewingObjective.members) return;
        this.viewingObjective.members = this.viewingObjective.members.filter(m => m.name !== this.currentUser.name);
        this.updateObjectiveInProject();
    }
    
    editObjectiveFromDetail(): void {
        if (!this.viewingObjective) return;
        this.objectiveDetailDialogVisible = false;
        this.openEditObjectiveDialog(this.viewingObjective);
    }
    
    updateObjectiveInProject(): void {
        if (!this.viewingObjective || !this.selectedProject) return;
        
        const objectiveIndex = this.selectedProject.objectives.findIndex(o => o.id === this.viewingObjective!.id);
        if (objectiveIndex !== -1) {
            this.selectedProject.objectives[objectiveIndex] = this.viewingObjective;
        }
        
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
    }

    // Member Assignment Methods
    getProjectParticipantsForObjective(): Member[] {
        if (!this.selectedProject) return this.availableMembers;
        return this.selectedProject.participants.length > 0 
            ? this.selectedProject.participants 
            : this.availableMembers;
    }
    
    openAssignMembersToProjectDialog(): void {
        if (!this.selectedProject) return;
        this.tempSelectedProjectMembers = this.selectedProject.participants.map(p => p.name);
        this.assignMembersToProjectDialogVisible = true;
    }
    
    saveProjectMembers(): void {
        if (!this.selectedProject) return;
        
        this.selectedProject.participants = this.availableMembers.filter(m => 
            this.tempSelectedProjectMembers.includes(m.name)
        );
        
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
        
        this.assignMembersToProjectDialogVisible = false;
    }
    
    openAssignMembersToObjectiveDialog(objective: Objective, event: Event): void {
        event.stopPropagation();
        this.assigningObjective = objective;
        this.tempSelectedObjectiveMembers = objective.members ? objective.members.map(m => m.name) : [];
        this.assignMembersToObjectiveDialogVisible = true;
    }
    
    openAssignMembersToObjectiveFromDetail(): void {
        if (!this.viewingObjective) return;
        this.assigningObjective = this.viewingObjective;
        this.tempSelectedObjectiveMembers = this.viewingObjective.members ? this.viewingObjective.members.map(m => m.name) : [];
        this.assignMembersToObjectiveDialogVisible = true;
    }
    
    saveObjectiveMembers(): void {
        if (!this.assigningObjective || !this.selectedProject) return;
        
        const projectParticipants = this.getProjectParticipantsForObjective();
        this.assigningObjective.members = projectParticipants.filter(m => 
            this.tempSelectedObjectiveMembers.includes(m.name)
        );
        
        const objectiveIndex = this.selectedProject.objectives.findIndex(o => o.id === this.assigningObjective!.id);
        if (objectiveIndex !== -1) {
            this.selectedProject.objectives[objectiveIndex] = this.assigningObjective;
        }
        
        const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
        if (projectIndex !== -1) {
            this.projects[projectIndex] = this.selectedProject;
        }
        
        if (this.viewingObjective && this.viewingObjective.id === this.assigningObjective.id) {
            this.viewingObjective = this.assigningObjective;
        }
        
        this.assignMembersToObjectiveDialogVisible = false;
        this.assigningObjective = null;
    }

    // Remove Member Methods
    removeMemberFromProject(member: Member): void {
        if (!this.selectedProject) return;
        
        this.confirmationService.confirm({
            message: `Are you sure you want to remove "${member.name}" from this project?`,
            header: 'Remove Member',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                if (!this.selectedProject) return;
                this.selectedProject.participants = this.selectedProject.participants.filter(p => p.name !== member.name);
                
                const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
                if (projectIndex !== -1) {
                    this.projects[projectIndex] = this.selectedProject;
                }
            }
        });
    }
    
    removeMemberFromObjectiveDetail(member: Member): void {
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
    
    removeProjectMemberFromDialog(member: Member): void {
        this.tempSelectedProjectMembers = this.tempSelectedProjectMembers.filter(name => name !== member.name);
        
        if (this.selectedProject) {
            this.selectedProject.participants = this.selectedProject.participants.filter(p => p.name !== member.name);
            
            const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
            if (projectIndex !== -1) {
                this.projects[projectIndex] = this.selectedProject;
            }
        }
    }
    
    removeObjectiveMemberFromDialog(member: Member): void {
        this.tempSelectedObjectiveMembers = this.tempSelectedObjectiveMembers.filter(name => name !== member.name);
        
        if (this.assigningObjective && this.assigningObjective.members) {
            this.assigningObjective.members = this.assigningObjective.members.filter(m => m.name !== member.name);
            
            if (this.selectedProject) {
                const objectiveIndex = this.selectedProject.objectives.findIndex(o => o.id === this.assigningObjective!.id);
                if (objectiveIndex !== -1) {
                    this.selectedProject.objectives[objectiveIndex] = this.assigningObjective;
                }
                
                const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject!.id);
                if (projectIndex !== -1) {
                    this.projects[projectIndex] = this.selectedProject;
                }
            }
            
            if (this.viewingObjective && this.viewingObjective.id === this.assigningObjective.id) {
                this.viewingObjective = this.assigningObjective;
            }
        }
    }

    // GitHub Integration Methods
    loadGithubCommits(project: Project, loadMore: boolean = false): void {
        if (!project.githubRepo || this.loadingGithubCommits.has(project.id)) {
            return;
        }

        if (loadMore) {
            this.loadingMoreCommits.add(project.id);
        } else {
            this.loadingGithubCommits.add(project.id);
            this.githubError.delete(project.id);
            this.githubPagination.set(project.id, { currentPage: 1, hasMore: true, totalCommits: 0 });
        }

        const [owner, repo] = project.githubRepo.split('/');
        
        if (!owner || !repo) {
            this.githubError.set(project.id, 'Invalid GitHub repository format');
            this.loadingGithubCommits.delete(project.id);
            this.loadingMoreCommits.delete(project.id);
            return;
        }

        const paginationInfo = this.githubPagination.get(project.id) || { currentPage: 1, hasMore: true, totalCommits: 0 };
        const page = loadMore ? paginationInfo.currentPage : 1;
        const perPage = 10;
        
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
                            const existingCommits = this.githubCommits.get(project.id) || [];
                            this.githubCommits.set(project.id, [...existingCommits, ...commits]);
                        } else {
                            this.githubCommits.set(project.id, commits);
                        }

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

    loadMoreCommits(project: Project): void {
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

    selectProject(project: Project): void {
        this.selectedProject = project;
        if (project.githubRepo) {
            this.loadGithubCommits(project);
        }
    }
}
