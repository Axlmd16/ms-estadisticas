import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService, UserProfile } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        RouterModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatCardModule,
        MatSlideToggleModule,
        MatDividerModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './perfil.html',
    styleUrl: './perfil.scss'
})
export class PerfilComponent implements OnInit {
  userProfile: UserProfile | null = null;
  perfilForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  isUpdating = false;
  isChangingPassword = false;

  // Configuración de preferencias locales (no se envían al backend por ahora)
  preferenciasLocales = {
    deportesFavoritos: ['Fútbol', 'Baloncesto', 'Tenis'],
    temasPreferidos: ['Torneos', 'Estadísticas', 'Equipos'],
    notificaciones: {
      email: true,
      push: true,
      sms: false
    },
    idioma: 'Español',
    temaOscuro: false
  };

  idiomas = ['Español', 'English', 'Français', 'Deutsch', 'Italiano', 'Português'];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.perfilForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: [{value: '', disabled: true}], // Email no se puede editar
      phone_number: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  loadUserProfile(): void {
    this.isLoading = true;
    // Force fresh data by clearing any component state
    this.userProfile = null;

    this.userService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        console.log('Perfil cargado (fresh data):', profile); // Debug
        this.userProfile = profile;
        this.perfilForm.patchValue({
          firstname: profile.firstname,
          lastname: profile.lastname,
          email: profile.email,
          phone_number: profile.phone_number || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.snackBar.open(error.message || 'Error al cargar el perfil', 'Cerrar', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  actualizarPerfil(): void {
    if (this.perfilForm.invalid) {
      this.snackBar.open('Por favor, corrige los errores en el formulario', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.isUpdating = true;
    const formData = this.perfilForm.value;

    this.userService.updateCurrentUserProfile(formData).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', {
          duration: 3000
        });
        this.isUpdating = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.snackBar.open(error.message || 'Error al actualizar el perfil', 'Cerrar', {
          duration: 5000
        });
        this.isUpdating = false;
      }
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid) {
      this.snackBar.open('Por favor, corrige los errores en el formulario', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.isChangingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.snackBar.open('Contraseña cambiada correctamente', 'Cerrar', {
          duration: 3000
        });
        this.passwordForm.reset();
        this.isChangingPassword = false;
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.snackBar.open(error.message || 'Error al cambiar la contraseña', 'Cerrar', {
          duration: 5000
        });
        this.isChangingPassword = false;
      }
    });
  }

  toggleNotificacion(tipo: string): void {
    if (tipo === 'email') {
      this.preferenciasLocales.notificaciones.email = !this.preferenciasLocales.notificaciones.email;
    } else if (tipo === 'push') {
      this.preferenciasLocales.notificaciones.push = !this.preferenciasLocales.notificaciones.push;
    } else if (tipo === 'sms') {
      this.preferenciasLocales.notificaciones.sms = !this.preferenciasLocales.notificaciones.sms;
    }
    // Aquí podrías agregar lógica para guardar las preferencias en el backend
  }

  toggleTemaOscuro(): void {
    this.preferenciasLocales.temaOscuro = !this.preferenciasLocales.temaOscuro;
    // Aquí podrías agregar lógica para aplicar el tema oscuro y guardarlo en el backend
  }

  // Getters para facilitar el acceso a los campos del formulario
  get firstname() { return this.perfilForm.get('firstname'); }
  get lastname() { return this.perfilForm.get('lastname'); }
  get phone_number() { return this.perfilForm.get('phone_number'); }
  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }

  // Force refresh profile data
  forceRefreshProfile(): void {
    console.log('Forcing profile refresh...');
    this.loadUserProfile();
  }
}
