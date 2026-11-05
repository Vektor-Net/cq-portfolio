/**
 * ============================================================
 * Portfolio de Corentin QUINIO — script commun à toutes les pages
 * ============================================================
 *
 * Le même fichier est chargé sur chaque page. Chaque fonction setupXxx()
 * gère une seule fonctionnalité et commence par vérifier que ses éléments
 * existent : si la page ne les contient pas, la fonction ne fait rien.
 * L'en-tête, le menu mobile et le pied de page sont dans js/layout.js.
 *
 * Sommaire :
 *  1. Outils communs
 *  2. Sous-titre écrit lettre par lettre (accueil)
 *  3. Onglets des compétences (accueil)
 *  4. Cartes de compétences retournables (accueil)
 *  5. Frise du parcours (accueil)
 *  6. Carrousels (veille, réalisations)
 *  7. Pluie de caractères en fond du bandeau (accueil)
 *  8. Formulaire de contact (contact)
 *  9. Animations : écran d'arrivée et apparition au défilement
 * 10. Explications dépliables du tableau E5 (tableau E5)
 * 11. Lancement
 */

/* ============================================================
 * 1. OUTILS COMMUNS
 * ============================================================ */

// Vrai si le visiteur a demandé moins d'animations dans les réglages de son système
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Renvoie une couleur de la charte définie dans style.css.
 * Les couleurs y sont stockées en canaux R, G, B (ex. --rgb-blue: 94, 162, 255),
 * ce qui permet de choisir l'opacité ici sans dupliquer la valeur.
 *
 * @param {string} name     nom de la variable CSS, ex. '--rgb-blue'
 * @param {number} opacity  opacité entre 0 et 1
 * @returns {string}        couleur au format rgba(), utilisable dans un canvas
 */
function cssColor(name, opacity = 1) {
    const channels = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return `rgba(${channels}, ${opacity})`;
}

// Vrai si l'écran d'arrivée de l'accueil est en train de se jouer (voir layout.js, partie 5)
function introPlaying() {
    return Boolean(document.querySelector('.intro'))
        && !prefersReducedMotion
        && !document.documentElement.classList.contains('intro-seen');
}

/* ============================================================
 * 2. SOUS-TITRE ÉCRIT LETTRE PAR LETTRE (accueil)
 * ============================================================
 * Le texte complet est dans l'attribut data-text de .typing-text.
 * Il s'écrit, reste affiché, s'efface, puis recommence.
 * Le texte est aussi présent en clair (masqué) pour les lecteurs d'écran. */
function setupTyping() {
    const target = document.querySelector('.typing-text');
    if (!target) return;

    const fullText = target.dataset.text || '';

    // Sans animation : on affiche directement le texte complet
    if (prefersReducedMotion) {
        target.textContent = fullText;
        return;
    }

    // Délais en millisecondes
    const TYPE_DELAY = 90;      // entre deux lettres écrites
    const ERASE_DELAY = 45;     // entre deux lettres effacées
    const HOLD_DELAY = 2400;    // texte complet affiché avant effacement
    const RESTART_DELAY = 500;  // pause avant de réécrire

    let index = 0;              // nombre de lettres affichées
    let erasing = false;

    function step() {
        if (!erasing && index < fullText.length) {
            index += 1;
            target.textContent = fullText.slice(0, index);
            setTimeout(step, TYPE_DELAY);
        } else if (!erasing) {
            erasing = true;
            setTimeout(step, HOLD_DELAY);
        } else if (index > 0) {
            index -= 1;
            target.textContent = fullText.slice(0, index);
            setTimeout(step, ERASE_DELAY);
        } else {
            erasing = false;
            setTimeout(step, RESTART_DELAY);
        }
    }

    // Sur l'accueil, on attend la fin de l'écran d'arrivée pour commencer à écrire
    setTimeout(step, introPlaying() ? 1900 : 0);
}

/* ============================================================
 * 3. ONGLETS DES COMPÉTENCES (accueil)
 * ============================================================
 * Chaque onglet (.skills-tab) affiche le panneau dont l'id est indiqué
 * dans son attribut aria-controls et masque les autres.
 * Les flèches gauche / droite du clavier passent d'un onglet à l'autre. */
