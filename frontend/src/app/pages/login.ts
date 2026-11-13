import { Component, inject, signal } from '@angular/core';
import { Icon } from '../components/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth-service';
import { apiErrors, safeRedirect } from '../core/utils';
import { TPipe } from '../core/i18n';

@Component({
  selector: 'app-login',
  imports: [Icon, RouterLink, TPipe],
  template: `
    <div class="card auth-card">
      <h1>{{ 'Connexion' | t }}</h1>
      <p class="muted">{{ 'Retrouve ton compte ByteBazaar.' | t }}</p>

      @if (errors().length) {
        <div class="alert">
          @for (e of errors(); track e) {
            <p>{{ e }}</p>
          }
        </div>
      }

      <form (submit)="submit($event, email.value, password.value)">
        <div class="field">
          <label for="email">{{ 'Email' | t }}</label>
          <input #email id="email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <div class="field-header">
            <label for="password">{{ 'Mot de passe' | t }}</label>
            <a routerLink="/reset-password" class="link-btn">
              {{ 'Mot de passe oublié ?' | t }}
            </a>
          </div>

          <div class="password-wrapper">
            <input
              #password
              id="password"
              [type]="showPassword() ? 'text' : 'password'"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="eye-btn"
              (click)="showPassword.set(!showPassword())"
              [attr.aria-label]="'Afficher/Masquer le mot de passe' | t"
            >
              @if (showPassword()) {
                <app-icon name="eyeOff" [size]="18" />
              } @else {
                <app-icon name="eye" [size]="18" />
              }
            </button>
          </div>
        </div>
        <button class="btn primary block" type="submit" [disabled]="busy()">
          {{ (busy() ? 'Connexion…' : 'Se connecter') | t }}
        </button>
      </form>

      <p class="muted switch">
        {{ 'Pas encore de compte ?' | t }}
        <a routerLink="/inscription" class="create-account-link">{{ 'Créer un compte' | t }}</a>
      </p>
    </div>
  `,
  styles: `
    .switch {
      margin-top: 1.2rem;
      text-align: center;
    }
    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.3rem;
    }
    .field-header label {
      margin-bottom: 0;
    }

    .link-btn {
      background: none;
      border: none;
      color: var(--accent, var(--accent));
      font-size: var(--fs-md);
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      text-decoration: none; /* Supprime le soulignement */
      transition:
        opacity 0.2s ease,
        filter 0.2s ease;
    }
    .link-btn:hover {
      opacity: 0.9;
      filter: brightness(1.15); /* Effet d'illumination au survol */
    }

    .create-account-link {
      color: var(--accent, var(--accent));
      font-weight: 600;
      text-decoration: none;
    }
    .create-account-link:hover {
      filter: brightness(1.15);
    }

    .alert-success {
      background: color-mix(in srgb, var(--green) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--green) 40%, transparent);
      color: var(--green);
      padding: 0.8rem 1rem;
      border-radius: var(--r-sm);
      margin-bottom: 1rem;
    }
    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .password-wrapper input {
      width: 100%;
      padding-right: 2.5rem;
    }
    .eye-btn {
      position: absolute;
      right: 0.8rem;
      background: none;
      border: none;
      color: var(--muted, #94a3b8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: color 0.2s ease;
    }
    .eye-btn:hover {
      color: var(--text, #ffffff);
    }
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly errors = signal<string[]>([]);
  readonly busy = signal(false);
  readonly showPassword = signal(false);

  submit(event: Event, email: string, password: string) {
    event.preventDefault();
    this.busy.set(true);
    this.errors.set([]);
    this.auth.login(email, password).subscribe({
      next: () =>
        this.router.navigateByUrl(safeRedirect(this.route.snapshot.queryParamMap.get('redirect'))),
      error: (e) => {
        this.errors.set(apiErrors(e));
        this.busy.set(false);
      },
    });
  }
}
