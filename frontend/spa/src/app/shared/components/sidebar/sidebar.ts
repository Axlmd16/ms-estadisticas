import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, UserProfile } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [MatCardModule, MatIconModule, CommonModule, RouterModule],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
    userProfile: UserProfile | null = null;
    isAuthenticated = false;

    constructor(
        private userService: UserService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.checkAuthentication();
        this.loadUserProfile();
    }

    checkAuthentication(): void {
        this.isAuthenticated = this.authService.isLoggedIn();
    }

    loadUserProfile(): void {
        if (this.isAuthenticated) {
            this.userService.getCurrentUserProfile().subscribe({
                next: (profile: UserProfile) => {
                    this.userProfile = profile;
                },
                error: (error: any) => {
                    console.error('Error loading profile in sidebar:', error);
                }
            });
        }
    }

    getFullName(): string {
        if (this.userProfile) {
            return `${this.userProfile.firstname} ${this.userProfile.lastname}`;
        }
        return 'Usuario';
    }

    getUserRole(): string {
        if (this.userProfile) {
            return this.userProfile.is_admin ? 'Administrador' : 'Usuario';
        }
        return 'Invitado';
    }

    getAvatarUrl(): string {
        const name = this.getFullName();
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e88e5&color=fff`;
    }
}
