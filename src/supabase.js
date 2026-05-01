import { createClient } from '@supabase/supabase-js';

// ✅ CORRIGÉ : Les clés sont lues depuis les variables d'environnement (.env)
// Elles ne sont plus exposées en clair dans le code source.
// Créez un fichier .env à la racine avec :
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    "Variables d'environnement Supabase manquantes.\n" +
    "Créez un fichier .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    // ✅ CORRIGÉ : 'pkce' remplace 'implicit' (déprécié dans Supabase v2)
    // pkce est plus sécurisé : le token ne transite plus dans l'URL
    flowType: 'pkce',
  },
});
