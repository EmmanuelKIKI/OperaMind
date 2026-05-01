# Configuration Supabase — Résolution du lien de confirmation email

## Le problème
Quand un utilisateur clique sur le lien de confirmation dans son email,
il est renvoyé sur la page de connexion au lieu d'être connecté directement.

## Cause
L'URL de redirection configurée dans Supabase ne correspond pas à l'URL
réelle de ton application déployée.

---

## ÉTAPE 1 — Configurer l'URL de ton site dans Supabase

1. Va sur https://supabase.com → ton projet
2. Dans le menu gauche : **Authentication** → **URL Configuration**
3. Configure :
   - **Site URL** : `https://ton-domaine.vercel.app` (ou ton domaine personnalisé)
   - **Redirect URLs** : ajoute ces URLs (une par ligne) :
     ```
     https://ton-domaine.vercel.app
     https://ton-domaine.vercel.app/**
     http://localhost:5173
     http://localhost:5173/**
     ```

⚠️ Remplace `ton-domaine.vercel.app` par l'URL réelle de ton app.

---

## ÉTAPE 2 — Vérifier le template de l'email de confirmation

1. Dans Supabase : **Authentication** → **Email Templates**
2. Sélectionne **Confirm signup**
3. Vérifie que le lien contient bien `{{ .SiteURL }}` :
   ```
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
     Confirmer mon email
   </a>
   ```
   Ou la version avec le lien magique :
   ```
   <a href="{{ .ConfirmationURL }}">Confirmer mon email</a>
   ```
   `{{ .ConfirmationURL }}` est la version recommandée — elle utilise automatiquement
   le Site URL configuré à l'étape 1.

---

## ÉTAPE 3 — Configurer le type de confirmation (PKCE recommandé)

1. Dans Supabase : **Authentication** → **Providers** → **Email**
2. Active **"Confirm email"** : OUI
3. Dans **"Email OTP Expiry"** : 3600 (1 heure)
4. **"Mailer Autoconfirm"** : NON (on veut la confirmation par email)

---

## ÉTAPE 4 — Vérifier la configuration Vercel

Le fichier `vercel.json` à la racine du projet contient :
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
Ce fichier est OBLIGATOIRE pour que les redirections Supabase arrivent
sur l'app React et non sur une page 404.

---

## ÉTAPE 5 — Tester

1. Crée un nouveau compte avec un email réel
2. Vérifie que le toast "Compte créé ! Vérifiez votre email." apparaît
3. Ouvre l'email → clique sur le lien
4. Tu dois voir l'écran "Confirmation de votre email..." pendant 1-2 secondes
5. Puis être redirigé automatiquement vers le dashboard OperaMind

---

## En cas de problème persistant

### Symptôme : le lien expire immédiatement
→ L'horloge du serveur Supabase et du client sont désynchronisées.
→ Solution : augmente "Email OTP Expiry" à 86400 (24h) dans les paramètres.

### Symptôme : "Email link is invalid or has expired"
→ Le lien a déjà été utilisé (chaque lien n'est valable qu'une fois).
→ Solution : demande à l'utilisateur de faire "Mot de passe oublié" pour se connecter.

### Symptôme : redirige vers localhost en production
→ Le Site URL dans Supabase pointe encore vers localhost.
→ Solution : mettre à jour le Site URL avec l'URL de production (étape 1).

---

## Configuration Google OAuth (optionnel)

1. Va sur https://console.cloud.google.com
2. Crée un projet → OAuth 2.0 credentials
3. Authorized redirect URIs : `https://cpwatkozommciflwveet.supabase.co/auth/v1/callback`
4. Dans Supabase : Authentication → Providers → Google
5. Entre le Client ID et Client Secret Google
6. Ajoute `https://ton-domaine.vercel.app` dans les Redirect URLs Supabase

---

Développé par Emmanuel KIKI — Cotonou, République du Bénin
emmanualkiki@gmail.com