function setupSkillTabs() {
    const tabs = Array.from(document.querySelectorAll('.skills-tab'));
    if (!tabs.length) return;

    function select(tab) {
        tabs.forEach((other) => {
            const selected = other === tab;
            const panel = document.getElementById(other.getAttribute('aria-controls'));

            other.setAttribute('aria-selected', String(selected));
            // Seul l'onglet actif est accessible avec Tab, les autres via les flèches
            other.tabIndex = selected ? 0 : -1;
            if (panel) panel.hidden = !selected;
        });
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(tab));

        tab.addEventListener('keydown', (event) => {
            if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

            const offset = event.key === 'ArrowRight' ? 1 : -1;
            // Le modulo permet de revenir au premier onglet après le dernier
            const next = tabs[(index + offset + tabs.length) % tabs.length];
            select(next);
            next.focus();
        });
    });
}

/* ============================================================
 * 4. CARTES DE COMPÉTENCES RETOURNABLES (accueil)
 * ============================================================
 * À la souris, la carte se retourne au survol (géré en CSS).
 * Ici on ajoute les deux autres façons de la retourner :
 * - un tap sur écran tactile (pas de survol possible) ;
 * - les touches Entrée ou Espace quand la carte a le focus clavier.
 * Les deux basculent la classe .is-flipped. */
function setupFlipCards() {
    const cards = document.querySelectorAll('.flip-card');
    if (!cards.length) return;

    // Vrai sur les appareils sans survol (téléphones, tablettes)
    const isTouchScreen = window.matchMedia('(hover: none)');

    cards.forEach((card) => {
        const toggle = () => card.classList.toggle('is-flipped');

        card.addEventListener('click', () => {
            // À la souris, le clic ne fait rien : le survol suffit
            if (isTouchScreen.matches) toggle();
        });

        card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault(); // évite que la touche Espace fasse défiler la page
            toggle();
        });
    });
}

/* ============================================================
 * 5. FRISE DU PARCOURS (accueil)
 * ============================================================
 * Survoler un point le sélectionne (il reste sélectionné en quittant le
 * survol) ; au doigt, c'est le tap, au clavier, le focus. Une seule étape
 * sélectionnée à la fois ; Échap ou un clic ailleurs la désélectionne.
 * Son détail s'affiche de l'autre côté de la ligne sur grand écran, sous le
 * libellé sur mobile (CSS). Chaque étape prend aussi la couleur de la ligne
 * à sa position. */

// Paliers du dégradé de la ligne : identiques à --gradient-inline et --gradient-vertical (style.css)
const TIMELINE_STOPS = [
    { color: '--rgb-cyan', at: 0 },
    { color: '--rgb-blue', at: 0.4 },
    { color: '--rgb-violet', at: 0.7 },
    { color: '--rgb-red', at: 1 },
];

/**
 * Couleur du dégradé à une position donnée, au format « R, G, B ».
 * @param {number} t  position sur la ligne, de 0 (début) à 1 (fin)
 */
function gradientColorAt(t) {
    const rootStyle = getComputedStyle(document.documentElement);
    const channels = (name) => rootStyle.getPropertyValue(name).split(',').map(Number);

    const end = TIMELINE_STOPS.findIndex((stop) => stop.at >= t);
    if (end <= 0) return channels(TIMELINE_STOPS[0].color).join(', ');

    const from = TIMELINE_STOPS[end - 1];
    const to = TIMELINE_STOPS[end];
    const ratio = (t - from.at) / (to.at - from.at);
    const a = channels(from.color);
    const b = channels(to.color);

    return a.map((value, i) => Math.round(value + (b[i] - value) * ratio)).join(', ');
}

/* Mesure où tombe chaque point sur sa ligne (horizontale sur grand écran,
   verticale sur mobile) et range dans --dot-rgb, sur son étape, la couleur
   du dégradé à cet endroit. */
