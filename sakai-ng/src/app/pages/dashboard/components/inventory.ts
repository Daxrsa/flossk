import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

interface User {
    id: number;
    name: string;
    avatar: string;
    email: string;
}

interface InventoryItem {
    id: number;
    name: string;
    description: string;
    category: string;
    quantity: number;
    price: number;
    status: 'free' | 'in-use';
    image?: string;
    images?: string[];
    rating?: number;
    location: string;
    lastUpdated: string;
    inUseBy?: User;
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
                        label="Import" 
                        icon="pi pi-download" 
                        severity="info" 
                        class="mr-2"
                    />
                    <p-button 
                        label="Export" 
                        icon="pi pi-upload" 
                        severity="help" 
                        (onClick)="exportData()"
                    />
                </div>
               
            </p-toolbar>

            <!-- Hidden file input for import -->
            <input 
                #importFileInput 
                type="file" 
                accept=".json" 
                style="display: none" 
               
            />

            <p-table 
                [value]="inventoryItems" 
                [paginator]="true" 
                [rows]="10"
                [rowsPerPageOptions]="[5, 10, 20]"
                [tableStyle]="{ 'min-width': '75rem' }"
                [globalFilterFields]="['name', 'category', 'location', 'status']"
                #dt
            >
                <ng-template #caption>
                    <div class="flex align-items-center justify-content-between">
                    
                    </div>
                </ng-template>

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
                                    *ngIf="item.images && item.images.length > 0" 
                                    [src]="item.images[0]" 
                                    [alt]="item.name" 
                                    width="50" 
                                    class="shadow-lg rounded cursor-pointer"
                                    (click)="showGallery(item)"
                                />
                                <img 
                                    *ngIf="(!item.images || item.images.length === 0) && item.image" 
                                    [src]="item.image" 
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
                            <div *ngIf="item.status === 'free'" class="flex items-center">
                                <p-tag 
                                    value="Free" 
                                    severity="success"
                                />
                            </div>
                            <div *ngIf="item.status === 'in-use' && item.inUseBy" class="flex items-center gap-3">
                                <p-tag 
                                    value="In Use" 
                                    severity="warn"
                                />
                                <div class="flex items-center gap-2">
                                    <p-avatar 
                                        [image]="item.inUseBy.avatar" 
                                        shape="circle" 
                                        size="normal"
                                        [style]="{'width': '2rem', 'height': '2rem'}"
                                    />
                                    <div class="flex flex-col">
                                        <span class="text-sm font-semibold">{{ item.inUseBy.name }}</span>
                                        <span class="text-xs text-muted-color">{{ item.inUseBy.email }}</span>
                                    </div>
                                </div>
                            </div>
                            <div *ngIf="item.status === 'in-use' && !item.inUseBy">
                                <p-tag 
                                    value="In Use" 
                                    severity="warn"
                                />
                            </div>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button 
                                    *ngIf="item.status === 'free'"
                                    icon="pi pi-sign-in" 
                                    [rounded]="true" 
                                    [text]="true" 
                                    severity="success"
                                    pTooltip="Check Out"
                                    (onClick)="checkOutItem(item)"
                                />
                                <p-button 
                                    *ngIf="item.status === 'in-use'"
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
                        <label for="location" class="font-semibold">Location</label>
                        <input 
                            pInputText 
                            id="location" 
                            [(ngModel)]="currentItem.location" 
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
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
                    <label for="status" class="font-semibold">Status</label>
                    <p-select 
                        id="status"
                        [(ngModel)]="currentItem.status" 
                        [options]="statusOptions"
                        placeholder="Select status"
                        class="w-full"
                    />
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
                *ngIf="selectedItem?.image || (selectedItem?.images && selectedItem?.images?.length === 1)"
                [src]="selectedItem!.image || selectedItem!.images![0]" 
                [alt]="selectedItem?.name"
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
                *ngIf="galleryItem?.images"
                [value]="galleryItem?.images" 
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
export class Inventory {
    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    dialogVisible = false;
    dialogMode: 'add' | 'edit' = 'add';
    currentItem: InventoryItem = this.getEmptyItem();
    galleryVisible = false;
    galleryItem: InventoryItem | null = null;
    singleImageVisible = false;
    selectedItem: InventoryItem | null = null;

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
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Furniture', value: 'Furniture' },
        { label: 'Tools', value: 'Tools' },
        { label: 'Office Supplies', value: 'Office Supplies' },
        { label: 'Hardware', value: 'Hardware' },
        { label: 'Components', value: 'Components' }
    ];

    statusOptions = [
        { label: 'Free', value: 'free' },
        { label: 'In Use', value: 'in-use' }
    ];

    users: User[] = [
        {
            id: 1,
            name: 'Amy Elsner',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
            email: 'amy.elsner@flossk.org'
        },
        {
            id: 2,
            name: 'Bernardo Dominic',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png',
            email: 'bernardo.dominic@flossk.org'
        },
        {
            id: 3,
            name: 'Ioni Bowcher',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png',
            email: 'ioni.bowcher@flossk.org'
        },
        {
            id: 4,
            name: 'Asiya Javayant',
            avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png',
            email: 'asiya.javayant@flossk.org'
        }
    ];

