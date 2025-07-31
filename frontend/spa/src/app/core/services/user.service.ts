import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

export interface UserProfile {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  phone_number?: string;
  image?: string;
  role: string[];
  verified: boolean;
  is_admin?: boolean;
}

export interface UpdateUserProfile {
  firstname?: string;
  lastname?: string;
  phone_number?: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    if (!user || !user.access) {
      throw new Error('No authentication token available');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${user.access}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }

  // Get user profile by ID
  getUserProfile(userId: string): Observable<UserProfile> {
    const headers = this.getAuthHeaders();
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = `${environment.apiUrl}/v1/user/${userId}/?_t=${timestamp}`;

    return this.http.get<UserProfile>(url, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching user profile:', error);
          let errorMessage = 'Error al obtener el perfil del usuario';

          if (error.status === 404) {
            errorMessage = 'Usuario no encontrado';
          } else if (error.status === 403) {
            errorMessage = 'Sin permisos para ver este perfil';
          } else if (error.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
            this.authService.logout();
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Get current user profile
  getCurrentUserProfile(): Observable<UserProfile> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    return this.getUserProfile(currentUser.id);
  }

  // Update user profile
  updateUserProfile(userId: string, profileData: UpdateUserProfile): Observable<UserProfile> {
    const headers = this.getAuthHeaders();

    return this.http.patch<UserProfile>(`${environment.apiUrl}/v1/user/${userId}/`, profileData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error updating user profile:', error);
          let errorMessage = 'Error al actualizar el perfil';

          if (error.status === 404) {
            errorMessage = 'Usuario no encontrado';
          } else if (error.status === 403) {
            errorMessage = 'Sin permisos para editar este perfil';
          } else if (error.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
            this.authService.logout();
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Update current user profile
  updateCurrentUserProfile(profileData: UpdateUserProfile): Observable<UserProfile> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    return this.updateUserProfile(currentUser.id, profileData);
  }

  // Change password
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const headers = this.getAuthHeaders();

    const passwordData = {
      old_password: oldPassword,
      new_password: newPassword
    };

    return this.http.post(`${environment.apiUrl}/v1/auth/change-password/`, passwordData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error changing password:', error);
          let errorMessage = 'Error al cambiar la contraseña';

          if (error.status === 400) {
            if (error.error?.old_password) {
              errorMessage = 'La contraseña actual es incorrecta';
            } else if (error.error?.new_password) {
              errorMessage = 'La nueva contraseña no cumple con los requisitos';
            } else {
              errorMessage = error.error?.message || errorMessage;
            }
          } else if (error.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
            this.authService.logout();
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Upload profile image
  uploadProfileImage(userId: string, imageFile: File): Observable<UserProfile> {
    const user = this.authService.currentUserValue;
    if (!user || !user.access) {
      throw new Error('No authentication token available');
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${user.access}`
      // Don't set Content-Type for FormData, let the browser set it
    });

    return this.http.patch<UserProfile>(`${environment.apiUrl}/v1/user/${userId}/`, formData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error uploading profile image:', error);
          let errorMessage = 'Error al subir la imagen de perfil';

          if (error.status === 413) {
            errorMessage = 'La imagen es demasiado grande';
          } else if (error.status === 415) {
            errorMessage = 'Formato de imagen no válido';
          } else if (error.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
            this.authService.logout();
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }
}
