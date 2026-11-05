/**
 * ============================================================
 * Portfolio de Corentin QUINIO — en-tête et pied de page communs
 * ============================================================
 *
 * L'en-tête et le pied de page sont écrits une seule fois, ici, et
 * insérés dans chaque page par deux balises :
 *     <site-header></site-header>   en haut du <body>
 *     <site-footer></site-footer>   en bas du <body>
 *
 * Ce fichier est chargé dans le <head>, sans defer : les balises sont
 * remplies au moment où le navigateur les lit, donc la page s'affiche
 * directement complète, sans clignotement.
 *
 * Sommaire :
 *  1. Chemins : racine du site et page affichée
 *  2. Contenu du menu
 *  3. Balise <site-header> : navigation, lien actif, menu mobile
 *  4. Balise <site-footer> : copyright avec l'année en cours, lien vers les mentions légales
 *  5. Écran d'arrivée : une seule fois par session
 */

/* ============================================================
 * 1. CHEMINS
 * ============================================================
 * Ce fichier est toujours dans js/ : la racine du site est donc le dossier
 * parent de son adresse. Les liens sont construits à partir d'elle, ce qui
 * évite les préfixes ../ différents selon la profondeur de la page. */
const SITE_ROOT = new URL('../', document.currentScript.src);

// Chemin de la page affichée depuis la racine, ex. « pages/projets/projet2.html »
const currentPath = decodeURI(window.location.pathname)
    .slice(decodeURI(SITE_ROOT.pathname).length) || 'index.html';

/* ============================================================
 * 2. CONTENU DU MENU
 * ============================================================
 * Ajouter une page au menu = ajouter une ligne ici.
 * section : début des chemins qui allument ce lien (les fiches
 * pages/projets/… allument « Réalisations »). */
const NAV_LINKS = [
    { href: 'index.html',           icon: 'fa-home',      label: 'Accueil' },
    { href: 'pages/briefcase.html', icon: 'fa-briefcase', label: 'Entreprise' },
    { href: 'pages/projects.html',  icon: 'fa-code',      label: 'Réalisations', section: 'pages/projets/' },
    { href: 'pages/tableau-e5.html', icon: 'fa-table',    label: 'Tableau E5' },
    { href: 'pages/veille.html',    icon: 'fa-eye',       label: 'Veille' },
    { href: 'pages/contact.html',   icon: 'fa-envelope',  label: 'Contact' },
];

const isActive = (link) =>
    currentPath === link.href || (link.section && currentPath.startsWith(link.section));

/* ============================================================
 * 3. BALISE <site-header>
 * ============================================================ */
class SiteHeader extends HTMLElement {
    connectedCallback() {
        const links = NAV_LINKS.map((link) => {
            const current = isActive(link) ? ' class="active" aria-current="page"' : '';
            return `<li><a href="${new URL(link.href, SITE_ROOT)}"${current}>`
                + `<i class="fas ${link.icon}" aria-hidden="true"></i><span>${link.label}</span></a></li>`;
        }).join('');

        this.innerHTML = `
            <header>
                <nav aria-label="Navigation principale">
                    <div class="nav-title"><a href="${new URL('index.html', SITE_ROOT)}">CQ<span class="nav-title-dot" aria-hidden="true"></span>Portfolio</a></div>
                    <button class="burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="nav-links">
                        <span></span><span></span><span></span>
                    </button>
                    <ul class="nav-links" id="nav-links">${links}</ul>
                </nav>
            </header>`;

        this.setupBurger();
    }

    /* Menu mobile : le bouton « burger » ouvre et ferme la liste des liens.
       Le menu se referme quand on choisit un lien ou qu'on appuie sur Échap. */
    setupBurger() {
        const burger = this.querySelector('.burger');
        const navLinks = this.querySelector('.nav-links');

        const setOpen = (open) => {
            // aria-expanded et aria-label informent les lecteurs d'écran de l'état du menu
            burger.setAttribute('aria-expanded', String(open));
            burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
            navLinks.classList.toggle('is-open', open);
        };

        burger.addEventListener('click', () => {
            setOpen(burger.getAttribute('aria-expanded') !== 'true');
        });

        navLinks.addEventListener('click', (event) => {
            if (event.target.closest('a')) setOpen(false);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') setOpen(false);
        });
    }
}

/* ============================================================
 * 4. BALISE <site-footer>
 * ============================================================
 * L'année est calculée à l'affichage : le copyright reste à jour seul. */
class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer>
                <div class="container">
                    <p>© ${new Date().getFullYear()} Corentin QUINIO · Portfolio BTS SIO SISR · <a href="${new URL('pages/mentions-legales.html', SITE_ROOT)}">Mentions légales</a></p>
                </div>
            </footer>`;
    }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);

/* ============================================================
 * 5. ÉCRAN D'ARRIVÉE
 * ============================================================
 * L'écran d'arrivée de l'accueil (.intro) ne se joue qu'une fois par session.
 * Comme ce fichier est lu avant l'affichage, la classe intro-seen posée ici
 * masque l'écran dès le départ, sans clignotement. Le stockage peut être
 * bloqué (navigation privée stricte) : on joue alors l'animation à chaque fois. */
try {
    if (sessionStorage.getItem('intro-seen')) {
        document.documentElement.classList.add('intro-seen');
    } else {
        sessionStorage.setItem('intro-seen', '1');
    }
} catch {
    // Stockage indisponible : rien à faire
}
