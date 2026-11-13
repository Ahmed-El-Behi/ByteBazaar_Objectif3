import { HttpErrorResponse } from '@angular/common/http';
import { HIDDEN_SPECS, SPEC_LABELS, translateSpecValue } from '../core/spec-labels';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { CatalogApi } from '../core/catalog-api';
import { ProductDetail } from '../core/models';
import { ToastService } from '../core/toast.service';
import { Icon } from '../components/icon';
import { TndPipe } from '../core/tnd.pipe';
import { CartStateService } from '../core/cart.service';
import { apiErrors } from '../core/utils';
import { I18nService, LocalNamePipe, ProductNamePipe, TPipe, localProductName } from '../core/i18n';

type State =
  | { status: 'loading' | 'notfound' | 'error'; product: null }
  | { status: 'ok'; product: ProductDetail };

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, TndPipe, TPipe, LocalNamePipe, ProductNamePipe, Icon],
  template: `
    <div class="container page">
      @if (state().product; as p) {
        <nav class="crumbs muted">
          <a routerLink="/produits">{{ 'Catalogue' | t }}</a> ›
          <a routerLink="/produits" [queryParams]="{ category: p.category.slug }">
            {{ p.category | localName }}
          </a>
          › {{ p.name | productName }}
        </nav>

        <div class="main">
          <div class="card ph">
            @if (p.images.length) {
              <img [src]="p.images[0].url" [alt]="p.images[0].altText ?? p.name | productName" />
            } @else {
              <span>{{ p.brand.name }}</span>
            }
          </div>

          <div class="info">
            <small class="muted"> {{ p.brand.name }} · {{ 'Réf.' | t }} {{ p.sku }} </small>

            <h1>{{ p.name | productName }}</h1>

            <p class="desc">{{ description(p) }}</p>

            <div class="buy card">
              <strong class="price">{{ p.price | tnd }}</strong>

              <span class="badge" [class.ok]="p.isAvailable">
                {{ (p.isAvailable ? 'En stock' : 'Rupture de stock') | t }}
              </span>

              <button
                class="btn primary"
                [disabled]="!p.isAvailable || adding()"
                (click)="addToCart(p)"
              >
                <app-icon name="cart" [size]="17" [stroke]="2.2" />
                {{ (adding() ? 'Ajout...' : 'Ajouter au panier') | t }}
              </button>
            </div>

            @if (errorMsg()) {
              <p class="badge" style="margin-top:0.8rem; display:inline-block;">{{ errorMsg() }}</p>
            }
          </div>
        </div>

        @if (specRows().length) {
          <section class="card specs">
            <h2>{{ 'Caractéristiques' | t }}</h2>

            <table>
              @for (s of specRows(); track s.id) {
                <tr>
                  <th>{{ s.label }}</th>
                  <td>{{ s.value }}</td>
                </tr>
              }
            </table>
          </section>
        }
      } @else if (state().status === 'notfound') {
        <p class="card empty">
          {{ "Ce produit n'existe pas." | t }}
          <a routerLink="/produits">
            <u>{{ 'Retour au catalogue' | t }}</u>
          </a>
        </p>
      } @else if (state().status === 'error') {
        <p class="card empty">
          {{ 'Impossible de joindre le serveur. Le backend est-il lancé ?' | t }}
        </p>
      } @else {
        <p class="muted">{{ 'Chargement…' | t }}</p>
      }
    </div>
  `,

  styles: `
    .page {
      padding-block: 1.5rem;
    }

    .crumbs {
      font-size: var(--fs-md);
      margin-bottom: 1.2rem;
    }

    .crumbs a:hover {
      color: var(--accent);
    }

    .main {
      display: grid;
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
      gap: 2rem;
      align-items: start;
    }

    .ph {
      width: 100%;
      max-width: 380px;
      height: 340px;
      margin-inline: auto;
      padding: 16px;

      display: flex;
      align-items: center;
      justify-content: center;

      overflow: hidden;
      border-radius: 36px;
      background: var(--ph-bg);
      box-sizing: border-box;
    }

    .ph img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center center;
      mix-blend-mode: multiply;
    }

    .info {
      min-width: 0;
      padding-top: 0.3rem;
    }

    h1 {
      font-size: var(--fs-3xl);
      line-height: 1.25;
      margin: 0.5rem 0 0.8rem;
    }

    .desc {
      color: var(--muted);
      line-height: 1.7;
    }

    .buy {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.2rem;
      margin-top: 1.2rem;
      border-radius: 999px;
      padding: 0.8rem 0.8rem 0.8rem 1.6rem;
    }

    .price {
      font-size: var(--fs-3xl);
      color: var(--accent);
      margin-right: auto;
    }

    .buy .btn.primary {
      padding: 0.8rem 1.4rem;
    }

    .specs {
      margin-top: 2rem;
      padding: 1.2rem 1.4rem;
      border-radius: var(--r-xl);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      text-align: left;
      padding: 0.55rem 0;
      border-bottom: 1px solid var(--border);
    }

    th {
      width: 45%;
      color: var(--muted);
      font-weight: 600;
    }

    .empty {
      padding: 2rem;
      text-align: center;
      color: var(--muted);
    }

    @media (max-width: 800px) {
      .main {
        grid-template-columns: 1fr;
        gap: 1.2rem;
      }

      .ph {
        max-width: 340px;
        height: 290px;
      }

      .info {
        padding-top: 0;
      }

      h1 {
        font-size: var(--fs-2xl);
      }

      .buy {
        padding: 1rem;
      }
    }

    @media (max-width: 480px) {
      .ph {
        max-width: 300px;
        height: 260px;
      }

      .price {
        font-size: var(--fs-2xl);
      }
    }
  `,
})
export class ProductDetailPage {
  private api = inject(CatalogApi);
  private cartState = inject(CartStateService);
  private toast = inject(ToastService);
  readonly i18n = inject(I18nService);

