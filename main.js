/**
 * Project de Programmation événementielle
 * KAJY - Calculatrice Professionnelle
 * Version 1.0
 * Développé avec soin et précision
 *
 */

// ===== VARIABLES GLOBALES =====
const State = {
    expression: '',
    historique: [],
    favoris: [],
    currentDisplay: '0'
};

// ===== GESTION DU THÈME =====
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.querySelector('.theme-btn i');
    
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeBtn.classList.remove('fa-moon');
        themeBtn.classList.add('fa-sun');
        localStorage.setItem('kajy-theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeBtn.classList.remove('fa-sun');
        themeBtn.classList.add('fa-moon');
        localStorage.setItem('kajy-theme', 'light');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('kajy-theme') || 'light';
    const body = document.body;
    const themeBtn = document.querySelector('.theme-btn i');
    
    if (savedTheme === 'dark') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeBtn.classList.remove('fa-moon');
        themeBtn.classList.add('fa-sun');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeBtn.classList.remove('fa-sun');
        themeBtn.classList.add('fa-moon');
    }
}

// ===== GESTION DE LA NAVIGATION =====
function afficherSection(sectionId) {
    // Masquer toutes les sections
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Désactiver tous les items de navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Afficher la section demandée
    document.getElementById(sectionId).classList.add('active');
    
    // Activer l'item de navigation correspondant
    const navItems = document.querySelectorAll('.nav-item');
    const sectionIndex = ['accueil', 'favoris', 'calculatrice', 'historique', 'about'].indexOf(sectionId);
    if (navItems[sectionIndex]) {
        navItems[sectionIndex].classList.add('active');
    }
    
    // Mettre à jour les données si nécessaire
    if (sectionId === 'historique') {
        mettreAJourHistoriqueComplet();
    } else if (sectionId === 'favoris') {
        mettreAJourFavoris();
    }
}

