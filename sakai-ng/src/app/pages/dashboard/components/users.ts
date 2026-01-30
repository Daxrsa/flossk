import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService } from 'primeng/api';
import { environment } from '@environments/environment.prod';

interface User {
    id: string;
    firstName: string; 
    lastName: string;
    email: string;
    profilePictureUrl: string;
    roles: string[];
    rfid: boolean;
}

@Component({
    selector: 'app-users',
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, AvatarModule, ConfirmDialogModule, CheckboxModule, SkeletonModule],
    providers: [ConfirmationService],
    template: `
    <p-confirmdialog></p-confirmdialog>
    
    <div class="card">
        <div class="font-semibold text-xl mb-4">All Users</div>
        
        @if (loading) {
            <div class="flex flex-col gap-4">
                @for (i of [1,2,3,4,5]; track i) {
                    <div class="flex items-center gap-4">
                        <p-skeleton shape="circle" size="3rem"></p-skeleton>
                        <p-skeleton width="10rem" height="1rem"></p-skeleton>
                        <p-skeleton width="15rem" height="1rem"></p-skeleton>
                        <p-skeleton width="6rem" height="1rem"></p-skeleton>
                    </div>
                }
            </div>
        } @else {
            <p-table [value]="users" [tableStyle]="{ 'min-width': '50rem' }" [paginator]="true" [rows]="10" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users">
                <ng-template #header>
                    <tr>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>RFID</th>
                        <th></th>
                    </tr>
                </ng-template>
                <ng-template #body let-user>
                    <tr class="cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors" (click)="viewUserProfile(user)">
                        <td>
                            <p-avatar 
                                [image]="getProfilePictureUrl(user.profilePictureUrl)" 
                                shape="circle">
                            </p-avatar>
                        </td>
                        <td>{{ user.firstName }} {{ user.lastName }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.roles[0] || 'User' }}</td>
                        <td>
                            <div class="flex align-items-center gap-3">
                                <div class="flex align-items-center gap-2">
                                    <p-checkbox 
                                        [(ngModel)]="user.rfid" 
                                        [binary]="true" 
                                        inputId="yes-{{user.id}}"
                                        [trueValue]="true"
                                        [falseValue]="false"
                                        (click)="$event.stopPropagation()"
                                        (onChange)="onRfidChange(user)"
                                    />
                                    <label [for]="'yes-' + user.id">Yes</label>
                                </div>
                                <div class="flex align-items-center gap-2">
                                    <p-checkbox 
                                        [(ngModel)]="user.rfid" 
                                        [binary]="true" 
                                        inputId="no-{{user.id}}"
                                        [trueValue]="false"
                                        [falseValue]="true"
                                        (click)="$event.stopPropagation()"
                                        (onChange)="onRfidChange(user)"
                                    />
                                    <label [for]="'no-' + user.id">No</label>
                                </div>
                            </div>
                        </td>
                        <td (click)="$event.stopPropagation()">
                            <p-button icon="pi pi-trash" [text]="true" severity="danger" (onClick)="confirmDelete(user)"></p-button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        }
    </div>
    `
})
export class Users implements OnInit {
    private http = inject(HttpClient);
    private router = inject(Router);
    
    users: User[] = [];
    loading = true;

    constructor(private confirmationService: ConfirmationService) {}

    viewUserProfile(user: User) {
        this.router.navigate(['/profile', user.id]);
    }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.http.get<any>(`${environment.apiUrl}/Auth/users?page=1&pageSize=10`).subscribe({
            next: (response) => {
                console.log('Users response:', response);
                this.users = response.users;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading users:', err);
                this.loading = false;
            }
        });
    }

    confirmDelete(user: User) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteUser(user);
            }
        });
    }

    deleteUser(user: User) {
        this.http.delete(`${environment.apiUrl}/Auth/users/${user.id}`).subscribe({
            next: () => {
                console.log('User deleted successfully:', user.id);
                this.users = this.users.filter(u => u.id !== user.id);
            },
            error: (err) => {
                console.error('Error deleting user:', err);
            }
        });
    }

    onRfidChange(user: User) {
        console.log('RFID changed for user:', user.id, user.firstName, user.lastName, '- New value:', user.rfid);
        this.http.patch(`${environment.apiUrl}/Auth/users/toggle-rfid/${user.id}`, {}).subscribe({
            next: () => {
                console.log('RFID updated successfully for user:', user.id);
            },
            error: (err) => {
                console.error('Error updating RFID:', err);
                // Revert the change on error
                user.rfid = !user.rfid;
            }
        });
    }

    getProfilePictureUrl(profilePictureUrl: string | null): string {
        if (!profilePictureUrl) {
            return 'assets/images/avatar.jpg';
        }
        if (profilePictureUrl.startsWith('http')) {
            return profilePictureUrl;
        }
        return `${environment.baseUrl}${profilePictureUrl}`;
    }
}
