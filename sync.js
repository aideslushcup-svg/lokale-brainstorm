// sync.js — JSONbin.io sync for Lokale Hub
// NOTE: This key is visible in source code — acceptable for a private brainstorm board.

var JSONBIN_KEY = '$2a$10$Rx.xEw2A7bdcv9EQAO5Rj.VnglK4DL5HazMdYwORfdqY1r2c9HDVO';
var JSONBIN_BIN = '69ab12f443b1c97be9bacaab';
var JSONBIN_URL = 'https://api.jsonbin.io/v3/b/' + JSONBIN_BIN;

// Default data — used as fallback if JSONbin is inaccessible or empty
var DEFAULT_DATA = {
  tasks: [
    { id: 1, text: "Appel avec le partenaire \u2014 valider la vision", cat: "partenariat", done: false },
    { id: 2, text: "Choisir le nom final de l'app", cat: "partenariat", done: false },
    { id: 3, text: "Definir les roles (dev vs contenu/marketing)", cat: "partenariat", done: false },
    { id: 4, text: "Finaliser le logo Lokale", cat: "design", done: false },
    { id: 5, text: "Valider la palette de couleurs", cat: "design", done: false },
    { id: 6, text: "Ajuster les maquettes selon feedback partenaire", cat: "design", done: false },
    { id: 7, text: "Setup projet Expo + navigation", cat: "dev", done: true },
    { id: 8, text: "Configurer Supabase + migrations", cat: "dev", done: true },
    { id: 9, text: "Implementer ecran Carte avec map", cat: "dev", done: false },
    { id: 10, text: "Implementer Scanner de produits", cat: "dev", done: false },
    { id: 11, text: "Creer les comptes sociaux (Insta, TikTok)", cat: "marketing", done: false },
    { id: 12, text: "Planifier le calendrier de contenu", cat: "marketing", done: false },
    { id: 13, text: "Ecrire 5 premieres recettes", cat: "contenu", done: false },
    { id: 14, text: "Lister les 20 premieres fermes a contacter", cat: "contenu", done: false },
    { id: 15, text: "Brainstorm board + deploy Vercel", cat: "dev", done: true }
  ],
  ideas: [
    { id: 1, text: "Systeme de gamification (badges, points)", tag: "engagement", emoji: "\uD83C\uDFC6", votes: 0 },
    { id: 2, text: "Mode hors-ligne pour la carte", tag: "dev", emoji: "\uD83D\uDCE1", votes: 0 },
    { id: 3, text: "Notifications push (nouveaux deals, saison)", tag: "engagement", emoji: "\uD83D\uDD14", votes: 0 },
    { id: 4, text: "Integration calendrier marches fermiers", tag: "feature", emoji: "\uD83D\uDCC5", votes: 0 },
    { id: 5, text: "Programme de fidelite fermes", tag: "monetisation", emoji: "\uD83D\uDC8E", votes: 0 },
    { id: 6, text: "Partage social (partager une decouverte)", tag: "engagement", emoji: "\uD83D\uDCE4", votes: 0 },
    { id: 7, text: "Widget iOS pour deals du jour", tag: "dev", emoji: "\uD83D\uDCF1", votes: 0 },
    { id: 8, text: "AI recommandation de recettes selon scan", tag: "feature", emoji: "\uD83E\uDD16", votes: 0 },
    { id: 9, text: "Section educative (d'ou vient ta viande?)", tag: "contenu", emoji: "\uD83D\uDCDA", votes: 0 },
    { id: 10, text: "Partenariat avec nutritionnistes", tag: "partenariat", emoji: "\uD83E\uDD57", votes: 0 },
    { id: 11, text: "Livraison collaborative entre fermes", tag: "feature", emoji: "\uD83D\uDE9B", votes: 0 },
    { id: 12, text: "Carte des marches fermiers saisonniers", tag: "feature", emoji: "\uD83D\uDDFA\uFE0F", votes: 0 },
    { id: 13, text: "API publique pour fermes partenaires", tag: "dev", emoji: "\uD83D\uDD0C", votes: 0 },
    { id: 14, text: "Version web (PWA) de la carte", tag: "dev", emoji: "\uD83C\uDF10", votes: 0 }
  ],
  voted: [],
  notes: {}
};

// In-memory cache — starts with defaults, overwritten by JSONbin if accessible
var hubData = JSON.parse(JSON.stringify(DEFAULT_DATA));

function showSyncStatus(msg, color) {
  var els = document.querySelectorAll('#syncStatus');
  els.forEach(function(el) {
    el.textContent = msg;
    el.style.color = color || '#94a3b8';
    el.style.opacity = 1;
    if (msg !== 'Sauvegarde...') {
      setTimeout(function() { el.style.opacity = 0; }, 2500);
    }
  });
}

// Merge fetched data — keeps defaults if bin returns empty arrays
function mergeData(fetched) {
  var result = JSON.parse(JSON.stringify(DEFAULT_DATA));
  if (fetched.tasks && fetched.tasks.length > 0) result.tasks = fetched.tasks;
  if (fetched.ideas && fetched.ideas.length > 0) result.ideas = fetched.ideas;
  if (fetched.voted) result.voted = fetched.voted;
  if (fetched.notes) result.notes = fetched.notes;
  return result;
}

// Fetch full data from JSONbin
function fetchData(callback) {
  showSyncStatus('Chargement...', '#94a3b8');
  fetch(JSONBIN_URL + '/latest', {
    headers: { 'X-Master-Key': JSONBIN_KEY }
  })
  .then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(function(json) {
    hubData = mergeData(json.record || {});
    showSyncStatus('Synchronise', '#2D6A4F');
    if (callback) callback(hubData);
  })
  .catch(function(e) {
    console.warn('JSONbin inaccessible, mode local:', e.message);
    showSyncStatus('Mode local', '#F4A261');
    // Keep default data — don't wipe anything
    if (callback) callback(hubData);
  });
}

// Save full data to JSONbin
function saveData(callback) {
  showSyncStatus('Sauvegarde...', '#F4A261');
  fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: {
      'X-Master-Key': JSONBIN_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(hubData)
  })
  .then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(function() {
    showSyncStatus('Sauvegarde', '#2D6A4F');
    if (callback) callback();
  })
  .catch(function(e) {
    console.warn('Sauvegarde JSONbin echouee:', e.message);
    showSyncStatus('Non synchronise', '#E76F51');
  });
}

// Debounce helper
function debounce(fn, delay) {
  var timer;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}
