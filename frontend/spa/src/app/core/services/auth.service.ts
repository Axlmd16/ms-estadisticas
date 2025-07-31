import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize from localStorage if available
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();

    // Check token validity on service initialization
    if (this.isLoggedIn()) {
      this.autoLogout();
    }
  }

  // Get current user value without subscribing
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Decode JWT token to extract user information
  private decodeToken(token: string): any {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));
      return payload;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  // Check if user is logged in
  public isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return !!user && !!user.access;
  }

  // Login method
  login(email: string, password: string): Observable<User> {
    return this.http.post<{access: string, refresh: string}>(`${environment.apiUrl}/v1/auth/login/`, { email, password })
      .pipe(
        map(tokens => {
          // Decode the access token to get user information
          const tokenPayload = this.decodeToken(tokens.access);
          console.log('Token payload:', tokenPayload); // Debug log
          if (!tokenPayload) {
            throw new Error('Invalid token received');
          }

          // Create user object from token payload
          const user: User = {
            id: tokenPayload.id || tokenPayload.user_id || tokenPayload.sub || '', // Try different possible ID fields
            email: tokenPayload.email || email,
            firstname: tokenPayload.firstname || '',
            lastname: tokenPayload.lastname || '',
            role: tokenPayload.roles || ['ESPECTATOR'],
            verified: true, // Assume verified if login succeeded
            access: tokens.access,
            refresh: tokens.refresh
          };

          console.log('Created user object:', user); // Debug log
          return user;
        }),
        tap(user => {
          // Store user details and tokens in localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.autoLogout();
        }),
        catchError(error => {
          console.error('Login error:', error);
          let errorMessage = 'Login failed. Please check your credentials.';

          if (error.status === 401) {
            if (error.error?.detail?.includes('Account not verified')) {
              errorMessage = 'Account not verified. Please check your email and verify your account before logging in.';
            } else if (error.error?.detail) {
              errorMessage = error.error.detail;
            } else {
              errorMessage = 'Invalid credentials. Please check your email and password.';
            }
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Register new user
  register(userData: any): Observable<any> {
    const registerData = {
      email: userData.email,
      password: userData.password,
      firstname: userData.firstname,
      lastname: userData.lastname,
      phone_number: userData.phone_number || null,
      role: ['ESPECTATOR'] // Rol por defecto
    };

    return this.http.post(`${environment.apiUrl}/v1/auth/register/`, registerData)
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          let errorMessage = 'Error en el registro. Por favor, intenta de nuevo.';

          if (error.status === 400) {
            if (error.error?.email) {
              errorMessage = 'Este email ya está registrado.';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Request password reset
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/v1/auth/initiate-password-reset/`, { email })
      .pipe(
        catchError(error => {
          console.error('Password reset request error:', error);
          return throwError(() => new Error(error.error?.message || 'Password reset request failed. Please try again.'));
        })
      );
  }

  // Reset password with token
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/v1/auth/create-password/`, { token, new_password: newPassword })
      .pipe(
        catchError(error => {
          console.error('Password reset error:', error);
          return throwError(() => new Error(error.error?.message || 'Password reset failed. Please try again.'));
        })
      );
  }

  // Refresh token
  refreshToken(): Observable<any> {
    const user = this.currentUserValue;
    if (!user || !user.refresh) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{access: string}>(`${environment.apiUrl}/v1/auth/token/refresh/`, { refresh: user.refresh })
      .pipe(
        tap(tokens => {
          // Update stored user with new access token
          const updatedUser = {
            ...user,
            access: tokens.access
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
          this.autoLogout();
        }),
        catchError(error => {
          console.error('Token refresh error:', error);
          this.logout();
          return throwError(() => new Error('Session expired. Please log in again.'));
        })
      );
  }

  // Verify token
  verifyToken(): Observable<boolean> {
    const user = this.currentUserValue;
    if (!user || !user.access) {
      return of(false);
    }

    return this.http.post(`${environment.apiUrl}/v1/auth/token/verify/`, { token: user.access })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  // Logout user
  logout(): void {
    // Clear user from localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    // Clear auto logout timer
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }

    // Navigate to login
    this.router.navigate(['/login']);
  }

  // Setup automatic logout when token expires
  private autoLogout(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const user = this.currentUserValue;
    if (!user || !user.access) return;

    // Decode token to get expiration time
    const tokenParts = user.access.split('.');
    if (tokenParts.length !== 3) return;

    try {
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const expirationDate = new Date(tokenPayload.exp * 1000);
      const timeUntilExpiration = expirationDate.getTime() - Date.now();

      // Set timer to logout when token expires
      this.tokenExpirationTimer = setTimeout(() => {
        this.logout();
      }, timeUntilExpiration);

      // Refresh token 5 minutes before expiration
      const refreshTime = timeUntilExpiration - (5 * 60 * 1000);
      if (refreshTime > 0) {
        setTimeout(() => {
          this.refreshToken().subscribe({
            error: (error) => {
              console.error('Auto refresh failed:', error);
              // No hacer logout automático en caso de error de refresh
            }
          });
        }, refreshTime);
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  }
}
