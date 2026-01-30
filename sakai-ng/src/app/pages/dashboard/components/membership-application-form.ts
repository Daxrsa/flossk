import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import SignaturePad from 'signature_pad';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { MembershipRequestsService } from '@/pages/service/membership-requests.service';

@Component({
    selector: 'app-membership-application-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        TextareaModule,
        ButtonModule,
        CardModule,
        DatePickerModule,
        TooltipModule,
        MessageModule
    ],
    template: ` 
    <div class="flex items-center justify-center min-h-screen overflow-hidden p-4">
        <div class="card w-full max-w-5xl">
            
            <h2 class="text-center text-3xl font-bold mb-6">Membership Application Form</h2>
            
            <form #applicationForm="ngForm" (ngSubmit)="onSubmit()">
                <!-- Row 1: Name and Address -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="field">
                        <label for="fullName" class="block font-bold mb-2">First Name and Last Name:</label>
                        <input 
                            pInputText 
                            id="fullName" 
                            [(ngModel)]="formData.fullName" 
                            name="fullName" 
                            #fullName="ngModel"
                            pattern="^[a-zA-Z ,.'-]+$"
                            class="w-full"
                            [class.ng-invalid]="fullName.invalid && fullName.touched"
                            required />
                        <small *ngIf="fullName.invalid && fullName.touched" class="text-red-500">
                            <span *ngIf="fullName.errors?.['required']">Name is required.</span>
                            <span *ngIf="fullName.errors?.['pattern']">Name can only contain letters and spaces.</span>
                        </small>
                    </div>
                    <div class="field">
                        <label for="address" class="block font-bold mb-2">Address:</label>
                        <input 
                            pInputText 
                            id="address" 
                            [(ngModel)]="formData.address" 
                            name="address" 
                            #address="ngModel"
                            class="w-full"
                            [class.ng-invalid]="address.invalid && address.touched"
                            required />
                        <small *ngIf="address.invalid && address.touched" class="text-red-500">
                            <span *ngIf="address.errors?.['required']">Address is required.</span>
                        </small>
                    </div>
                </div>

                <!-- Row 2: City and Personal ID -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="field">
                        <label for="city" class="block font-bold mb-2">City:</label>
                        <input 
                            pInputText 
                            id="city" 
                            [(ngModel)]="formData.city" 
                            name="city" 
                            #city="ngModel"
                            pattern="^[a-zA-ZÀ-ÿ\s]+$"
                            class="w-full"
                            [class.ng-invalid]="city.invalid && city.touched"
                            required />
                        <small *ngIf="city.invalid && city.touched" class="text-red-500">
                            <span *ngIf="city.errors?.['required']">City is required.</span>
                            <span *ngIf="city.errors?.['pattern']">City can only contain letters and spaces.</span>
                        </small>
                    </div>
                    <div class="field">
                        <label for="idNumber" class="block font-bold mb-2">ID Number:</label>
                        <input 
                            pInputText 
                            id="idNumber" 
                            [(ngModel)]="formData.idNumber" 
                            name="idNumber" 
                            #idNumber="ngModel"
                            type="text"
                            pattern="^[0-9]+$"
                            class="w-full"
                            [class.ng-invalid]="idNumber.invalid && idNumber.touched"
                            [disabled]="!formData.applicantDateofBirth"
                            required />
                        <small *ngIf="!formData.applicantDateofBirth" class="text-orange-500">
                            Please fill Date of Birth first.
                        </small>
                        <small *ngIf="formData.applicantDateofBirth && isUnder16()" class="text-orange-500">
                            Requires guardian ID number.
                        </small>
                        <small *ngIf="idNumber.invalid && idNumber.touched && formData.applicantDateofBirth" class="text-red-500">
                            <span *ngIf="idNumber.errors?.['required']">ID number is required.</span>
                            <span *ngIf="idNumber.errors?.['pattern']">ID number can only contain numbers.</span>
                        </small>
                    </div>
                </div>

                <!-- Row 3: Phone and Email -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="field">
                        <label for="phone" class="block font-bold mb-2">Phone:</label>
                        <input 
                            pInputText 
                            id="phone" 
                            [(ngModel)]="formData.phone" 
                            name="phone" 
                            #phone="ngModel"
                            type="tel"
                            pattern="^[0-9+]+$"
                            class="w-full"
                            [class.ng-invalid]="phone.invalid && phone.touched"
                            required />
                        <small *ngIf="phone.invalid && phone.touched" class="text-red-500">
                            <span *ngIf="phone.errors?.['required']">Phone is required.</span>
                            <span *ngIf="phone.errors?.['pattern']">Phone can only contain numbers and +.</span>
                        </small>
                    </div>
                    <div class="field">
                        <label for="email" class="block font-bold mb-2">Email:</label>
                        <input 
                            pInputText 
                            id="email" 
                            [(ngModel)]="formData.email" 
                            name="email" 
                            #email="ngModel"
                            type="email"
                            pattern="[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"
                            class="w-full"
                            [class.ng-invalid]="email.invalid && email.touched"
                            required />
                        <small *ngIf="email.invalid && email.touched" class="text-red-500">
                            <span *ngIf="email.errors?.['required']">Email is required.</span>
                            <span *ngIf="email.errors?.['pattern']">Please enter a valid email address.</span>
                        </small>
                    </div>
                </div>

                <!-- Row 4: School/Company and Date of Birth -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="field">
                        <label for="schoolCompany" class="block font-bold mb-2">School/Company:</label>
                        <input 
                            pInputText 
                            id="schoolCompany" 
                            [(ngModel)]="formData.schoolCompany" 
                            name="schoolCompany" 
                            #schoolCompany="ngModel"
                            class="w-full"
                            [class.ng-invalid]="schoolCompany.invalid && schoolCompany.touched"
                            required />
                        <small *ngIf="schoolCompany.invalid && schoolCompany.touched" class="text-red-500">
                            <span *ngIf="schoolCompany.errors?.['required']">School/Company is required.</span>
                        </small>
                    </div>
                    <div class="field">
                        <label for="applicantDate" class="block font-bold mb-2">Date of Birth:</label>
                        <p-datepicker
                            [(ngModel)]="formData.applicantDateofBirth" 
                            (ngModelChange)="onDateOfBirthChange()"
                            [iconDisplay]="'input'" 
                            [showIcon]="true" 
                            id="applicantDate"
                            inputId="icondisplay" 
                            name="applicantDate" 
                            #applicantDate="ngModel"
                            dateFormat="dd.mm.yy"
                            fluid
                            required
                        />
                        <small *ngIf="applicantDate.invalid && applicantDate.touched" class="text-red-500">
                            <span *ngIf="applicantDate.errors?.['required']">Date of Birth is required.</span>
                        </small>
                    </div>
                </div>

                <!-- Statement -->
                <div class="field mb-4">
                    <label for="statement" class="block font-bold mb-2">
                        Statement: <span class="font-normal">(Please explain why you would like to be a member of FLOSSK)</span>
                    </label>
                    <textarea 
                        pInputTextarea 
                        id="statement" 
                        [(ngModel)]="formData.statement" 
                        name="statement" 
                        #statement="ngModel"
                        rows="5"
                        class="w-full"
                        [class.ng-invalid]="statement.invalid && statement.touched"
                        required></textarea>
                    <small *ngIf="statement.invalid && statement.touched" class="text-red-500">
                        <span *ngIf="statement.errors?.['required']">Statement is required.</span>
                    </small>
                </div>

                <!-- Signatures Section -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <!-- Applicant Signature -->
                    <div class="field">
                        <label for="applicantSignature" class="block font-bold mb-2">Applicant Signature:</label>
                        <div class="border-2 border-gray-300 rounded-lg bg-white" [class.opacity-50]="!formData.applicantDateofBirth || isUnder14()">
                            <canvas 
                                #applicantCanvas
                                class="w-full" 
                                style="touch-action: none;"
                                [class.pointer-events-none]="!formData.applicantDateofBirth || isUnder14()"></canvas>
                        </div>
                        <div class="mt-2">
                            <button 
                                pButton 
                                type="button" 
                                label="Clear" 
                                icon="pi pi-times"
                                (click)="clearApplicantSignature()"
                                [disabled]="!formData.applicantDateofBirth || isUnder14()"
                                class="p-button-sm p-button-outlined p-button-danger"></button>
                        </div>
                        @if (!formData.applicantDateofBirth) {
                            <small class="text-orange-500">
                                Please fill in Date of Birth first.
                            </small>
                        }
                        @if (formData.applicantDateofBirth && isUnder14()) {
                            <small class="text-orange-500">
                                Applicants under 14 require parent/guardian signature instead.
                            </small>
                        }
                    </div>

                    <!-- Parent/Guardian -->
                    <div class="field">
                        <label for="parentGuardian" class="block font-bold mb-2">
                            Parent/Guardian Signature: <span class="font-normal">(Required if under 14 y/o)</span>
                        </label>
                        <div class="border-2 border-gray-300 rounded-lg bg-white" [class.opacity-50]="!formData.applicantDateofBirth || !isUnder14()">
                            <canvas 
                                #guardianCanvas
                                class="w-full" 
                                style="touch-action: none;"
                                [class.pointer-events-none]="!formData.applicantDateofBirth || !isUnder14()"></canvas>
                        </div>
                        <div class="mt-2">
                            <button 
                                pButton 
                                type="button" 
                                label="Clear" 
                                icon="pi pi-times"
                                (click)="clearGuardianSignature()"
                                [disabled]="!formData.applicantDateofBirth || !isUnder14()"
                                class="p-button-sm p-button-outlined p-button-danger"></button>
                        </div>
                        @if (!formData.applicantDateofBirth) {
                            <small class="text-orange-500">
                                Please fill in Date of Birth first.
                            </small>
                        }
                        @if (formData.applicantDateofBirth && !isUnder14()) {
                            <small class="text-orange-500">
                                Parent/guardian signature not required for applicants 14 or older.
                            </small>
                        }
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="flex flex-col items-center mt-6 gap-4">
                    @if (errorMessage) {
                        <p-message severity="error" [text]="errorMessage" styleClass="w-full max-w-md"></p-message>
                    }
                    @if (successMessage) {
                        <p-message severity="success" [text]="successMessage" styleClass="w-full max-w-md"></p-message>
                    }
                    <button 
                        pButton 
                        type="submit" 
                        label="Submit Application" 
                        icon="pi pi-check"
                        [disabled]="!applicationForm.valid || isSubmitting"
                        [loading]="isSubmitting"
                        class="p-button-lg"></button>
                </div>
            </form>
        </div>
    </div>`
})
export class MembershipApplicationForm implements AfterViewInit {
    @ViewChild('applicantCanvas') applicantCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('guardianCanvas') guardianCanvas!: ElementRef<HTMLCanvasElement>;

