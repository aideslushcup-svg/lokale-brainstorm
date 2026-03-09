// sync.js — Supabase sync for Lokale Hub Centre de Commandes

var SB_URL = 'https://nrgiwajszuhmekpfmxsj.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZ2l3YWpzenVobWVrcGZteHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzYzNzEsImV4cCI6MjA4ODQxMjM3MX0.obZuPO_0xctGQkVmdvVRbqh2-gPPiRMeguvXOQkOz8Y';
var SB_HEADERS = {
  'apikey': SB_KEY,
  'Authorization': 'Bearer ' + SB_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

// Default data — shown on first load before sync, and as fallback
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
    { id: 14, text: "Version web (PWA) de la carte", tag: "dev", emoji: "\uD83C\uDF10", votes: 0 },
    { id: 15, text: "Dashboard Fermier — app/web pour gerer les deals", tag: "feature", emoji: "\uD83D\uDCCA", votes: 0 },
    { id: 16, text: "Panier mystere a prix reduit (produits surprise)", tag: "feature", emoji: "\uD83C\uDF81", votes: 0 },
    { id: 17, text: "Comparaison de prix (ferme locale vs epicerie)", tag: "feature", emoji: "\uD83D\uDCB2", votes: 0 },
    { id: 18, text: "Alertes aubaines personnalisees (push)", tag: "engagement", emoji: "\uD83D\uDD14", votes: 0 },
    { id: 19, text: "Compte a rebours sur les deals urgents", tag: "feature", emoji: "\u23F3", votes: 0 },
    { id: 20, text: "Badge LIVE quand partenaire visite une ferme", tag: "engagement", emoji: "\uD83D\uDD34", votes: 0 },
    { id: 21, text: "Scanner IA — Claude Vision pour produits inconnus", tag: "dev", emoji: "\uD83E\uDD16", votes: 0 },
    { id: 22, text: "Chemin anime du user vers la ferme la plus proche", tag: "feature", emoji: "\uD83D\uDDFA\uFE0F", votes: 0 },
    { id: 23, text: "Section educative: d'ou vient ton steak?", tag: "contenu", emoji: "\uD83E\uDD69", votes: 0 }
  ],
  voted: [],
  notes: {}
};

// In-memory — starts with defaults, overwritten on fetch
var hubData = JSON.parse(JSON.stringify(DEFAULT_DATA));

function showSyncStatus(msg, color) {
  document.querySelectorAll('#syncStatus').forEach(function(el) {
    el.textContent = msg;
    el.style.color = color || '#94a3b8';
    el.style.opacity = 1;
    if (msg !== 'Sauvegarde...') {
      setTimeout(function() { el.style.opacity = 0; }, 2500);
    }
  });
}

// Fetch from Supabase
function fetchData(callback) {
  showSyncStatus('Chargement...', '#94a3b8');
  fetch(SB_URL + '/rest/v1/hub_data?id=eq.main', {
    headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
  })
  .then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(function(rows) {
    var row = rows[0];
    if (row) {
      // Merge: use DB data if non-empty, else keep defaults
      if (row.tasks && row.tasks.length > 0) hubData.tasks = row.tasks;
      if (row.ideas && row.ideas.length > 0) hubData.ideas = row.ideas;
      if (row.voted) hubData.voted = row.voted;
      if (row.notes) hubData.notes = row.notes;

      // First time: DB has empty arrays — save defaults into DB
      if ((!row.tasks || row.tasks.length === 0) && (!row.ideas || row.ideas.length === 0)) {
        saveData();
      }
    }
    showSyncStatus('Synchronise', '#2D6A4F');
    if (callback) callback(hubData);
  })
  .catch(function(e) {
    console.warn('Supabase fetch error:', e.message);
    showSyncStatus('Mode local', '#F4A261');
    if (callback) callback(hubData);
  });
}

// Save to Supabase
function saveData(callback) {
  showSyncStatus('Sauvegarde...', '#F4A261');
  fetch(SB_URL + '/rest/v1/hub_data?id=eq.main', {
    method: 'PATCH',
    headers: SB_HEADERS,
    body: JSON.stringify({
      tasks: hubData.tasks,
      ideas: hubData.ideas,
      voted: hubData.voted,
      notes: hubData.notes
    })
  })
  .then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    showSyncStatus('Sauvegarde', '#2D6A4F');
    if (callback) callback();
  })
  .catch(function(e) {
    console.warn('Supabase save error:', e.message);
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
