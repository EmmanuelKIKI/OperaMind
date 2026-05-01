import { useApp } from '../AppContext.jsx';

export function PrivacyPage() {
  const { setPage } = useApp();
  return (
    <div className="pgrid">
      <div className="csfull">
        <button className="btn-ghost" style={{ marginBottom: 16 }} onClick={() => setPage('settings')}>
          ← Retour aux paramètres
        </button>
        <div className="card legal-card">
          <h1 className="legal-title">Politique de confidentialité</h1>
          <p className="legal-date">Dernière mise à jour : Janvier 2026</p>

          <h2>1. Données collectées</h2>
          <p>OperaMind collecte uniquement les données nécessaires au fonctionnement du service : adresse email, nom complet, et les données métier que vous saisissez manuellement (commandes, revenus, coûts, tickets).</p>

          <h2>2. Utilisation des données</h2>
          <p>Vos données sont utilisées exclusivement pour vous fournir les tableaux de bord et analyses. Elles ne sont jamais vendues, partagées ou exploitées à des fins commerciales tierces.</p>

          <h2>3. Sécurité</h2>
          <p>Les mots de passe sont hashés (SHA-256 avec sel) avant stockage. Les données sont stockées localement sur votre appareil (localStorage). Aucune transmission vers un serveur externe sans votre consentement.</p>

          <h2>4. Vos droits</h2>
          <p>Vous pouvez à tout moment demander la suppression de votre compte et de vos données en contactant :</p>
          <p><strong style={{ color: 'var(--blue)' }}>emmanualkiki@gmail.com</strong></p>

          <h2>5. Cookies</h2>
          <p>OperaMind n'utilise pas de cookies tiers ni de traceurs publicitaires. Seul le localStorage est utilisé pour la persistance de session.</p>

          <h2>6. Responsable du traitement</h2>
          <p><strong>Emmanuel KIKI</strong><br />Cotonou, République du Bénin<br />emmanualkiki@gmail.com</p>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  const { setPage } = useApp();
  return (
    <div className="pgrid">
      <div className="csfull">
        <button className="btn-ghost" style={{ marginBottom: 16 }} onClick={() => setPage('settings')}>
          ← Retour aux paramètres
        </button>
        <div className="card legal-card">
          <h1 className="legal-title">Conditions Générales d'Utilisation</h1>
          <p className="legal-date">Dernière mise à jour : Janvier 2026</p>

          <h2>1. Acceptation</h2>
          <p>En utilisant OperaMind, vous acceptez pleinement les présentes conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.</p>

          <h2>2. Description du service</h2>
          <p>OperaMind est un tableau de bord business pour PMEs, permettant le suivi des opérations, ventes, finances, marketing et support. Le service est fourni "tel quel".</p>

          <h2>3. Plans et tarification</h2>
          <p><strong>Plan Gratuit :</strong> Accès aux 6 tableaux de bord avec limites (50 commandes, 15 produits, 5 tickets/mois). Gratuit sans limitation de durée.</p>
          <p><strong>Plan Pro mensuel :</strong> 7 500 FCFA/mois, paiement via FedaPay (Mobile Money accepté). Données illimitées, rapport PDF, coûts &amp; bénéfices, objectifs. Résiliable à tout moment.</p>
          <p><strong>Plan Pro annuel :</strong> 75 000 FCFA/an (équivalent 6 250 FCFA/mois — 2 mois offerts).</p>

          <h2>4. Compte utilisateur</h2>
          <p>Le compte est strictement personnel et non transférable. Vous êtes responsable de la confidentialité de vos identifiants. Tout usage frauduleux doit être signalé immédiatement.</p>

          <h2>5. Responsabilité</h2>
          <p>OperaMind est un outil d'aide à la décision. Les analyses générées sont basées sur les données que vous saisissez. Emmanuel KIKI ne saurait être tenu responsable de décisions prises sur la base de ces analyses.</p>

          <h2>6. Suspension de compte</h2>
          <p>OperaMind se réserve le droit de suspendre tout compte en cas d'usage abusif, de fraude ou de violation des présentes conditions.</p>

          <h2>7. Droit applicable</h2>
          <p>Les présentes conditions sont soumises au droit de la République du Bénin.</p>

          <h2>8. Contact</h2>
          <p><strong>Emmanuel KIKI</strong><br />Cotonou, République du Bénin<br />emmanualkiki@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
