import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment.prod';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { RatingModule } from 'primeng/rating';
import { GalleriaModule } from 'primeng/galleria';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputIcon } from "primeng/inputicon";
import { IconField } from "primeng/iconfield";
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '@/pages/service/auth.service';

interface User {
    id: number;
    name: string;
    avatar: string;
    email: string;
}

interface InventoryItem {
    id: string;
    name: string;
    description?: string;
    category: string;
    quantity: number;
    status: string;
    createdAt: string;
    updatedAt?: string;
    currentUserId?: string;
    currentUserEmail?: string;
    currentUserFirstName?: string;
    currentUserLastName?: string;
    currentUserFullName?: string;
    currentUserProfilePictureUrl?: string;
    checkedOutAt?: string;
    createdByUserId?: string;
    createdByUserEmail?: string;
    createdByUserFirstName?: string;
    createdByUserLastName?: string;
    createdByUserFullName?: string;
    createdByUserProfilePictureUrl?: string;
    thumbnailPath?: string;
    images?: InventoryItemImage[];
}

interface InventoryItemImage {
    id: string;
    fileId: string;
    fileName: string;
    filePath: string;
    addedAt: string;
}

interface PaginatedInventoryResponse {
    data: InventoryItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

@Component({
    selector: 'app-inventory',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TableModule,
        TagModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        SelectModule,
        ConfirmDialogModule,
        ToastModule,
        ToolbarModule,
        FileUploadModule,
        RatingModule,
        GalleriaModule,
        InputIcon,
        IconField,
        AvatarModule
    ],
    providers: [ConfirmationService, MessageService],
    styles: `
        .p-galleria-thumbnail-next-icon {
            display: none !important;
        }
        .p-galleria-thumbnail-prev-icon {
            display: none !important;
        }`,

    template: `
        <p-toast />
        <p-confirmDialog />
        
        <div class="card">
            <p-toolbar class="mb-6">
               
                     <ng-template #center>
                        <p-iconfield>
                            <p-inputicon>
                                <i class="pi pi-search"></i>
                            </p-inputicon>
                            <input pInputText placeholder="Search" />
                        </p-iconfield>
                    </ng-template>
                <div class="flex justify-content-center">
                    <p-button 
                        label="New Item" 
                        icon="pi pi-plus" 
                        severity="success" 
                        class="mr-2"
                        (onClick)="openAddDialog()"
                    />
                    <p-button 
                        label="Export" 
                        icon="pi pi-upload" 
                        severity="help" 
                        (onClick)="exportData()"
                    />
                </div>
               
            </p-toolbar>

            <p-table 
                [value]="inventoryItems" 
                [paginator]="true" 
                [rows]="10"
                [rowsPerPageOptions]="[5, 10, 20]"
                [tableStyle]="{ 'min-width': '75rem' }"
                [globalFilterFields]="['name', 'category', 'status']"
                #dt
            >
                <ng-template #header>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>

                <ng-template #body let-item>
                    <tr>
                        <td>
                            <div class="flex align-items-center gap-2">
                                <img 
                                    *ngIf="item.thumbnailPath || (item.images && item.images.length > 0)" 
                                    [src]="getImageUrl(item)" 
                                    [alt]="item.name" 
                                    width="50" 
                                    class="shadow-lg rounded cursor-pointer"
                                    (click)="showGallery(item)"
                                />
                                <span class="font-semibold">{{ item.name }}</span>
                            </div>
                        </td>
                        <td>{{ item.category }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>
                            <div class="flex items-center gap-2">
                                <p-tag 
                                    [value]="getStatusLabel(item.status)" 
                                    [severity]="getStatusSeverity(item.status)"
                                />
                                <div *ngIf="item.currentUserFullName" class="flex items-center gap-2">
                                    <p-avatar
                                        *ngIf="item.currentUserProfilePictureUrl"
                                        [image]="getProfilePictureUrl(item.currentUserProfilePictureUrl)"
                                        shape="circle"
                                        size="normal"
                                    />
                                    <p-avatar
                                        *ngIf="!item.currentUserProfilePictureUrl"
                                        [label]="getUserInitials(item.currentUserFullName)"
                                        shape="circle"
                                        size="normal"
                                        [style]="{'background-color': 'var(--primary-color)', 'color': 'var(--primary-color-text)'}"
                                    />
                                    <span class="text-sm">
                                        {{ item.currentUserFullName }}
                                    </span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button 
                                    *ngIf="item.status === 'Free'"
                                    icon="pi pi-sign-in" 
                                    [rounded]="true" 
                                    [text]="true" 
                                    severity="success"
                                    pTooltip="Check Out"
                                    (onClick)="checkOutItem(item)"
                                />
                                <p-button 
                                    *ngIf="item.status === 'InUse'"
                                    icon="pi pi-sign-out" 
                                    [rounded]="true" 
                                    [text]="true" 
                                    severity="warn"
                                    pTooltip="Check In"
                                    (onClick)="checkInItem(item)"
                                />
                                <p-button 
                                    icon="pi pi-pencil" 
                                    [rounded]="true" 
                                    [text]="true" 
                                    severity="secondary"
                                    pTooltip="Edit"
                                    (onClick)="openEditDialog(item)"
                                />
                                <p-button 
                                    icon="pi pi-trash" 
                                    [rounded]="true" 
                                    [text]="true" 
                                    severity="danger"
                                    pTooltip="Delete"
                                    (onClick)="confirmDelete(item)"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template #emptymessage>
                    <tr>
                        <td colspan="8" class="text-center py-6">
                            <div class="flex flex-col items-center gap-3">
                                <i class="pi pi-inbox text-6xl text-muted-color"></i>
                                <p class="text-xl text-muted-color">No items found</p>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Add/Edit Dialog -->
        <p-dialog 
            [(visible)]="dialogVisible" 
            [header]="dialogMode === 'add' ? 'Add New Item' : 'Edit Item'"
            [modal]="true" 
            [style]="{ width: '50rem' }"
            [breakpoints]="{ '1199px': '75vw', '575px': '90vw' }"
            [contentStyle]="{ 'max-height': '70vh', 'overflow-y': 'auto' }"
        >
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label for="name" class="font-semibold">Name</label>
                    <input 
                        pInputText 
                        id="name" 
                        [(ngModel)]="currentItem.name" 
                        required 
                        class="w-full"
                    />
                </div>

                <div class="flex flex-col gap-2">
                    <label for="description" class="font-semibold">Description</label>
                    <textarea 
                        pTextarea 
                        id="description" 
                        [(ngModel)]="currentItem.description" 
                        rows="3"
                        class="w-full"
                    ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="category" class="font-semibold">Category</label>
                        <p-select 
                            id="category"
                            [(ngModel)]="currentItem.category" 
                            [options]="categories"
                            placeholder="Select a category"
                            class="w-full"
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="quantity" class="font-semibold">Quantity</label>
                        <p-inputNumber
                            id="quantity"
                            [(ngModel)]="currentItem.quantity"
                            [showButtons]="true"
                            [min]="0"
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="rating" class="font-semibold">Rating</label>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Product Images</label>
                    <p-fileUpload
                        mode="basic"
                        chooseLabel="Upload Images"
                        accept="image/*"
                        [maxFileSize]="5000000"
                        [multiple]="true"
                        (onSelect)="onImagesSelect($event)"
                        [auto]="true"
                        styleClass="w-full mb-2"
                    />
                    <div class="flex flex-col gap-2">
                        <div *ngIf="currentItem.images && currentItem.images.length > 0">
                            <div *ngFor="let img of currentItem.images; let i = index" class="flex gap-2 align-items-center border rounded p-2 mb-2">
                                <img 
                                    [src]="img" 
                                    alt="Image {{i+1}}" 
                                    class="w-20 h-20 object-cover rounded"
                                />
                                <span class="flex-1 text-sm truncate">Image {{i+1}}</span>
                                <p-button 
                                    icon="pi pi-times" 
                                    [rounded]="true" 
                                    [text]="true" 
                                    severity="danger"
                                    (onClick)="removeImage(i)"
                                />
                            </div>
                        </div>
                        <div *ngIf="!currentItem.images || currentItem.images.length === 0" class="text-muted-color text-sm">
                            No images uploaded
                        </div>
                    </div>
                </div>
            </div>

            <ng-template #footer>
                <div class="flex justify-end gap-2 mt-4">
                    <p-button 
                        label="Cancel" 
                        severity="secondary" 
                        (onClick)="dialogVisible = false"
                    />
                    <p-button 
                        [label]="dialogMode === 'add' ? 'Create' : 'Update'" 
                        (onClick)="saveItem()"
                    />
                </div>
            </ng-template>
        </p-dialog>

        <!-- Single Image Dialog -->
        <p-dialog 
            [(visible)]="singleImageVisible" 
            [header]="selectedItem?.name"
            [modal]="true" 
            [contentStyle]="{ 'padding': '1rem', 'display': 'flex', 'justify-content': 'center' }"
        >
            <img 
                *ngIf="selectedItem"
                [src]="getImageUrl(selectedItem)" 
                [alt]="selectedItem.name"
                style="max-width: 100%; max-height: 70vh; object-fit: contain;"
            />
        </p-dialog>

        <!-- Gallery Dialog -->
        <p-dialog 
            [(visible)]="galleryVisible" 
            [header]="galleryItem?.name"
            [modal]="true" 
            [contentStyle]="{ 'padding': '0' }"
        >
            <p-galleria 
                *ngIf="galleryItem"
                [value]="getGalleryImages(galleryItem)" 
                [numVisible]="5"
                [responsiveOptions]="responsiveOptions"
                [circular]="true"
                [showItemNavigators]="true"
                [showThumbnails]="true"
                [containerStyle]="{ 'max-width': '100%' }"
            >
                <ng-template #item let-image>
                    <img [src]="image" style="width: 100%; max-height: 500px; object-fit: contain; display: block;" />
                </ng-template>
                <ng-template #thumbnail let-image>
                    <img [src]="image" style="width: 100%; height: 60px; object-fit: cover; display: block;" />
                </ng-template>
            </p-galleria>
        </p-dialog>
    `
})
export class Inventory implements OnInit {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = `${environment.apiUrl}/Inventory`;

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.loadInventoryItems();
    }

    loadInventoryItems() {
        this.http.get<PaginatedInventoryResponse>(
            `${this.apiUrl}?page=${this.currentPage}&pageSize=${this.pageSize}`
        ).subscribe({
            next: (response) => {
                console.log('Inventory API response:', response);
                this.inventoryItems = response.data;
                this.totalRecords = response.totalCount;
            },
            error: (error) => {
                console.error('Error loading inventory:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load inventory items'
                });
            }
        });
    }

    dialogVisible = false;
    dialogMode: 'add' | 'edit' = 'add';
    currentItem: any = this.getEmptyItem();
    galleryVisible = false;
    galleryItem: InventoryItem | null = null;
    singleImageVisible = false;
    selectedItem: InventoryItem | null = null;
    inventoryItems: InventoryItem[] = [];
    totalRecords = 0;
    currentPage = 1;
    pageSize = 20;

    responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 4
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 2
        }
    ];

    categories = [
        { label: 'Electronic', value: 'Electronic' },
        { label: 'Tool', value: 'Tool' },
        { label: 'Components', value: 'Components' },
        { label: 'Furniture', value: 'Furniture' },
        { label: 'Hardware', value: 'Hardware' },
        { label: 'Office Supplies', value: 'OfficeSupplies' }
    ];

    statusOptions = [
        { label: 'Free', value: 'Free' },
        { label: 'In Use', value: 'InUse' }
    ];

    showGallery(item: InventoryItem) {
        // Check if item has images
        const imageCount = item.images?.length || 0;

        if (imageCount > 1) {
            // Show gallery for multiple images
            this.galleryItem = item;
            this.galleryVisible = true;
        } else if (imageCount === 1) {
            // Show single image dialog
            this.selectedItem = item;
            this.singleImageVisible = true;
        }
    }

    getImageUrl(item: InventoryItem, index: number = 0): string {
        if (item.images && item.images.length > index) {
            return `${environment.baseUrl}${item.images[index].filePath}`;
        }
        return item.thumbnailPath ? `${environment.baseUrl}${item.thumbnailPath}` : '';
    }

    getGalleryImages(item: InventoryItem): string[] {
        if (item.images && item.images.length > 0) {
            return item.images.map(img => `${environment.baseUrl}${img.filePath}`);
        }
        return [];
    }

    getEmptyItem(): any {
        return {
            name: '',
            description: '',
            category: '',
            quantity: 0,
            status: 'Free'
        };
    }

    openAddDialog() {
        this.dialogMode = 'add';
        this.currentItem = this.getEmptyItem();
        this.dialogVisible = true;
    }

    openEditDialog(item: InventoryItem) {
        this.dialogMode = 'edit';
        this.currentItem = { ...item };
        // Initialize images array if it doesn't exist
        if (!this.currentItem.images) {
            this.currentItem.images = [];
        }
        this.dialogVisible = true;
    }

    onImagesSelect(event: any) {
        if (!this.currentItem.images) {
            this.currentItem.images = [];
        }

        const files = event.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.currentItem.images!.push(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage(index: number) {
        if (this.currentItem.images) {
            this.currentItem.images.splice(index, 1);
        }
    }

    saveItem() {
        if (!this.currentItem.name || !this.currentItem.category) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Name and Category are required'
            });
            return;
        }

        if (this.dialogMode === 'add') {
            // Create new item via API
            const createDto = {
                name: this.currentItem.name,
                description: this.currentItem.description || '',
                category: this.currentItem.category,
                quantity: this.currentItem.quantity || 1
            };
            
            this.http.post(this.apiUrl, createDto).subscribe({
                next: (response) => {
                    console.log('Item created:', response);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Item added successfully'
                    });
                    this.dialogVisible = false;
                    this.loadInventoryItems();
                },
                error: (error) => {
                    console.error('Error creating item:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error?.Errors?.[0] || 'Failed to create item'
                    });
                }
            });
        } else {
            // Update existing item via API
            const updateDto = {
                name: this.currentItem.name,
                description: this.currentItem.description || '',
                category: this.currentItem.category,
                quantity: this.currentItem.quantity || 1
            };
            
            this.http.put(`${this.apiUrl}/${this.currentItem.id}`, updateDto).subscribe({
                next: (response) => {
                    console.log('Item updated:', response);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Item updated successfully'
                    });
                    this.dialogVisible = false;
                    this.loadInventoryItems();
                },
                error: (error) => {
                    console.error('Error updating item:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error?.Errors?.[0] || 'Failed to update item'
                    });
                }
            });
        }
    }

    confirmDelete(item: InventoryItem) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${item.name}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteItem(item);
            }
        });
    }

    deleteItem(item: InventoryItem) {
        this.http.delete(`${this.apiUrl}/${item.id}`).subscribe({
            next: () => {
                console.log('Item deleted:', item.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Item deleted successfully'
                });
                this.loadInventoryItems();
            },
            error: (error) => {
                console.error('Error deleting item:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.Errors?.[0] || 'Failed to delete item'
                });
            }
        });
    }

    getStatusLabel(status: string): string {
        const labels: { [key: string]: string } = {
            'Free': 'Free',
            'InUse': 'In Use'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
        const severities: { [key: string]: 'success' | 'warn' | 'danger' } = {
            'Free': 'success',
            'InUse': 'warn'
        };
        return severities[status] || 'success';
    }

    exportData() {
        const dataStr = JSON.stringify(this.inventoryItems, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'inventory_export.json';
        link.click();
        URL.revokeObjectURL(url);

        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Inventory exported successfully'
        });
    }

    checkOutItem(item: InventoryItem) {
        this.http.post(`${this.apiUrl}/${item.id}/checkout`, {}).subscribe({
            next: (response) => {
                console.log('Check-out response:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `${item.name} checked out successfully`
                });
                this.loadInventoryItems();
            },
            error: (error) => {
                console.error('Error checking out item:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to check out item'
                });
            }
        });
    }

    checkInItem(item: InventoryItem) {
        this.http.post(`${this.apiUrl}/${item.id}/checkin`, {}).subscribe({
            next: (response) => {
                console.log('Check-in response:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `${item.name} checked in successfully`
                });
                this.loadInventoryItems();
            },
            error: (error) => {
                console.error('Error checking in item:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to check in item'
                });
            }
        });
    }

    getProfilePictureUrl(url: string | undefined): string {
        if (!url) return '';
        return url.startsWith('http') ? url : `${environment.baseUrl}${url}`;
    }

    getUserInitials(fullName: string | undefined): string {
        if (!fullName) return '?';
        const names = fullName.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }

    canCheckIn(item: InventoryItem): null | boolean {
        return null;
    }
}
