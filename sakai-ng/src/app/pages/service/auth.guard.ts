import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Public routes that don't require authentication
    const publicRoutes = ['/apply', '/auth/login', '/auth'];

    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(publicRoute => 
        state.url === publicRoute || state.url.startsWith(publicRoute + '/')
    );

    if (isPublicRoute) {
        return true;
    }

    // Check if user is authenticated
    if (authService.isAuthenticated()) {
        return true;
    }

    // Redirect to error page if not authenticated
    router.navigate(['/auth/error']);
    return false;
};
