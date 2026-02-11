import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '@environments/environment.prod';

// Default avatar URL - use this constant throughout the app
export const DEFAULT_AVATAR = 'assets/images/avatar.jpg';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
}

export interface User {
    id?: string;
    email: string;
    fullName?: string;
    role?: string;
    roles?: string[];
    darkTheme?: boolean;
}

export interface AuthResponse {
    token?: string;
    user?: User;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = `${environment.apiUrl}/Auth`;
    private readonly THEME_KEY = 'app_theme';
    
    currentUser = signal<User | null>(null);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    constructor(private http: HttpClient, private router: Router) {
        // Try to load user on service init if token exists
        if (this.getToken()) {
            this.loadCurrentUser();
        }
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        this.isLoading.set(true);
        this.error.set(null);
        
        return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
            tap(response => {
                if (response.token) {
                    this.setToken(response.token);
                }
                if (response.user) {
                    this.currentUser.set(response.user);
                }
                this.isLoading.set(false);
            }),
            catchError(err => {
                this.isLoading.set(false);
                this.error.set(err.error?.message || 'Login failed');
                throw err;
            })
        );
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        this.isLoading.set(true);
        this.error.set(null);
        
        return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
            tap(response => {
                if (response.token) {
                    this.setToken(response.token);
                }
                if (response.user) {
                    this.currentUser.set(response.user);
                }
                this.isLoading.set(false);
            }),
            catchError(err => {
                this.isLoading.set(false);
                this.error.set(err.error?.message || 'Registration failed');
                throw err;
            })
        );
    }

    loadCurrentUser(): void {
        const token = this.getToken();
        if (!token) {
            this.currentUser.set(null);
            return;
        }

        this.http.get<any>(`${this.API_URL}/me`).pipe(
            tap(response => {
                const user: User = {
                    ...response,
                    role: response.roles?.length > 0 ? response.roles[0] : undefined
                };
                this.currentUser.set(user);
            }),
            catchError(err => {
                this.logout();
                return of(null);
            })
        ).subscribe();
    }

    logout(): void {
        localStorage.removeItem('auth_token');
        // Keep theme preference in localStorage even after logout
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    private setToken(token: string): void {
        localStorage.setItem('auth_token', token);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    updateCurrentUser(userData: Partial<User>): void {
        const current = this.currentUser();
        if (current) {
            this.currentUser.set({ ...current, ...userData });
        }
    }

    updateThemePreference(darkTheme: boolean): Observable<any> {
        // Save to localStorage immediately
        this.saveThemeToLocalStorage(darkTheme);
        
        return this.http.patch<any>(`${this.API_URL}/me/theme`, { darkTheme }).pipe(
            tap(() => {
                this.updateCurrentUser({ darkTheme });
            })
        );
    }

    /**
     * Get the current theme preference
     * Returns user's theme if available, otherwise falls back to localStorage
     */
    getThemePreference(): boolean {
        const user = this.currentUser();
        if (user && user.darkTheme !== undefined) {
            return user.darkTheme;
        }
        return this.getThemeFromLocalStorage();
    }

    /**
     * Save theme preference to localStorage
     */
    private saveThemeToLocalStorage(darkTheme: boolean): void {
        localStorage.setItem(this.THEME_KEY, JSON.stringify(darkTheme));
    }

    /**
     * Save theme to localStorage only (without backend update)
     * Useful for non-authenticated users
     */
    saveThemeLocally(darkTheme: boolean): void {
        this.saveThemeToLocalStorage(darkTheme);
    }

    /**
     * Get theme preference from localStorage
     * Returns false (light theme) as default if not found
     */
    private getThemeFromLocalStorage(): boolean {
        const stored = localStorage.getItem(this.THEME_KEY);
        if (stored !== null) {
            return JSON.parse(stored);
        }
        return false; // Default to light theme
    }
}
