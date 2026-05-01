// Utilitaire de persistance localStorage
// Toutes les données utilisateur sont sauvegardées ici

export const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage plein ou désactivé — silencieux
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  },
  clear() {
    try { localStorage.clear(); } catch {}
  },
};

// ✅ CORRIGÉ : hashPassword et verifyPassword supprimés
// Ces fonctions n'étaient jamais utilisées (l'auth est gérée par Supabase)
// et leur présence créait une confusion sur la gestion des mots de passe.

// Génère un ID unique
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Date aujourd'hui format ISO
export function today() {
  return new Date().toISOString().split('T')[0];
}

// Date affichage fr
export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR');
}

// Mois court
export const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