    inventoryItems: InventoryItem[] = [
        {
            id: 1,
            name: 'Arduino Uno R3',
            description: 'Microcontroller board based on the ATmega328P',
            category: 'Electronics',
            quantity: 45,
            price: 22.99,
            status: 'in-use',
            inUseBy: {
                id: 1,
                name: 'Amy Elsner',
                avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
                email: 'amy.elsner@flossk.org'
            },
            images: [
                'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop'
            ],
            rating: 5,
            location: 'Shelf A-12',
            lastUpdated: '2025-12-08'
        },
        {
            id: 2,
            name: 'Raspberry Pi 4',
            description: 'Single-board computer with 4GB RAM',
            category: 'Electronics',
            quantity: 12,
            price: 55.00,
            status: 'free',
            image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=100&h=100&fit=crop',
            rating: 5,
            location: 'Shelf A-13',
            lastUpdated: '2025-12-07'
        },
        {
            id: 3,
            name: 'Soldering Station',
            description: 'Digital temperature-controlled soldering iron',
            category: 'Tools',
            quantity: 8,
            price: 89.99,
            status: 'in-use',
            inUseBy: {
                id: 2,
                name: 'Bernardo Dominic',
                avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png',
                email: 'bernardo.dominic@flossk.org'
            },
            image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop',
            rating: 4,
            location: 'Workbench 2',
            lastUpdated: '2025-12-06'
        },
        {
            id: 4,
            name: 'LED Strip 5M RGB',
            description: 'Addressable RGB LED strip with WS2812B',
            category: 'Components',
            quantity: 0,
            price: 18.50,
            status: 'free',
            image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=100&h=100&fit=crop',
            rating: 4,
            location: 'Drawer C-5',
            lastUpdated: '2025-12-05'
        },
        {
            id: 5,
            name: 'Multimeter Digital',
            description: 'Auto-ranging digital multimeter with LCD display',
            category: 'Tools',
            quantity: 15,
            price: 45.00,
            status: 'free',
            image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop',
            rating: 5,
            location: 'Tool Cabinet',
            lastUpdated: '2025-12-08'
        },
        {
            id: 6,
            name: 'Breadboard 830 Points',
            description: 'Solderless breadboard for prototyping',
            category: 'Components',
            quantity: 32,
            price: 5.99,
            status: 'in-use',
            inUseBy: {
                id: 3,
                name: 'Ioni Bowcher',
                avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png',
                email: 'ioni.bowcher@flossk.org'
            },
            rating: 4,
            location: 'Bin D-8',
            lastUpdated: '2025-12-07'
        },
        {
            id: 7,
            name: 'Desk Lamp LED',
            description: 'Adjustable LED desk lamp with USB charging',
            category: 'Furniture',
            quantity: 6,
            price: 34.99,
            status: 'free',
            image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=100&h=100&fit=crop',
            rating: 4,
            location: 'Office Area',
            lastUpdated: '2025-12-06'
        },
        {
            id: 8,
            name: 'USB-C Cable 2M',
            description: 'High-speed USB-C cable with data transfer',
            category: 'Electronics',
            quantity: 28,
            price: 12.99,
            status: 'in-use',
            inUseBy: {
                id: 4,
                name: 'Asiya Javayant',
                avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png',
                email: 'asiya.javayant@flossk.org'
            },
            rating: 4,
            location: 'Drawer A-3',
            lastUpdated: '2025-12-08'
        }
    ];

    showGallery(item: InventoryItem) {
        // Check if item has multiple images or single image
        const imageCount = item.images ? item.images.length : (item.image ? 1 : 0);
        
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

    getEmptyItem(): InventoryItem {
        return {
            id: 0,
            name: '',
            description: '',
            category: '',
            quantity: 0,
            price: 0,
            status: 'free',
            location: '',
            lastUpdated: new Date().toISOString().split('T')[0],
            rating: 0
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
            this.currentItem.id = Math.max(...this.inventoryItems.map(i => i.id)) + 1;
            this.currentItem.lastUpdated = new Date().toISOString().split('T')[0];
            this.inventoryItems.push(this.currentItem);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Item added successfully'
            });
        } else {
            const index = this.inventoryItems.findIndex(i => i.id === this.currentItem.id);
            if (index !== -1) {
                this.currentItem.lastUpdated = new Date().toISOString().split('T')[0];
                this.inventoryItems[index] = this.currentItem;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Item updated successfully'
                });
            }
        }

        this.dialogVisible = false;
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
        this.inventoryItems = this.inventoryItems.filter(i => i.id !== item.id);
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Item deleted successfully'
        });
    }

    getStatusLabel(status: string): string {
        const labels: { [key: string]: string } = {
            'free': 'Free',
            'in-use': 'In Use'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
        const severities: { [key: string]: 'success' | 'warn' | 'danger' } = {
            'free': 'success',
            'in-use': 'warn'
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
        // For demo purposes, assign to first user. In real app, this would be current logged-in user
        const currentUser = this.users[0];
        
        item.status = 'in-use';
        item.inUseBy = currentUser;
        item.lastUpdated = new Date().toISOString().split('T')[0];
        
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${item.name} checked out to ${currentUser.name}`
        });
    }

    checkInItem(item: InventoryItem) {
        const userName = item.inUseBy?.name || 'Unknown User';
        
        item.status = 'free';
        item.inUseBy = undefined;
        item.lastUpdated = new Date().toISOString().split('T')[0];
        
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${item.name} checked in from ${userName}`
        });
    }
}
