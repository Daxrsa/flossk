import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';

interface TierFeature {
    name: string;
    included: boolean;
}

interface PaymentTier {
    id: number;
    name: string;
    description: string;
    price: number;
    period: string;
    features: TierFeature[];
    isPopular: boolean;
    isHighlighted: boolean;
}

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CardModule,
        DividerModule,
        TagModule,
        RippleModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        CheckboxModule,
        ConfirmDialogModule,
        ToastModule,
        SelectModule
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast />
        <p-confirmDialog />
        
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <div class="font-semibold text-3xl mb-2">Membership Plans</div>
                    <p class="text-muted-color">Manage payment tiers for Prishtina Hackerspace</p>
                </div>
                <p-button label="Add New Tier" icon="pi pi-plus" (onClick)="openNewTierDialog()" />
            </div>

            <div class="grid grid-cols-12 gap-4">
                <div *ngFor="let tier of tiers" class="col-span-12 lg:col-span-4">
                    <div class="p-4 h-full">
                        <div 
                            class="shadow-md rounded-xl p-6 h-full flex flex-col relative overflow-hidden"
                            [class.bg-primary]="tier.isHighlighted"
                            [class.text-primary-contrast]="tier.isHighlighted"
                            [class.bg-surface-0]="!tier.isHighlighted"
                            [class.dark:bg-surface-900]="!tier.isHighlighted"
                            [class.border]="!tier.isHighlighted"
                            [class.border-surface]="!tier.isHighlighted">
                            
                            <!-- Admin Actions -->
                            <div class="absolute top-4 left-4 flex gap-2">
                                <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" size="small" (onClick)="openEditTierDialog(tier)" 
                                    [style]="tier.isHighlighted ? {'color': 'var(--primary-contrast-color)'} : {}" />
                                <p-button icon="pi pi-trash" [rounded]="true" [text]="true" size="small" severity="danger" (onClick)="confirmDeleteTier(tier)" />
                            </div>

                            <p-tag *ngIf="tier.isPopular" value="MOST POPULAR" severity="warn" styleClass="absolute top-4 right-4" />
                            
                            <div class="font-medium text-xl mb-2 mt-6" [class.text-surface-900]="!tier.isHighlighted" [class.dark:text-surface-0]="!tier.isHighlighted">{{ tier.name }}</div>
                            <div [class.opacity-80]="tier.isHighlighted" [class.text-muted-color]="!tier.isHighlighted" class="mb-4">{{ tier.description }}</div>
                            
                            <hr class="my-4 border-t" [class.border-primary-contrast/30]="tier.isHighlighted" [class.border-surface]="!tier.isHighlighted" />
                            
                            <div class="flex items-baseline gap-1 mb-4">
                                <span class="font-bold text-4xl" [class.text-surface-900]="!tier.isHighlighted" [class.dark:text-surface-0]="!tier.isHighlighted">€{{ tier.price }}</span>
                                <span [class.opacity-80]="tier.isHighlighted" [class.text-muted-color]="!tier.isHighlighted">/{{ tier.period }}</span>
                            </div>
                            
                            <ul class="list-none p-0 m-0 flex-1">
                                <li *ngFor="let feature of tier.features" class="flex items-center mb-3" [class.opacity-60]="tier.isHighlighted && !feature.included" [class.text-muted-color]="!tier.isHighlighted && !feature.included">
                                    <i [class]="feature.included ? 'pi pi-check-circle mr-2' : 'pi pi-times-circle mr-2'" [class.text-green-500]="feature.included && !tier.isHighlighted"></i>
                                    <span>{{ feature.name }}</span>
                                </li>
                            </ul>
                            
                            <hr class="my-4 border-t" [class.border-primary-contrast/30]="tier.isHighlighted" [class.border-surface]="!tier.isHighlighted" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Additional Info -->
            <div class="mt-8 text-center">
                <div class="flex justify-center gap-4 flex-wrap">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-credit-card text-primary"></i>
                        <span class="text-sm">Secure payment</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-refresh text-primary"></i>
                        <span class="text-sm">Cancel anytime</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-users text-primary"></i>
                        <span class="text-sm">Student discount available</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add/Edit Tier Dialog -->
        <p-dialog 
            [(visible)]="tierDialogVisible" 
            [header]="editMode ? 'Edit Tier' : 'Add New Tier'" 
            [modal]="true" 
            [style]="{ width: '600px' }"
            [dismissableMask]="true">
            
            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Tier Name *</label>
                        <input pInputText [(ngModel)]="currentTier.name" class="w-full" placeholder="e.g., Basic, Standard, Pro" />
                    </div>
                    <div>
                        <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Price (€) *</label>
                        <p-inputNumber [(ngModel)]="currentTier.price" [min]="0" mode="currency" currency="EUR" locale="de-DE" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Billing Period *</label>
                        <p-select [(ngModel)]="currentTier.period" [options]="periodOptions" placeholder="Select period" class="w-full" />
                    </div>
                    <div class="flex flex-col justify-end gap-2">
                        <div class="flex items-center gap-2">
                            <p-checkbox [(ngModel)]="currentTier.isPopular" [binary]="true" inputId="isPopular" />
                            <label for="isPopular">Mark as Popular</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <p-checkbox [(ngModel)]="currentTier.isHighlighted" [binary]="true" inputId="isHighlighted" />
                            <label for="isHighlighted">Highlight Tier</label>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Description</label>
                    <input pInputText [(ngModel)]="currentTier.description" class="w-full" placeholder="Short description of this tier" />
                </div>

                <p-divider />

                <!-- Features Management -->
                <div>
                    <div class="flex justify-between items-center mb-3">
                        <label class="text-surface-900 dark:text-surface-0 font-medium">Features</label>
                        <p-button icon="pi pi-plus" label="Add Feature" size="small" [outlined]="true" (onClick)="addFeature()" />
                    </div>
                    
                    <div *ngIf="currentTier.features.length === 0" class="text-center py-4 text-muted-color">
                        No features added yet. Click "Add Feature" to start.
                    </div>

                    <div *ngFor="let feature of currentTier.features; let i = index" class="flex items-center gap-3 mb-3 bg-surface-50 dark:bg-surface-800 p-3 rounded-lg">
                        <p-checkbox [(ngModel)]="feature.included" [binary]="true" />
                        <input pInputText [(ngModel)]="feature.name" class="flex-1" placeholder="Feature name" />
                        <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="removeFeature(i)" />
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Cancel" [text]="true" (onClick)="tierDialogVisible = false" />
                <p-button [label]="editMode ? 'Save Changes' : 'Create Tier'" icon="pi pi-check" (onClick)="saveTier()" [disabled]="!isValidTier()" />
            </ng-template>
        </p-dialog>
    `
})
export class Payments {
    tiers: PaymentTier[] = [
        {
            id: 1,
            name: 'Basic',
            description: 'For occasional visitors',
            price: 10,
            period: 'month',
            isPopular: false,
            isHighlighted: false,
            features: [
                { name: 'Access during open hours', included: true },
                { name: 'Basic tool usage', included: true },
                { name: 'Community events access', included: true },
                { name: 'Shared workspace', included: true },
                { name: '24/7 Access', included: false },
                { name: 'Storage locker', included: false },
                { name: 'Advanced equipment', included: false }
            ]
        },
        {
            id: 2,
            name: 'Standard',
            description: 'For regular makers',
            price: 25,
            period: 'month',
            isPopular: true,
            isHighlighted: true,
            features: [
                { name: '24/7 Access with key card', included: true },
                { name: 'All basic tools + power tools', included: true },
                { name: 'Community events access', included: true },
                { name: 'Personal storage locker', included: true },
                { name: '3D printer access (5h/month)', included: true },
                { name: 'Workshop discounts (20%)', included: true },
                { name: 'Dedicated desk', included: false }
            ]
        },
        {
            id: 3,
            name: 'Pro',
            description: 'For dedicated makers',
            price: 50,
            period: 'month',
            isPopular: false,
            isHighlighted: false,
            features: [
                { name: '24/7 Access with key card', included: true },
                { name: 'All tools + CNC & laser cutter', included: true },
                { name: 'Dedicated desk space', included: true },
                { name: 'Large storage locker', included: true },
                { name: 'Unlimited 3D printing', included: true },
                { name: 'Free workshops', included: true },
                { name: 'Priority support', included: true }
            ]
        }
    ];

    tierDialogVisible = false;
    editMode = false;
    currentTier: PaymentTier = this.getEmptyTier();
    
    periodOptions = [
        { label: 'Monthly', value: 'month' },
        { label: 'Yearly', value: 'year' },
        { label: 'Weekly', value: 'week' },
        { label: 'Daily', value: 'day' },
        { label: 'One-time', value: 'one-time' }
    ];

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    getEmptyTier(): PaymentTier {
        return {
            id: 0,
            name: '',
            description: '',
            price: 0,
            period: 'month',
            features: [],
            isPopular: false,
            isHighlighted: false
        };
    }

    openNewTierDialog() {
        this.editMode = false;
        this.currentTier = this.getEmptyTier();
        this.tierDialogVisible = true;
    }

    openEditTierDialog(tier: PaymentTier) {
        this.editMode = true;
        this.currentTier = JSON.parse(JSON.stringify(tier)); // Deep copy
        this.tierDialogVisible = true;
    }

    addFeature() {
        this.currentTier.features.push({ name: '', included: true });
    }

    removeFeature(index: number) {
        this.currentTier.features.splice(index, 1);
    }

    isValidTier(): boolean {
        return !!this.currentTier.name && this.currentTier.price >= 0 && !!this.currentTier.period;
    }

    saveTier() {
        if (!this.isValidTier()) return;

        // Remove empty features
        this.currentTier.features = this.currentTier.features.filter(f => f.name.trim() !== '');

        if (this.editMode) {
            const index = this.tiers.findIndex(t => t.id === this.currentTier.id);
            if (index !== -1) {
                this.tiers[index] = { ...this.currentTier };
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tier updated successfully' });
            }
        } else {
            this.currentTier.id = Math.max(...this.tiers.map(t => t.id), 0) + 1;
            this.tiers.push({ ...this.currentTier });
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tier created successfully' });
        }

        this.tierDialogVisible = false;
    }

    confirmDeleteTier(tier: PaymentTier) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the "${tier.name}" tier?`,
            header: 'Delete Tier',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.tiers = this.tiers.filter(t => t.id !== tier.id);
                this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Tier deleted successfully' });
            }
        });
    }
}
