import { Component, inject, signal, HostListener, effect } from '@angular/core';
import { Icon } from '../components/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth-service';
import { ComponentCanDeactivate } from '../core/pending-changes.guard';
import { apiErrors } from '../core/utils';
import { TPipe, translate } from '../core/i18n';

@Component({
  standalone: true,
  selector: 'app-account-profile',
  imports: [Icon, CommonModule, FormsModule, TPipe],
  template: `
    <div class="profile-wrapper">
      @if (successMessage()) {
        <div class="alert-success">{{ successMessage() }}</div>
      }
      @if (errorMessage()) {
        <div class="alert-danger">{{ errorMessage() }}</div>
      }

      @if (hasUnsavedChanges()) {
        <div class="warning-banner">
          <div class="warning-info">
            <app-icon name="info" [size]="18" />
            <span>{{ 'Vous avez des modifications non enregistrées.' | t }}</span>
          </div>
          <div class="warning-btns">
            <button
              type="button"
              class="btn small"
              (click)="cancelChanges()"
              [disabled]="isSaving()"
            >
              {{ 'Annuler' | t }}
            </button>
            <button
              type="button"
              class="btn primary small"
              (click)="onSaveProfile()"
              [disabled]="isSaving()"
            >
              {{ (isSaving() ? 'Enregistrement...' : 'Enregistrer') | t }}
            </button>
          </div>
        </div>
      }

      <section class="card">
        <h2 class="card-title">{{ 'Informations personnelles' | t }}</h2>

        <form (ngSubmit)="onSaveProfile()" class="form-layout">
          <div class="grid-2">
            <div class="field">
              <label>{{ 'Prénom' | t }}</label>
              <input
                type="text"
                [(ngModel)]="userForm.firstName"
                name="firstName"
                (ngModelChange)="onFormChange()"
                class="input-tech"
              />
            </div>

            <div class="field">
              <label>{{ 'Nom' | t }}</label>
              <input
                type="text"
                [(ngModel)]="userForm.lastName"
                name="lastName"
                (ngModelChange)="onFormChange()"
                class="input-tech"
              />
            </div>

            <div class="field">
              <label>{{ 'Email (Non modifiable)' | t }}</label>
              <input type="email" [value]="userForm.email" disabled class="input-tech disabled" />
            </div>

            <div class="field">
              <label>{{ 'Téléphone' | t }}</label>
              <input
                type="tel"
                [(ngModel)]="userForm.phone"
                name="phone"
                (ngModelChange)="onFormChange()"
                class="input-tech"
              />
            </div>
          </div>

          <div class="password-box">
            <h3 class="sub-title">{{ 'Changer le mot de passe' | t }}</h3>

            <div class="grid-2">
              <div class="field">
                <label>{{ 'Mot de passe actuel' | t }}</label>
                <div class="input-pass-wrapper">
                  <input
                    [type]="showCurrentPass() ? 'text' : 'password'"
                    [(ngModel)]="userForm.currentPassword"
                    name="currentPassword"
                    (ngModelChange)="onFormChange()"
                    placeholder="••••••••••••"
                    class="input-tech"
                  />
                  <button
                    type="button"
                    class="eye-btn"
                    (click)="showCurrentPass.set(!showCurrentPass())"
                  >
                    @if (showCurrentPass()) {
                      <app-icon name="eyeOff" [size]="18" />
                    } @else {
                      <app-icon name="eye" [size]="18" />
                    }
                  </button>
                </div>
              </div>

              <div class="field">
                <label>{{ 'Nouveau mot de passe' | t }}</label>
                <div class="input-pass-wrapper">
                  <input
                    [type]="showNewPass() ? 'text' : 'password'"
                    [(ngModel)]="userForm.newPassword"
                    name="newPassword"
                    (ngModelChange)="onFormChange()"
                    [placeholder]="'Au moins 8 caractères' | t"
                    class="input-tech"
                  />
                  <button type="button" class="eye-btn" (click)="showNewPass.set(!showNewPass())">
                    @if (showNewPass()) {
                      <app-icon name="eyeOff" [size]="18" />
                    } @else {
                      <app-icon name="eye" [size]="18" />
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-footer">
            <button
              type="submit"
              class="btn primary small"
              [disabled]="!hasUnsavedChanges() || isSaving()"
            >
              {{ (isSaving() ? 'Enregistrement...' : 'Enregistrer les modifications') | t }}
            </button>
          </div>
        </form>
      </section>

      <section class="card">
        <h2 class="card-title">{{ 'Mes adresses de livraison' | t }}</h2>
        <p class="muted soon">
          <app-icon name="info" [size]="18" />
          {{
            'Bientôt disponible : cette fonctionnalité arrive dans une prochaine version du site.'
              | t
          }}
        </p>
      </section>
    </div>
  `,
  styles: `
    .profile-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .alert-success {
      background: color-mix(in srgb, var(--green) 15%, transparent);
      border: 1px solid var(--green);
      color: var(--green);
      padding: 0.8rem 1.2rem;
      border-radius: var(--r-md);
      font-size: var(--fs-md);
    }
    .alert-danger {
      background: color-mix(in srgb, var(--red) 15%, transparent);
      border: 1px solid var(--red);
      color: var(--red);
      padding: 0.8rem 1.2rem;
      border-radius: var(--r-md);
      font-size: var(--fs-md);
    }

    .warning-banner {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      border: 1px solid var(--accent);
      border-radius: var(--r-md);
      padding: 0.8rem 1.2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      color: var(--accent);
    }
    .warning-info {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: var(--fs-md);
      font-weight: 500;
    }
    .warning-btns {
      display: flex;
      gap: 0.5rem;
    }

    .card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 1.5rem;
    }
    .card-title {
      font-size: var(--fs-xl);
      font-weight: 500;
      color: var(--text);
      margin: 0 0 1.2rem 0;
    }

    .form-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .field label {
      font-size: var(--fs-md);
      color: var(--muted);
      font-weight: 400;
    }

    .input-tech {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      padding: 0.75rem 1rem;
      color: var(--text);
      font-size: var(--fs-ui);
      outline: none;
      transition: border-color 0.2s ease;
    }
    .input-tech:focus {
      border-color: var(--accent);
    }
    .input-tech.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    select.input-tech option {
      background: var(--surface);
      color: #fff;
    }

    .password-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .sub-title {
      font-size: var(--fs-ui);
      color: var(--text);
      font-weight: 500;
      margin: 0;
    }

    .input-pass-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-pass-wrapper input {
      width: 100%;
      padding-right: 2.8rem;
    }
    .eye-btn {
      position: absolute;
      right: 0.8rem;
      background: none;
      border: none;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .eye-btn:hover {
      color: var(--text);
    }

    .soon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }
    .muted {
      color: var(--muted);
      font-size: var(--fs-md);
    }
  `,
})
export class AccountProfilePage implements ComponentCanDeactivate {
  readonly auth = inject(AuthService);