function paintTimelineDots() {
    document.querySelectorAll('.timeline-track').forEach((track) => {
        const line = getComputedStyle(track, '::before');
        const box = track.getBoundingClientRect();
        const vertical = parseFloat(line.height) > parseFloat(line.width);
        const start = vertical ? box.top + parseFloat(line.top) : box.left + parseFloat(line.left);
        const length = parseFloat(vertical ? line.height : line.width);

        track.querySelectorAll('.timeline-node').forEach((node) => {
            const rect = node.querySelector('.timeline-dot').getBoundingClientRect();
            const center = vertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
            const t = Math.min(1, Math.max(0, (center - start) / length));
            node.style.setProperty('--dot-rgb', gradientColorAt(t));
        });
    });
}

function setupTimeline() {
    const nodes = document.querySelectorAll('.timeline-node');
    if (!nodes.length) return;

    const canHover = window.matchMedia('(hover: hover)');
    let openNode = null;   // étape sélectionnée (une seule sur la page)

    const setOpen = (node) => {
        openNode = node;
        nodes.forEach((other) => {
            const open = other === node;
            other.classList.toggle('is-open', open);
            other.querySelector('.timeline-dot').setAttribute('aria-expanded', String(open));
        });
    };

    paintTimelineDots();
    // Les polices chargées peuvent décaler les points de la frise verticale
    window.addEventListener('load', paintTimelineDots);
    // La frise change de sens à 860 px : on recalcule les couleurs
    let frame = 0;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(paintTimelineDots);
    });

    nodes.forEach((node) => {
        const dot = node.querySelector('.timeline-dot');

        dot.addEventListener('mouseenter', () => {
            if (canHover.matches) setOpen(node);
        });

        // À la souris, le point est déjà sélectionné par le survol : le clic ne
        // le referme pas. Au doigt, un tap sur le point ouvert le referme.
        dot.addEventListener('click', () => {
            setOpen(!canHover.matches && node === openNode ? null : node);
        });

        // Au clavier seulement : à la souris, c'est le survol qui décide
        dot.addEventListener('focus', () => {
            if (dot.matches(':focus-visible')) setOpen(node);
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.timeline-dot')) setOpen(null);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setOpen(null);
    });
}

/* ============================================================
 * 6. CARROUSELS (veille, réalisations)
 * ============================================================
 * Chaque bloc [data-carousel] contient une piste .carousel-track qui défile
 * horizontalement et deux boutons fléchés. Un clic fait défiler d'environ
 * une largeur visible ; les flèches se grisent au début et à la fin.
 * En option : un compteur [data-carousel-count] (numéro du premier élément
 * visible) et une barre .carousel-progress. La piste se fait aussi glisser
 * à la souris (le tactile et le pavé tactile défilent nativement). */
function setupCarousels() {
    document.querySelectorAll('[data-carousel]').forEach((wrapper) => {
        const track = wrapper.querySelector('.carousel-track');
        if (!track) return;

        const prev = wrapper.querySelector('[data-direction="prev"]');
        const next = wrapper.querySelector('[data-direction="next"]');
        const count = wrapper.querySelector('[data-carousel-count]');
        const progress = wrapper.querySelector('.carousel-progress');

        // Met à jour flèches, compteur et barre selon la position de défilement
        function update() {
            const max = track.scrollWidth - track.clientWidth;
            const atStart = track.scrollLeft <= 4;
            const atEnd = track.scrollLeft >= max - 4;

            if (prev) prev.disabled = atStart;
            if (next) next.disabled = atEnd;
            track.classList.toggle('is-end', atEnd);

            if (progress) {
                // La barre montre la part déjà vue : la largeur visible compte dès le départ
                const seen = (track.scrollLeft + track.clientWidth) / track.scrollWidth;
                progress.style.setProperty('--progress', Math.min(1, seen).toFixed(3));
            }

            if (count) {
                const left = track.getBoundingClientRect().left;
                const first = [...track.children].findIndex((item) => item.getBoundingClientRect().right > left + 20);
                count.textContent = String(Math.max(0, first) + 1).padStart(2, '0');
            }
        }

        [prev, next].forEach((button) => {
            if (!button) return;
            button.addEventListener('click', () => {
                const direction = button === prev ? -1 : 1;
                const distance = Math.max(260, Math.floor(track.clientWidth * 0.85));

                track.scrollBy({
                    left: direction * distance,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            });
        });

        // Glisser à la souris. Un vrai glisser (plus de 5 px) annule le clic
        // qui suit, pour ne pas ouvrir une fiche en lâchant le bouton.
        let startX = 0;
        let startScroll = 0;
        let dragged = false;

        track.addEventListener('pointerdown', (event) => {
            if (event.pointerType !== 'mouse' || event.button !== 0) return;
            startX = event.clientX;
            startScroll = track.scrollLeft;
            dragged = false;

            const onMove = (moveEvent) => {
                const delta = moveEvent.clientX - startX;
                if (!dragged && Math.abs(delta) > 5) {
                    dragged = true;
                    track.classList.add('is-dragging');
                }
                if (dragged) track.scrollLeft = startScroll - delta;
            };

            const onUp = () => {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
                if (!dragged) return;

                // Retour de l'aimantation : on laisse la piste se caler sur l'élément le plus proche
                const position = track.scrollLeft;
                track.classList.remove('is-dragging');
                track.scrollLeft = position;
            };

            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        });

        track.addEventListener('click', (event) => {
            if (dragged) {
                event.preventDefault();
                dragged = false;
            }
        }, true);

        // Empêche le navigateur de « prendre » le lien ou l'image pendant le glisser
        track.addEventListener('dragstart', (event) => event.preventDefault());

        track.addEventListener('scroll', update, { passive: true });
        // Recalcule aussi quand la piste change de taille : redimensionnement,
        // ou affichage d'un onglet qui la masquait (mesurée à 0 tant qu'elle est cachée)
        new ResizeObserver(update).observe(track);
    });
}

/* ============================================================
 * 7. PLUIE DE CARACTÈRES EN FOND DU BANDEAU (accueil)
 * ============================================================
 * Dessine dans le <canvas id="hero-matrix"> des colonnes de caractères
 * qui tombent. À chaque image, un voile sombre semi-transparent recouvre
 * l'image précédente : les anciens caractères s'estompent et forment une traînée.
 * Les couleurs viennent de la charte (style.css).
 * L'animation est désactivée si le visiteur demande moins de mouvement,
 * et mise en pause quand le bandeau n'est plus visible à l'écran. */
function setupHeroMatrix() {
    const canvas = document.getElementById('hero-matrix');
    if (!canvas || prefersReducedMotion) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%*+=-/[]{}<>?';
    const FONT_SIZE = 14;   // taille d'un caractère, en pixels ; c'est aussi la largeur d'une colonne
    const FRAME_MS = 1000 / 60; // une ligne toutes les 16 ms : même vitesse sur un écran 60, 120 ou 144 Hz

    const colors = {
        fade: cssColor('--rgb-navy-950', 0.11),        // voile qui efface progressivement
        glyph: cssColor('--rgb-blue', 0.9),             // caractère normal
        highlight: cssColor('--rgb-blue-light', 0.95)   // caractère plus clair, de temps en temps
    };

    let columns = 0;
    let drops = [];         // pour chaque colonne : ligne où se trouve le caractère qui tombe
    let frameId = null;
    let lastFrame = 0;
    let lastWidth = 0;

    // Adapte la taille du dessin à celle du bandeau (et à la densité de l'écran)
    // Sur mobile, la barre d'adresse qui apparaît en défilant change la hauteur :
    // on ne recommence la pluie que si la largeur change vraiment.
    function resizeCanvas() {
        if (canvas.clientWidth === lastWidth) return;
        lastWidth = canvas.clientWidth;

        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(canvas.clientWidth * ratio);
        canvas.height = Math.floor(canvas.clientHeight * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.font = `${FONT_SIZE}px "Courier New", monospace`; // la police se perd quand le canvas change de taille

        columns = Math.max(1, Math.floor(canvas.clientWidth / FONT_SIZE));
        // Départs négatifs et aléatoires : les colonnes n'arrivent pas toutes en même temps
        drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -25));
    }

    function draw(time) {
        frameId = window.requestAnimationFrame(draw);
        if (time - lastFrame < FRAME_MS - 1) return; // image en trop sur un écran rapide : on saute
        lastFrame = time;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        context.fillStyle = colors.fade;
        context.fillRect(0, 0, width, height);

        for (let column = 0; column < columns; column += 1) {
            const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            const y = drops[column] * FONT_SIZE;

            context.fillStyle = Math.random() > 0.975 ? colors.highlight : colors.glyph;
            context.fillText(char, column * FONT_SIZE, y);

            // Arrivée en bas : la colonne repart du haut, à un moment aléatoire
            if (y > height && Math.random() > 0.98) {
                drops[column] = Math.floor(Math.random() * -20);
            }
            drops[column] += 1;
        }
    }

    function start() {
        if (frameId === null) frameId = window.requestAnimationFrame(draw);
    }

    function stop() {
        if (frameId !== null) window.cancelAnimationFrame(frameId);
        frameId = null;
    }

    resizeCanvas();
    new ResizeObserver(resizeCanvas).observe(canvas);

    // N'anime que lorsque le bandeau est visible, pour économiser le processeur
    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
    });
    observer.observe(canvas);
}