// ===== FONCTIONS CALCULATRICE =====
function mettreAJourAffichage() {
    const resultatElement = document.getElementById('resultat');
    const expressionElement = document.getElementById('expression-calc');
    
    // Formater l'expression pour l'affichage
    let expressionAffichee = State.expression.replace(/\*/g, '×').replace(/\//g, '÷');
    
    // Afficher l'expression en cours ou le résultat
    if (State.expression) {
        expressionElement.textContent = expressionAffichee;
        resultatElement.textContent = '';
    } else {
        expressionElement.textContent = '';
        resultatElement.textContent = State.currentDisplay;
    }
    
    // Ajuster la taille de police selon la longueur
    ajusterTaillePolice(expressionElement, expressionAffichee);
}

function ajusterTaillePolice(element, texte) {
    if (texte.length > 15) {
        element.style.fontSize = '0.9rem';
    } else if (texte.length > 10) {
        element.style.fontSize = '0.95rem';
    } else {
        element.style.fontSize = '1rem';
    }
}

function ajouterValeur(valeur) {
    // Validation pour éviter les expressions invalides
    const dernnierCaractere = State.expression.slice(-1);
    const operateurs = ['+', '-', '*', '/'];
    
    // Gestion spéciale pour le double zéro
    if (valeur === '00') {
        if (State.expression === '' || State.expression === '0') {
            State.expression = '0';
        } else {
            if (operateurs.includes(dernnierCaractere)) {
                State.expression += '0';
            } else {
                State.expression += '00';
            }
        }
    } else if (operateurs.includes(dernnierCaractere) && operateurs.includes(valeur)) {
        // Remplacer le dernier opérateur
        State.expression = State.expression.slice(0, -1) + valeur;
    } else {
        // Empêcher les points multiples dans un nombre
        if (valeur === '.') {
            const parties = State.expression.split(/[\+\-\*\/]/);
            const dernierePartie = parties[parties.length - 1];
            if (dernierePartie.includes('.')) {
                return;
            }
        }
        
        // Gestion du zéro initial
        if (valeur === '0' && State.expression === '0') {
            return;
        } else if (State.expression === '0' && !operateurs.includes(valeur) && valeur !== '.') {
            State.expression = valeur;
        } else {
            State.expression += valeur;
        }
    }
    
    // Mettre à jour l'affichage en temps réel
    State.currentDisplay = State.expression || '0';
    mettreAJourAffichage();
}

function effacerTout() {
    State.expression = '';
    State.currentDisplay = '0';
    mettreAJourAffichage();
}

function supprimerDernier() {
    State.expression = State.expression.slice(0, -1);
    State.currentDisplay = State.expression || '0';
    mettreAJourAffichage();
}

function calculer() {
    try {
        if (!State.expression) return;
        
        // Sauvegarder l'expression complète pour l'affichage et l'historique
        const expressionComplete = State.expression;
        
        // Sécuriser l'évaluation
        const resultat = evaluerExpression(State.expression);
        
        // Mettre à jour l'affichage avec le résultat
        afficherResultat(expressionComplete, resultat);
        
        // Ajouter à l'historique
        ajouterHistorique(expressionComplete, resultat);
        
        // Réinitialiser pour le prochain calcul
        State.expression = resultat.toString();
        State.currentDisplay = resultat.toString();
        
    } catch (error) {
        afficherErreur('Erreur de calcul');
    }
}

function evaluerExpression(expr) {
    const resultat = eval(expr);
    
    // Formater le résultat
    if (typeof resultat === 'number') {
        // Éviter les nombres avec trop de décimales
        if (!Number.isInteger(resultat)) {
            return parseFloat(resultat.toFixed(8));
        }
    }
    return resultat;
}

function afficherResultat(expressionComplete, resultat) {
    const resultatElement = document.getElementById('resultat');
    const expressionElement = document.getElementById('expression-calc');
    
    expressionElement.textContent = expressionComplete.replace(/\*/g, '×').replace(/\//g, '÷');
    resultatElement.textContent = formatNombre(resultat);
}

function formatNombre(nombre) {
    // Formater les grands nombres avec séparateurs de milliers
    if (typeof nombre === 'number' && Math.abs(nombre) >= 1000) {
        return nombre.toLocaleString('fr-FR', {
            maximumFractionDigits: 8
        });
    }
    return nombre.toString();
}

function afficherErreur(message) {
    const resultatElement = document.getElementById('resultat');
    resultatElement.textContent = message;
    resultatElement.style.color = '#ef4444';
    
    // Réinitialiser après 2 secondes
    setTimeout(() => {
        State.expression = '';
        State.currentDisplay = '0';
        mettreAJourAffichage();
        resultatElement.style.color = '';
    }, 2000);
}

// ===== GESTION HISTORIQUE =====
function ajouterHistorique(expressionComplete, resultat) {
    const calculComplet = {
        id: Date.now(),
        expression: expressionComplete.replace(/\*/g, '×').replace(/\//g, '÷'),
        resultat: resultat,
        date: new Date().toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        favori: false
    };
    
    State.historique.unshift(calculComplet);
    
    // Garder seulement les 15 derniers calculs
    if (State.historique.length > 15) {
        State.historique.pop();
    }
    
    // Sauvegarder
    sauvegarderDonnees();
    
    // Mettre à jour les affichages
    if (document.getElementById('historique').classList.contains('active')) {
        mettreAJourHistoriqueComplet();
    }
}

function mettreAJourHistoriqueComplet() {
    const historiqueListe = document.getElementById('historiqueListe');
    
    if (State.historique.length === 0) {
        historiqueListe.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>Aucun calcul dans l'historique</p>
                <small>Effectuez des calculs pour les voir apparaître ici</small>
            </div>
        `;
        return;
    }
    
    historiqueListe.innerHTML = State.historique.map(calc => `
        <div class="history-item">
            <div class="calc-info">
                <div class="calc-expression">${calc.expression}</div>
                <div class="calc-result">= ${formatNombre(calc.resultat)}</div>
                <div class="calc-date">${calc.date}</div>
            </div>
            <div class="calc-actions">
                <button class="action-btn btn-favorite ${calc.favori ? 'active' : ''}" 
                        onclick="toggleFavori(${calc.id})"
                        title="${calc.favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                    <i class="fas fa-star"></i>
                </button>
                <button class="action-btn btn-delete-item" 
                        onclick="supprimerCalcul(${calc.id})"
                        title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ===== GESTION DES FAVORIS =====
function toggleFavori(calculId) {
    const calcul = State.historique.find(c => c.id === calculId);
    if (calcul) {
        calcul.favori = !calcul.favori;
        
        if (calcul.favori) {
            // Ajouter aux favoris si pas déjà présent
            if (!State.favoris.find(f => f.id === calculId)) {
                State.favoris.unshift({...calcul});
            }
        } else {
            // Retirer des favoris
            State.favoris = State.favoris.filter(f => f.id !== calculId);
        }
        
        sauvegarderDonnees();
        mettreAJourHistoriqueComplet();
        mettreAJourFavoris();
    }
}

function mettreAJourFavoris() {
    const listeFavoris = document.getElementById('listeFavoris');
    
    if (State.favoris.length === 0) {
        listeFavoris.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <p>Aucun calcul favori</p>
                <small>Ajoutez des calculs à vos favoris depuis l'historique</small>
            </div>
        `;
        return;
    }
    
    listeFavoris.innerHTML = State.favoris.map(calc => `
        <div class="history-item">
            <div class="calc-info">
                <div class="calc-expression">${calc.expression}</div>
                <div class="calc-result">= ${formatNombre(calc.resultat)}</div>
                <div class="calc-date">${calc.date}</div>
            </div>
            <div class="calc-actions">
                <button class="action-btn btn-favorite active" 
                        onclick="toggleFavori(${calc.id})"
                        title="Retirer des favoris">
                    <i class="fas fa-star"></i>
                </button>
                <button class="action-btn btn-delete-item" 
                        onclick="supprimerCalcul(${calc.id})"
                        title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function supprimerCalcul(calculId) {
    if (confirm('Supprimer ce calcul de l\'historique ?')) {
        State.historique = State.historique.filter(c => c.id !== calculId);
        State.favoris = State.favoris.filter(f => f.id !== calculId);
        sauvegarderDonnees();
        mettreAJourHistoriqueComplet();
        mettreAJourFavoris();
    }
}

function effacerHistorique() {
    if (confirm('Voulez-vous vraiment effacer tout l\'historique ? Cette action est irréversible.')) {
        State.historique = [];
        sauvegarderDonnees();
        mettreAJourHistoriqueComplet();
    }
}

// ===== SAUVEGARDE ET CHARGEMENT =====
function sauvegarderDonnees() {
    try {
        localStorage.setItem('kajy-historique', JSON.stringify(State.historique));
        localStorage.setItem('kajy-favoris', JSON.stringify(State.favoris));
    } catch (error) {
        console.warn('Impossible de sauvegarder les données:', error);
    }
}

function chargerDonnees() {
    try {
        const historiqueSauvegarde = localStorage.getItem('kajy-historique');
        const favorisSauvegarde = localStorage.getItem('kajy-favoris');
        
        if (historiqueSauvegarde) {
            State.historique = JSON.parse(historiqueSauvegarde);
        }
        
        if (favorisSauvegarde) {
            State.favoris = JSON.parse(favorisSauvegarde);
        }
    } catch (error) {
        console.warn('Erreur lors du chargement des données:', error);
        // Réinitialiser les données en cas d'erreur
        State.historique = [];
        State.favoris = [];
    }
}

// ===== GESTION DU CLAVIER =====
function gererToucheClavier(event) {
    const key = event.key;
    
    // Empêcher le comportement par défaut pour les touches de calculatrice
    if ('0123456789+-*/.'.includes(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
        event.preventDefault();
    }
    
    if (key >= '0' && key <= '9') {
        ajouterValeur(key);
    } else if (['+', '-', '*', '/', '.'].includes(key)) {
        ajouterValeur(key);
    } else if (key === 'Enter' || key === '=') {
        calculer();
    } else if (key === 'Escape' || key === 'Delete') {
        effacerTout();
    } else if (key === 'Backspace') {
        supprimerDernier();
    }
}

// Empêcher le zoom sur les inputs
function prevenirZoom(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}

let lastTouchEnd = 0;
function prevenirDoubleTap(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}

// ===== INITIALISATION =====
function initialiserApplication() {
    // Charger les préférences
    loadTheme();
    chargerDonnees();
    
    // Initialiser l'affichage
    mettreAJourAffichage();
    afficherSection('accueil');
    
    // Mettre à jour les données au cas où
    mettreAJourFavoris();
    
    console.log('KAJY Calculator - Système initialisé avec succès');
    console.log('Historique chargé:', State.historique.length, 'calculs');
    console.log('Favoris chargés:', State.favoris.length, 'calculs');
}

// ===== ÉVÉNEMENTS =====
document.addEventListener('keydown', gererToucheClavier);
document.addEventListener('touchstart', prevenirZoom, { passive: false });
document.addEventListener('touchend', prevenirDoubleTap, false);
document.addEventListener('DOMContentLoaded', initialiserApplication);

// ===== EXPORT POUR UTILISATION GLOBALE =====
window.KAJY = {
    toggleTheme,
    afficherSection,
    calculer,
    effacerTout,
    effacerHistorique,
    toggleFavori
};
