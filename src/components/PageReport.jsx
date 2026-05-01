import { useApp } from '../AppContext.jsx';
import { ProGate, PageHeader } from './Shared.jsx';
import { MOIS } from '../storage.js';

export function ReportPage() {
  const { getUD, isPro, activeUser } = useApp();
  if (!isPro()) return (
    <div className="pgrid">
      <div className="csfull">
        <ProGate title="Rapport PDF mensuel" sub="Générez un rapport complet de votre activité à partager avec vos associés ou votre banque. Disponible avec le plan Pro." />
      </div>
    </div>
  );

  const d    = getUD();
  const now  = new Date();
  const mois = MOIS[now.getMonth()];
  const an   = now.getFullYear();
  const key  = now.toISOString().slice(0, 7);

  const revsMonth  = d.revenues.filter(r => r.date?.startsWith(key));
  const caMonth    = revsMonth.reduce((s, r) => s + r.amount, 0);
  const cmdMonth   = d.orders.filter(o => o.date?.startsWith(key));
  const conclues   = cmdMonth.filter(o => o.status === 'Conclu');
  const totalCosts = (d.costs || []).reduce((s, c) => s + c.amount, 0);
  const benefice   = caMonth - totalCosts;
  const marge      = caMonth > 0 ? Math.round((benefice / caMonth) * 100) : 0;
  const txConv     = cmdMonth.length > 0 ? Math.round((conclues.length / cmdMonth.length) * 100) : 0;

  // Meilleur produit ce mois
  const prodMap = {};
  conclues.forEach(o => { if (o.product) prodMap[o.product] = (prodMap[o.product] || 0) + (o.amount || 0); });
  const topProd = Object.entries(prodMap).sort((a, b) => b[1] - a[1])[0];

  function print() { window.print(); }

  return (
    <div className="pgrid">
      <PageHeader
        title={`Rapport — ${mois} ${an}`}
        sub="Résumé complet de votre activité mensuelle"
        action={
          <button className="btn-blue" onClick={print}>
            <PrintIcon /> Imprimer / Exporter PDF
          </button>
        }
      />

      <div className="card csfull report-print" id="report-content">
        {/* En-tête rapport */}
        <div className="report-header">
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>OperaMind</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>Rapport mensuel — {mois} {an}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>{activeUser?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{activeUser?.email}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Généré le {new Date().toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        <div className="report-divider" />

        {/* KPIs */}
        <div className="report-section-title">Performance du mois</div>
        <div className="report-kpis">
          <ReportKpi label="Chiffre d'affaires" value={`${caMonth.toLocaleString('fr-FR')} FCFA`} main />
          <ReportKpi label="Coûts enregistrés" value={`${totalCosts.toLocaleString('fr-FR')} FCFA`} />
          <ReportKpi label="Bénéfice net" value={`${benefice.toLocaleString('fr-FR')} FCFA`} color={benefice >= 0 ? 'var(--green)' : 'var(--red)'} />
          <ReportKpi label="Marge brute" value={`${marge}%`} color={marge >= 30 ? 'var(--green)' : 'var(--amber)'} />
          <ReportKpi label="Commandes ce mois" value={cmdMonth.length} />
          <ReportKpi label="Deals conclus" value={conclues.length} />
          <ReportKpi label="Taux de conversion" value={`${txConv}%`} />
          <ReportKpi label="Meilleur produit" value={topProd ? topProd[0] : '—'} />
        </div>

        <div className="report-divider" />

        {/* Commandes conclues */}
        <div className="report-section-title">Deals conclus ce mois</div>
        {conclues.length === 0
          ? <div style={{ color: 'var(--text3)', fontSize: 13, margin: '8px 0 16px' }}>Aucun deal conclu ce mois.</div>
          : (
            <table className="dtable" style={{ marginBottom: 20 }}>
              <thead><tr><th>Client</th><th>Produit</th><th>Montant</th></tr></thead>
              <tbody>
                {conclues.map(o => (
                  <tr key={o.id}>
                    <td><strong>{o.name}</strong></td>
                    <td style={{ color: 'var(--text3)' }}>{o.product || '—'}</td>
                    <td className="mono">{(o.amount || 0).toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}><strong>Total</strong></td>
                  <td className="mono"><strong>{conclues.reduce((s, o) => s + (o.amount || 0), 0).toLocaleString('fr-FR')} FCFA</strong></td>
                </tr>
              </tbody>
            </table>
          )}

        {/* Tickets */}
        <div className="report-divider" />
        <div className="report-section-title">Incidents signalés</div>
        {(d.tickets || []).length === 0
          ? <div style={{ color: 'var(--text3)', fontSize: 13, margin: '8px 0 16px' }}>Aucun ticket enregistré.</div>
          : (
            <table className="dtable" style={{ marginBottom: 20 }}>
              <thead><tr><th>Titre</th><th>Priorité</th><th>Statut</th></tr></thead>
              <tbody>
                {d.tickets.map(t => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td><span className={`badge ${t.priority === 'Haute' || t.priority === 'Urgente' ? 'b-red' : t.priority === 'Moyenne' ? 'b-amber' : 'b-blue'}`}>{t.priority}</span></td>
                    <td><span className={`badge ${t.status === 'Résolu' ? 'b-green' : t.status === 'En cours' ? 'b-amber' : 'b-red'}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        {/* Pied de rapport */}
        <div className="report-divider" />
        <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', paddingTop: 8 }}>
          Ce rapport est généré automatiquement par OperaMind — Développé par Emmanuel KIKI, Cotonou, Bénin
        </div>
      </div>
    </div>
  );
}

function ReportKpi({ label, value, main, color }) {
  return (
    <div className="report-kpi">
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: main ? 20 : 16, fontWeight: 800, color: color || 'var(--text)', fontFamily: 'var(--mono)' }}>{value}</div>
    </div>
  );
}

function PrintIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}>
      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  );
}
