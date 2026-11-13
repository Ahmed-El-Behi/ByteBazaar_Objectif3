import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, type IconName } from '../components/icon';
import { TPipe } from '../core/i18n';

/**
 * Fonctionnalités prévues dans les prochaines versions du site (configurateur, commande,
 * historique…) : la route existe déjà, la page annonce la fonctionnalité.
 * Le nom (en français, traduit à l'affichage) et l'icône viennent des données de la route.
 */
@Component({
  selector: 'app-coming-soon',
  imports: [RouterLink, Icon, TPipe],
  template: `
    <section class="soon card">
      <span class="soon-icon"><app-icon [name]="icon()" [size]="30" [stroke]="1.8" /></span>
      <p class="eyebrow">{{ 'Bientôt disponible' | t }}</p>
      <h1>{{ feature() | t }}</h1>
      <p class="muted">
        {{ 'Cette fonctionnalité arrive dans une prochaine version du site.' | t }}
      </p>
      <div class="actions">
        <a routerLink="/produits" class="btn primary">
          {{ 'Voir le catalogue' | t }}
          <app-icon name="arrowRight" [size]="16" [stroke]="2.2" />
        </a>
        <a routerLink="/" class="btn">{{ "Retour à l'accueil" | t }}</a>
      </div>
    </section>
  `,
  styles: `
    .soon {
      width: min(560px, 100% - 2rem);
      margin: 3.5rem auto;
      padding: 2.6rem 2rem;
      text-align: center;
      border-radius: var(--r-xl);
    }
    .soon-icon {
      display: inline-grid;
      place-items: center;
      width: 68px;
      height: 68px;
      margin-bottom: 1.1rem;
      border-radius: 22px;
      color: var(--accent);
      background: var(--accent-soft);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 25%, transparent);
    }
    .eyebrow {
      margin: 0;
      font-size: var(--fs-xs);
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--pink);
    }
    h1 {
      margin: 0.4rem 0 0.6rem;
      font-family: var(--font-display);
      font-size: var(--fs-3xl);
      letter-spacing: -0.02em;
    }
    .muted {
      margin: 0 auto;
      max-width: 38ch;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.7rem;
      margin-top: 1.6rem;
    }
  `,
})
export class ComingSoonPage {
  readonly feature = input('');
  readonly icon = input<IconName>('sparkles');
}