/* ============================================================
 * 8. FORMULAIRE DE CONTACT (contact)
 * ============================================================
 * Aucune adresse n'est écrite dans le site : le formulaire est envoyé au
 * service Web3Forms, qui transfère le message par e-mail. Ici : contrôle des
 * champs avec des messages en français, envoi sans recharger la page, et
 * compte rendu dans .form-status (lu par les lecteurs d'écran). */
const CONTACT_MESSAGES = {
    valueMissing: 'Ce champ est obligatoire.',
    typeMismatch: 'Adresse e-mail invalide (exemple : nom@domaine.fr).',
    tooShort: 'Message trop court.',
};

function setupContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const button = form.querySelector('button[type="submit"]');
    const label = button.querySelector('span');
    const status = form.querySelector('.form-status');
    const fields = [...form.querySelectorAll('.field input, .field textarea')];

    const setStatus = (text, kind = '') => {
        status.textContent = text;
        status.className = `form-status${kind ? ` is-${kind}` : ''}`;
    };

    // Affiche (ou efface) l'erreur d'un champ ; renvoie vrai s'il est valide
    function checkField(field) {
        const error = document.getElementById(`${field.id}-error`);
        const problem = Object.keys(CONTACT_MESSAGES).find((key) => field.validity[key]);
        const valid = !problem && field.value.trim() !== '';

        // Le lecteur d'écran annonce l'erreur quand le champ reçoit le focus
        field.setAttribute('aria-invalid', String(!valid));
        if (valid) field.removeAttribute('aria-describedby');
        else field.setAttribute('aria-describedby', error.id);
        error.textContent = valid ? '' : CONTACT_MESSAGES[problem || 'valueMissing'];
        return valid;
    }

    // Demande de CV : objet et message pré-remplis, depuis le bouton de la page
    // ou en arrivant d'une autre page avec ?objet=cv
    function prefillCvRequest() {
        form.querySelector('#contact-subject').value = 'Demande de CV';
        form.querySelector('#contact-message').value = "Bonjour Corentin,\n\nPourriez-vous m'envoyer votre CV ?\n\n";
        const name = form.querySelector('#contact-name');
        (name.value ? form.querySelector('#contact-message') : name).focus({ preventScroll: true });
        form.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }

    if (new URLSearchParams(window.location.search).get('objet') === 'cv') prefillCvRequest();

    document.querySelector('[data-request-cv]')?.addEventListener('click', (event) => {
        event.preventDefault();
        prefillCvRequest();
    });

    // Après une première erreur, le champ se revérifie pendant la saisie
    fields.forEach((field) => field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') checkField(field);
    }));

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const invalid = fields.filter((field) => !checkField(field));
        if (invalid.length) {
            invalid[0].focus();
            setStatus('Vérifiez les champs signalés.', 'error');
            return;
        }

        const data = new FormData(form);
        if (String(data.get('access_key')).startsWith('A-REMPLACER')) {
            setStatus("Le formulaire n'est pas encore activé : clé Web3Forms manquante.", 'error');
            return;
        }
        data.set('subject', `[Portfolio] ${data.get('subject')}`);

        button.disabled = true;
        label.textContent = 'Envoi…';
        setStatus('');

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: data,
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);

            form.reset();
            setStatus('Merci, votre message est bien parti. Je vous réponds dès que possible.', 'success');
        } catch {
            setStatus("L'envoi a échoué. Vérifiez votre connexion et réessayez dans un instant.", 'error');
        } finally {
            button.disabled = false;
            label.textContent = 'Envoyer';
        }
    });
}