  showCurrentPass = signal(false);
  showNewPass = signal(false);
  hasUnsavedChanges = signal(false);
  isSaving = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  userForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  };

  private initialForm = { ...this.userForm };

  constructor() {
    effect(() => {
      const u = this.auth.user();
      if (u) {
        this.userForm.firstName = u.firstName || '';
        this.userForm.lastName = u.lastName || '';
        this.userForm.email = u.email || '';
        this.userForm.phone = u.phone || '';
        this.initialForm = { ...this.userForm };
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }

  canDeactivate(): boolean {
    return !this.hasUnsavedChanges();
  }

  onFormChange() {
    this.hasUnsavedChanges.set(
      this.userForm.firstName !== this.initialForm.firstName ||
        this.userForm.lastName !== this.initialForm.lastName ||
        this.userForm.phone !== this.initialForm.phone ||
        this.userForm.currentPassword !== '' ||
        this.userForm.newPassword !== '',
    );
  }

  cancelChanges() {
    this.userForm = { ...this.initialForm, currentPassword: '', newPassword: '' };
    this.hasUnsavedChanges.set(false);
    this.errorMessage.set(null);
  }

  onSaveProfile() {
    if (!this.hasUnsavedChanges()) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const dto: any = {};
    if (this.userForm.firstName !== this.initialForm.firstName)
      dto.firstName = this.userForm.firstName;
    if (this.userForm.lastName !== this.initialForm.lastName) dto.lastName = this.userForm.lastName;
    if (this.userForm.phone !== this.initialForm.phone) dto.phone = this.userForm.phone;
    if (this.userForm.newPassword) {
      dto.currentPassword = this.userForm.currentPassword;
      dto.newPassword = this.userForm.newPassword;
    }

    this.auth.updateProfile(dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set(translate('Profil mis à jour avec succès !'));
        this.initialForm = { ...this.userForm };
        this.userForm.currentPassword = '';
        this.userForm.newPassword = '';
        this.hasUnsavedChanges.set(false);
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = apiErrors(err);
        this.errorMessage.set(Array.isArray(msg) ? msg.join(', ') : msg);
      },
    });
  }
}