    applicantSignaturePad!: SignaturePad;
    guardianSignaturePad!: SignaturePad;
    
    isSubmitting = false;
    errorMessage = '';
    successMessage = '';

    formData = {
        fullName: '',
        address: '',
        city: '',
        idNumber: '',
        phone: '',
        email: '',
        schoolCompany: '',
        statement: '',
        applicantSignature: '',
        parentGuardian: '',
        applicantDateofBirth: '',
        boardMember: '',
    };

    constructor(
        private membershipRequestsService: MembershipRequestsService,
        private router: Router
    ) {}

    ngAfterViewInit() {
        this.applicantSignaturePad = new SignaturePad(this.applicantCanvas.nativeElement, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });
        this.resizeCanvas(this.applicantCanvas.nativeElement);

        this.guardianSignaturePad = new SignaturePad(this.guardianCanvas.nativeElement, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });
        this.resizeCanvas(this.guardianCanvas.nativeElement);
    }

    resizeCanvas(canvas: HTMLCanvasElement) {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = 90 * ratio;
        canvas.getContext('2d')!.scale(ratio, ratio);
    }

    clearApplicantSignature() {
        this.applicantSignaturePad.clear();
    }

    clearGuardianSignature() {
        this.guardianSignaturePad.clear();
    }

    onDateOfBirthChange() {
        if (this.applicantSignaturePad) {
            this.applicantSignaturePad.clear();
        }
        if (this.guardianSignaturePad) {
            this.guardianSignaturePad.clear();
        }
    }

    isUnder14(): boolean {
        if (!this.formData.applicantDateofBirth) {
            return false;
        }

        const birthDate = new Date(this.formData.applicantDateofBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age < 14;
    }

    isUnder16(): boolean {
        if (!this.formData.applicantDateofBirth) {
            return false;
        }

        const birthDate = new Date(this.formData.applicantDateofBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age < 16;
    }

    onSubmit() {
        this.errorMessage = '';
        this.successMessage = '';

        // Check if required signatures are provided
        if (!this.isUnder14() && this.applicantSignaturePad.isEmpty()) {
            this.errorMessage = 'Please provide your signature.';
            return;
        }

        if (this.isUnder14() && this.guardianSignaturePad.isEmpty()) {
            this.errorMessage = 'Parent/Guardian signature is required for applicants under 14.';
            return;
        }

        this.isSubmitting = true;

        // Get signature as blob
        const signaturePad = this.isUnder14() ? this.guardianSignaturePad : this.applicantSignaturePad;
        const signatureDataUrl = signaturePad.toDataURL('image/png');
        
        // Convert base64 to blob
        fetch(signatureDataUrl)
            .then(res => res.blob())
            .then(signatureBlob => {
                // Create FormData for multipart/form-data request
                const formData = new FormData();
                formData.append('FullName', this.formData.fullName);
                formData.append('Address', this.formData.address);
                formData.append('City', this.formData.city);
                formData.append('PhoneNumber', this.formData.phone);
                formData.append('Email', this.formData.email);
                formData.append('SchoolOrCompany', this.formData.schoolCompany);
                formData.append('DateOfBirth', new Date(this.formData.applicantDateofBirth).toISOString());
                formData.append('Statement', this.formData.statement);
                formData.append('IdCardNumber', this.formData.idNumber);
                formData.append('SignatureFile', signatureBlob, 'signature.png');

                this.membershipRequestsService.create(formData).subscribe({
                    next: (response) => {
                        this.isSubmitting = false;
                        this.successMessage = 'Your application has been submitted successfully!';
                        // Optionally redirect after a delay
                        setTimeout(() => {
                            this.router.navigate(['/auth/login']);
                        }, 2000);
                    },
                    error: (err) => {
                        this.isSubmitting = false;
                        this.errorMessage = err.error?.message || 'Failed to submit application. Please try again.';
                        console.error('Submission error:', err);
                    }
                });
            })
            .catch(err => {
                this.isSubmitting = false;
                this.errorMessage = 'Failed to process signature. Please try again.';
                console.error('Signature processing error:', err);
            });
    }
}