/* ============================================================
 * 9. ANIMATIONS : ÉCRAN D'ARRIVÉE ET APPARITION AU DÉFILEMENT
 * ============================================================
 * L'écran d'arrivée se joue en CSS ; ici, un clic ou une touche le passe.
 * Les blocs encore hors de l'écran reçoivent .reveal, puis .is-visible quand
 * ils y entrent (style.css, partie 16). Rien n'est caché si JavaScript ne
 * se charge pas, ni si le visiteur a demandé moins d'animations. */
function setupIntro() {
    const intro = document.querySelector('.intro');
    if (!intro || !introPlaying()) return;

    const skip = () => intro.classList.add('is-skipped');
    intro.addEventListener('click', skip);
    document.addEventListener('keydown', skip, { once: true });
}

const REVEAL_SELECTOR = [
    '.section-title', '.section-intro', '.page-hero', '.panel', '.card', '.tile',
    '.flip-card', '.figure', '.project-rail-wrap', '.project-tags', '.project-nav', '.back-link'
].join(', ');

function setupReveal() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    // Les blocs du bandeau ont leur propre animation, les faces des cartes
    // retournables sont gérées par la carte, et un bloc déjà animé par un
    // parent ne l'est pas une seconde fois.
    const blocks = [...document.querySelectorAll(`main :is(${REVEAL_SELECTOR})`)].filter((block) =>
        !block.closest('.hero, .flip-face, .project-rail')
        && !block.parentElement.closest(REVEAL_SELECTOR));

    const viewportBottom = window.innerHeight;
    const pending = blocks.filter((block) => block.getBoundingClientRect().top > viewportBottom * 0.92);

    // Cascade : rang du bloc parmi ses voisins animés (limité pour ne pas trop attendre)
    pending.forEach((block) => {
        const siblings = [...block.parentElement.children].filter((child) => pending.includes(child));
        block.style.setProperty('--reveal-index', Math.min(siblings.indexOf(block), 5));
        block.classList.add('reveal');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const block = entry.target;
            observer.unobserve(block);
            block.classList.add('is-visible');

            // Fin de l'apparition : on rend la main aux transitions du bloc
            const delay = 700 + Number(block.style.getPropertyValue('--reveal-index') || 0) * 80 + 150;
            setTimeout(() => {
                block.classList.remove('reveal', 'is-visible');
                block.style.removeProperty('--reveal-index');
            }, delay);
        });
    }, { rootMargin: '0px 0px -8% 0px' });

    pending.forEach((block) => observer.observe(block));
}

/* ============================================================
 * 10. EXPLICATIONS DÉPLIABLES DU TABLEAU E5
 * ============================================================
 * Le titre de chaque ligne du tableau mène à son <details> (#id).
 * Le navigateur fait défiler jusqu'au bloc sans l'ouvrir : on l'ouvre ici,
 * à l'arrivée sur la page comme à chaque clic sur une ligne. */
function setupE5Details() {
    if (!document.querySelector('details.e5-note')) return;

    const openTarget = () => {
        const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
        if (target instanceof HTMLDetailsElement) target.open = true;
    };

    openTarget();
    window.addEventListener('hashchange', openTarget);
}

/* ============================================================
 * 11. LANCEMENT
 * ============================================================
 * Exécuté une fois le HTML de la page entièrement chargé. */
document.addEventListener('DOMContentLoaded', () => {
    setupTyping();
    setupSkillTabs();
    setupFlipCards();
    setupTimeline();
    setupCarousels();
    setupHeroMatrix();
    setupContactForm();
    setupE5Details();
    setupIntro();
    setupReveal();
});
