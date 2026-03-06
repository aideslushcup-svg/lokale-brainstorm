// sync.js — JSONbin.io sync for Lokale Hub
// NOTE: This key is visible in source code — acceptable for a private brainstorm board.

var JSONBIN_KEY = '$2a$10$Rx.xEw2A7bdcv9EQAO5Rj.VnglK4DL5HazMdYwORfdqY1r2c9HDVO';
var JSONBIN_BIN = '69ab12f443b1c97be9bacaab';
var JSONBIN_URL = 'https://api.jsonbin.io/v3/b/' + JSONBIN_BIN;

// In-memory cache of the full data object
var hubData = { tasks: [], ideas: [], voted: [], notes: {} };

function showSyncStatus(msg, color) {
  var el = document.getElementById('syncStatus');
  if (!el) return;
  el.textContent = msg;
  el.style.color = color || '#94a3b8';
  el.style.opacity = 1;
  if (msg === 'Sauvegarde...') return;
  setTimeout(function() { el.style.opacity = 0; }, 2000);
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
    hubData = json.record || { tasks: [], ideas: [], voted: [], notes: {} };
    showSyncStatus('Synchronise', '#2D6A4F');
    if (callback) callback(hubData);
  })
  .catch(function(e) {
    console.error('Sync fetch error:', e);
    showSyncStatus('Erreur de connexion', '#E76F51');
    if (callback) callback(hubData); // fallback to empty
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
    console.error('Sync save error:', e);
    showSyncStatus('Erreur de sauvegarde', '#E76F51');
  });
}

// Debounce helper — prevents saving on every keystroke
function debounce(fn, delay) {
  var timer;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}
