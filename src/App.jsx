import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext.jsx';
import { supabase } from './supabase.js';
import AuthScreen   from './components/AuthScreen.jsx';
import Sidebar      from './components/Sidebar.jsx';
import Topbar       from './components/Topbar.jsx';
import { Toast, ConfirmModal } from './components/Shared.jsx';
import { UpgradeModal, ForgotModal, PrivacyModal, TermsModal,
         AddOrderModal, AddProductModal, AddCostModal, AddTicketModal,
         SetGoalModal } from './components/Modals.jsx';
import { OperationsDashboard } from './components/DashOperations.jsx';
import { MarketingDashboard }  from './components/DashMarketing.jsx';
import { FinancialDashboard }  from './components/DashFinancial.jsx';
import { ExecutiveDashboard }  from './components/DashExecutive.jsx';
import { SalesDashboard }      from './components/DashSales.jsx';
import { SupportDashboard }    from './components/DashSupport.jsx';
import { CostsBenefits }       from './components/PageCosts.jsx';
import { ReportPage }          from './components/PageReport.jsx';
import { SettingsPage }        from './components/PageSettings.jsx';
import { AdminPanel }          from './components/PageAdmin.jsx';
import { PrivacyPage, TermsPage } from './components/PageLegal.jsx';
import { WelcomeScreen, shouldShowWelcome } from './components/WelcomeScreen.jsx';
import './styles/main.css';

/* ─────────────────────────────────────────────────────────────────
   ÉCRAN DE CHARGEMENT
───────────────────────────────────────────────────────────────── */
function LoadingScreen({ msg = 'Connexion à Supabase...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <div className="loading-mark">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 12 C4 7 7.5 4 12 4 C16.5 4 20 7 20 12"
              stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="3.5" fill="white"/>
            <line x1="8.5" y1="22" x2="15.5" y2="22"
              stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="loading-wordmark">Opera<span>Mind</span></div>
      </div>
      <div className="loading-spinner" />
      <div className="loading-text">{msg}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ÉCRAN DE CONFIRMATION EMAIL
   Affiché quand l'utilisateur arrive depuis le lien de confirmation
   avant que la session soit établie
───────────────────────────────────────────────────────────────── */
function ConfirmingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <div className="loading-mark">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 12 C4 7 7.5 4 12 4 C16.5 4 20 7 20 12"
              stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="3.5" fill="white"/>
            <line x1="8.5" y1="22" x2="15.5" y2="22"
              stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="loading-wordmark">Opera<span>Mind</span></div>
      </div>
      <div className="loading-spinner" />
      <div className="loading-text">Confirmation de votre email...</div>
      <div style={{
        marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.6)',
        textAlign: 'center', maxWidth: 280
      }}>
        Veuillez patienter quelques secondes.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CONTENU DE PAGE
───────────────────────────────────────────────────────────────── */
function PageContent() {
  const { page } = useApp();
  const map = {
    operations: <OperationsDashboard />,
    marketing:  <MarketingDashboard />,
    financial:  <FinancialDashboard />,
    executive:  <ExecutiveDashboard />,
    sales:      <SalesDashboard />,
    support:    <SupportDashboard />,
    costs:      <CostsBenefits />,
    report:     <ReportPage />,
    settings:   <SettingsPage />,
    admin:      <AdminPanel />,
    privacy:    <PrivacyPage />,
    terms:      <TermsPage />,
  };
  return map[page] || <OperationsDashboard />;
}

/* ─────────────────────────────────────────────────────────────────
   APP SHELL (utilisateur connecté)
───────────────────────────────────────────────────────────────── */
function AppShell() {
  const { impersonating, stopImpersonate } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => shouldShowWelcome());

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} />
      <div className="main-wrap">
        {impersonating && (
          <div className="imp-banner">
            <span className="imp-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Mode admin — Compte de <strong>{impersonating.name}</strong>
            </span>
            <button className="btn-imp-stop" onClick={stopImpersonate}>Quitter</button>
          </div>
        )}
        <Topbar onToggle={() => setCollapsed(p => !p)} />
        <main className="page-area"><PageContent /></main>
      </div>

      {/* Modals globaux */}
      <UpgradeModal />
      <ForgotModal />
      <PrivacyModal />
      <TermsModal />
      <AddOrderModal />
      <AddProductModal />
      <AddCostModal />
      <AddTicketModal />
      <SetGoalModal />
      <ConfirmModal />
      {showWelcome && <WelcomeScreen onDone={() => setShowWelcome(false)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   INNER — gestion du flux d'authentification
   C'est ici que se règle le problème du lien de confirmation
───────────────────────────────────────────────────────────────── */
function Inner() {
  const { profile, loading } = useApp();

  // Détecte si on arrive depuis un lien de confirmation Supabase.
  // Supabase place les tokens dans le hash (#) ou les query params (?).
  // Les deux cas sont gérés ici.
  const [confirming, setConfirming] = useState(() => {
    const hash   = window.location.hash;
    const search = window.location.search;

    // Lien de confirmation email : contient access_token dans le hash
    const hasHashToken = hash.includes('access_token');

    // Lien de type PKCE (Supabase v2 récent) : contient code dans les query params
    const hasCodeParam = new URLSearchParams(search).has('code');

    return hasHashToken || hasCodeParam;
  });

  useEffect(() => {
    if (!confirming) return;

    // Si on a un code PKCE dans les query params, Supabase l'échange automatiquement
    // via onAuthStateChange. On attend juste que la session s'établisse.
    // Si on a un access_token dans le hash, même chose.
    // On laisse un timeout de sécurité de 8 secondes max.
    const timeout = setTimeout(() => {
      // Si après 8 secondes on n'est toujours pas connecté,
      // on arrête l'écran de confirmation et on affiche le login
      setConfirming(false);
      // Nettoie l'URL sans recharger la page
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 8000);

    return () => clearTimeout(timeout);
  }, [confirming]);

  useEffect(() => {
    // Dès que le profil est chargé (session établie),
    // on sort de l'écran de confirmation et on nettoie l'URL
    if (profile && confirming) {
      setConfirming(false);
      // Retire le hash et les query params de l'URL sans recharger la page
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [profile, confirming]);

  // Ordre de priorité des écrans :
  // 1. Confirmation en cours (arrivée depuis lien email)
  if (confirming && !profile) return <ConfirmingScreen />;
  // 2. Chargement initial Supabase
  if (loading) return <LoadingScreen />;
  // 3. Pas de session → page de connexion/inscription
  // 4. Session active → dashboard
  return (
    <>
      {!profile ? <AuthScreen /> : <AppShell />}
      <Toast />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  );
}
