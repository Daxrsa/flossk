import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '@/pages/service/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, PopoverModule, ButtonModule, DividerModule, AppConfigurator],
    template: ` 
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
          
<a class="layout-topbar-logo" routerLink="/">
<img class="h-8 max-w-full" [src]="layoutService.isDarkTheme() ? 'assets/images/flossk_logo_dark_mode.png' : 'assets/images/logo.png'" alt="Flossk Logo"></a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="profilePopover.toggle($event)"><i class="pi pi-user"></i><span>Profile</span></button>
                <p-popover #profilePopover>
                    <div class="flex flex-col gap-1 w-64">
                        @if (authService.currentUser()) {
                            <div class="flex flex-col gap-2">
                                <div class="flex items-center gap-3">
                                    <div>
                                        <div class="font-semibold text-surface-900 dark:text-surface-0">{{ authService.currentUser()?.email }}</div>
                                        <div class="text-sm text-muted-color">{{ authService.currentUser()?.role || 'Unknown' }}</div>
                                    </div>
                                </div>
                            </div>
                            <p-button label="Logout" icon="pi pi-sign-out" severity="danger" [outlined]="true" class="ml-auto" (onClick)="authService.logout(); profilePopover.hide()"></p-button>
                        } @else {
                            <div class="text-center">
                                <p class="text-muted-color mb-3">You are not logged in</p>
                                <p-button label="Login" icon="pi pi-sign-in" routerLink="/auth/login" class="w-full" (onClick)="profilePopover.hide()"></p-button>
                            </div>
                        }
                    </div>
                </p-popover>
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
            </div>
        </div>
    </div>
    `
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];

    constructor(
        public layoutService: LayoutService,
        public authService: AuthService
    ) { }

    ngOnInit() {
        // Load current user when topbar initializes
        this.authService.loadCurrentUser();
    }

    toggleDarkMode() {
        this.layoutService.toggleAndPersistDarkMode();
    }
}
