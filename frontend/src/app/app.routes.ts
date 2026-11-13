import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';
import { pendingChangesGuard } from './core/pending-changes.guard';
import { HomePage } from './pages/home';
import { ProductListPage } from './pages/product-list';

const comingSoon = () => import('./pages/coming-soon').then((m) => m.ComingSoonPage);

// L'accueil et le catalogue (pages d'entrée) sont dans le bundle initial ; les autres pages
// sont chargées à la demande. Titres en français, traduits par TranslatedTitleStrategy.
// Les fonctionnalités des prochaines versions ont déjà leur route : page « Bientôt disponible ».
// i18n
export const routes: Routes = [
  { path: '', component: HomePage, title: 'ByteBazaar · Composants PC en Tunisie' },
  { path: 'produits', component: ProductListPage, title: 'Catalogue · ByteBazaar' },
  { path: 'catalogue', redirectTo: 'produits', pathMatch: 'full' },
  {
    path: 'produits/:slug',
    loadComponent: () => import('./pages/product-detail').then((m) => m.ProductDetailPage),
    title: 'Produit · ByteBazaar',
  },
  {
    path: 'configurateur',
    loadComponent: comingSoon,
    data: { feature: 'Configurateur PC', icon: 'wrench' },
    title: 'Configurateur PC · ByteBazaar',
  },

  {
    path: 'contact',
    loadComponent: () => import('./pages/contact').then((m) => m.ContactPage),
    title: 'Contactez-nous · ByteBazaar',
  },
  {
    path: 'a-propos',
    loadComponent: () => import('./pages/about').then((m) => m.AboutPage),
    title: 'À propos · ByteBazaar',
  },
  {
    path: 'conditions',
    loadComponent: () => import('./pages/legal').then((m) => m.LegalPage),
    data: { doc: 'terms' },
    title: 'Conditions générales de vente · ByteBazaar',
  },
  {
    path: 'confidentialite',
    loadComponent: () => import('./pages/legal').then((m) => m.LegalPage),
    data: { doc: 'privacy' },
    title: 'Politique de confidentialité · ByteBazaar',
  },

  {
    path: 'connexion',
    loadComponent: () => import('./pages/login').then((m) => m.LoginPage),
    title: 'Connexion · ByteBazaar',
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/register').then((m) => m.RegisterPage),
    title: 'Inscription · ByteBazaar',
  },
  {
    path: 'reset-password',
    loadComponent: comingSoon,
    data: { feature: 'Mot de passe oublié', icon: 'mail' },
    title: 'Réinitialisation · ByteBazaar',
  },

  {
    path: 'panier',
    loadComponent: () => import('./pages/cart').then((m) => m.CartPage),
    title: 'Mon Panier · ByteBazaar',
  },
  {
    path: 'checkout',
    loadComponent: comingSoon,
    data: { feature: 'Commande', icon: 'truck' },
    title: 'Commande · ByteBazaar',
  },

  {
    path: 'compte',
    loadComponent: () => import('./pages/account').then((m) => m.AccountPage),
    canActivate: [authGuard],
    title: 'Mon compte · ByteBazaar',
    children: [
      { path: '', redirectTo: 'profil', pathMatch: 'full' },
      {
        path: 'profil',
        loadComponent: () => import('./pages/account-profile').then((m) => m.AccountProfilePage),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'commandes',
        loadComponent: comingSoon,
        data: { feature: 'Mes commandes', icon: 'orders' },
      },
      {
        path: 'configurations',
        loadComponent: comingSoon,
        data: { feature: 'Mes configurations', icon: 'monitor' },
      },
    ],
  },
  { path: 'mes-commandes', redirectTo: 'compte/commandes', pathMatch: 'full' },

  { path: '**', redirectTo: '' },
];
// /i18n
