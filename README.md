# OperaMind v3.1 — Corrigé

Tableau de bord de gestion d'entreprise pour PME africaines.  
Développé par **Emmanuel KIKI** — Cotonou, République du Bénin.

---

## 🚀 Installation

### 1. Variables d'environnement

Copiez `.env.example` en `.env` et remplissez vos valeurs :

```bash
cp .env.example .env
```

Éditez `.env` :
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_FEDAPAY_MONTHLY_LINK=https://me.fedapay.com/...
VITE_FEDAPAY_ANNUAL_LINK=https://me.fedapay.com/...
```

> ⚠️ Ne commitez jamais `.env` dans git. Il est dans `.gitignore`.

### 2. Base de données

Exécutez **uniquement** `supabase_DEFINITIF.sql` dans le SQL Editor Supabase.  
L'ancien `supabase_setup.sql` a été supprimé (il contenait un email admin différent).

### 3. Edge Function (suppression utilisateurs)

```bash
supabase functions deploy delete-user
```

Sans cette Edge Function, le bouton "Supprimer" de l'admin ne supprime que le profil,  
pas le compte auth Supabase.

### 4. Lancer en développement

```bash
npm install
npm run dev
```

---

## ✅ Corrections de sécurité apportées (v3.1 → v3.1 corrigé)

| # | Problème | Statut |
|---|----------|--------|
| 1 | Clé API Supabase hardcodée dans le code | ✅ Déplacée dans `.env` |
| 2 | Email admin visible dans le bundle JS | ✅ Supprimé du code client |
| 3 | Limites plan Free contournables via l'API | ✅ Triggers PostgreSQL ajoutés |
| 4 | Policy RLS admin récursive | ✅ Remplacée par `is_admin()` SECURITY DEFINER |
| 5 | `adminDeleteUser` ne supprimait pas le compte auth | ✅ Edge Function `delete-user` créée |
| 6 | `supabase_setup.sql` avec email admin différent | ✅ Fichier supprimé, un seul SQL |
| 7 | Erreurs Supabase silencieuses sur delete/update | ✅ Toutes les erreurs capturées |
| 8 | `flowType: 'implicit'` déprécié | ✅ Remplacé par `pkce` |
| 9 | `hashPassword` inutilisé et trompeur | ✅ Supprimé de `storage.js` |
| 10 | Bouton Email admin simulé (toast fake) | ✅ Ouvre le client mail réel |
| 11 | Liens FedaPay hardcodés en placeholder | ✅ Dans `.env` |

---

## Architecture

```
src/
├── supabase.js        # Client Supabase (clés via .env)
├── AppContext.jsx      # État global + fonctions métier
├── storage.js         # Utilitaires localStorage
├── App.jsx            # Router principal
└── components/
    ├── AuthScreen.jsx  # Connexion / Inscription / OTP
    ├── PageAdmin.jsx   # Panel administrateur
    └── ...

supabase/
└── functions/
    └── delete-user/   # Edge Function suppression compte
        └── index.ts

supabase_DEFINITIF.sql  # Script SQL unique (tables + RLS + triggers)
.env.example            # Template variables d'environnement
```