  slug = input.required<string>();

  adding = signal(false);
  errorMsg = signal<string | null>(null);

  readonly state = toSignal<State, State>(
    toObservable(this.slug).pipe(
      switchMap((slug) =>
        this.api.product(slug).pipe(
          map((product): State => ({
            status: 'ok',
            product,
          })),
          catchError((e: HttpErrorResponse) =>
            of<State>({
              status: e.status === 404 ? 'notfound' : 'error',
              product: null,
            }),
          ),
          startWith<State>({
            status: 'loading',
            product: null,
          }),
        ),
      ),
    ),
    {
      initialValue: {
        status: 'loading',
        product: null,
      },
    },
  );

  constructor() {
    effect(() => {
      this.slug();
      this.errorMsg.set(null);
    });
  }

  /** Caractéristiques du produit, traduites */
  readonly specRows = computed(() => {
    // Les caractéristiques de la source sont en anglais : traduites en français, telles quelles en anglais
    const english = this.i18n.lang() === 'en';
    return (this.state().product?.specs ?? [])
      .filter((s) => !HIDDEN_SPECS.has(s.name))
      .map((s) =>
        english
          ? { id: s.id, label: s.name, value: s.valueText }
          : {
              id: s.id,
              label: SPEC_LABELS[s.name] ?? s.name,
              value: translateSpecValue(s.valueText),
            },
      );
  });

  /** Description dans la langue choisie (le nom du produit qu'elle cite garde sa couleur traduite) */
  description(p: ProductDetail): string {
    if (this.i18n.lang() !== 'en' || !p.descriptionEn) return p.descriptionFr;
    return p.descriptionEn.split(p.name).join(localProductName(p.name, 'en'));
  }

  addToCart(p: ProductDetail) {
    this.adding.set(true);
    this.errorMsg.set(null);

    const product = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      stockQuantity: p.stockQuantity,
      image: p.images[0] ? { url: p.images[0].url, altText: p.images[0].altText } : null,
    };

    this.cartState.addItem(product, 1).subscribe({
      next: () => {
        this.adding.set(false);
        this.toast.added(p.name, product.image?.url);
      },
      error: (e) => {
        this.adding.set(false);
        this.errorMsg.set(apiErrors(e)[0]);
      },
    });
  }
}
