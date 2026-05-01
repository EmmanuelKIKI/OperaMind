import { useApp } from '../AppContext.jsx';
import { LineChart, DonutChart } from './Charts.jsx';
import { KpiCard, EmptyState, PageHeader } from './Shared.jsx';
import { MOIS } from '../storage.js';

export function ExecutiveDashboard() {
  const { getUD } = useApp();
  const d = getUD();

  const now       = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1).toISOString().slice(0, 7);

  const totalRevenu  = d.revenues.reduce((s, r) => s + (r.amount || 0), 0);
  const revsThis     = d.revenues.filter(r => r.date?.startsWith(thisMonth));
  const revsLast     = d.revenues.filter(r => r.date?.startsWith(lastMonth));
  const caThis       = revsThis.reduce((s, r) => s + r.amount, 0);
  const caLast       = revsLast.reduce((s, r) => s + r.amount, 0);
  const croissance   = caLast > 0 ? Math.round(((caThis - caLast) / caLast) * 100) : 0;

  const nbOrders   = d.orders.length;
  const conclues   = d.orders.filter(o => o.status === 'Conclu').length;
  const txConv     = nbOrders > 0 ? Math.round((conclues / nbOrders) * 100) : 0;

  // Valeur pipeline
  const valPipeline = d.orders
    .filter(o => !['Conclu','Annulé'].includes(o.status))
    .reduce((s, o) => s + (o.amount || 0), 0);

  // Meilleur mois historique
  const monthMap = {};
  d.revenues.forEach(r => {
    if (!r.date) return;
    const m = r.date.slice(0, 7);
    monthMap[m] = (monthMap[m] || 0) + r.amount;
  });
  const bestMonth = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0];

  // Graphique 6 mois
  const chart6 = buildChart6(d.revenues, now);

  // Répartition statuts commandes
  const stages = ['Prospect','Devis envoyé','Négociation','Conclu','Annulé'];
  const stageCounts = stages.map(s => d.orders.filter(o => o.stage === s).length);

  // Tickets ouverts
  const ticketsOuverts = (d.tickets || []).filter(t => t.status === 'Ouvert').length;

  return (
    <div className="pgrid">
      <PageHeader title="Tableau Exécutif" sub="Vue synthèse — calculée depuis toutes vos données" />

      <KpiCard label="Revenus totaux cumulés" value={`${totalRevenu.toLocaleString('fr-FR')} F`} change="Toutes périodes" up={true} />
      <KpiCard label="CA ce mois" value={`${caThis.toLocaleString('fr-FR')} F`} change={`${croissance >= 0 ? '+' : ''}${croissance}% vs mois dernier`} up={croissance >= 0} />
      <KpiCard label="Taux de conversion" value={`${txConv}%`} change={`${conclues} deals conclus`} up={txConv >= 50} />
      <KpiCard label="Valeur pipeline" value={`${valPipeline.toLocaleString('fr-FR')} F`} change="En cours de négociation" up={valPipeline > 0} />

      {/* Graphique évolution */}
      <div className="card cs3">
        <div className="card-head">
          <span className="card-title">Évolution du chiffre d'affaires (6 mois)</span>
          <span className={`badge ${croissance >= 0 ? 'b-green' : 'b-red'}`}>
            {croissance >= 0 ? '+' : ''}{croissance}%
          </span>
        </div>
        {chart6.every(c => c.value === 0)
          ? <EmptyState msg="Ajoutez des revenus pour voir l'évolution mensuelle." />
          : <LineChart data={chart6} color="var(--blue)" height={140} />
        }
      </div>

      {/* Objectif */}
      <div className="card">
        <div className="card-head"><span className="card-title">Objectif mensuel</span></div>
        {d.goals?.revenueTarget > 0
          ? (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <DonutChart
                value={caThis}
                total={d.goals.revenueTarget}
                color={caThis >= d.goals.revenueTarget ? 'var(--green)' : 'var(--blue)'}
                size={100}
              />
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>
                {caThis.toLocaleString('fr-FR')} F / {d.goals.revenueTarget.toLocaleString('fr-FR')} F
              </div>
            </div>
          )
          : <EmptyState msg="Aucun objectif défini. Ajoutez-en un dans Finances." />
        }
      </div>

      {/* Résumé pipeline */}
      <div className="card cs2">
        <div className="card-head"><span className="card-title">Pipeline commercial</span></div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {stages.map((s, i) => (
            <div key={s} className="exec-stage">
              <div style={{ fontSize: 22, fontWeight: 800, color: stageColor(s), fontFamily: 'var(--mono)' }}>{stageCounts[i]}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Points clés */}
      <div className="card csfull">
        <div className="card-head"><span className="card-title">Points clés</span></div>
        <div className="exec-kpis">
          <ExecKpi label="Meilleur mois" value={bestMonth ? `${MOIS[parseInt(bestMonth[0].slice(5)) - 1]} — ${bestMonth[1].toLocaleString('fr-FR')} F` : '—'} />
          <ExecKpi label="Nb produits catalogue" value={d.products.length} />
          <ExecKpi label="Tickets ouverts" value={ticketsOuverts} warn={ticketsOuverts > 3} />
          <ExecKpi label="Commandes actives" value={d.orders.filter(o => o.status === 'En cours').length} />
          <ExecKpi label="Revenu moyen / jour (30j)" value={`${Math.round(d.revenues.slice(-30).reduce((s, r) => s + r.amount, 0) / 30).toLocaleString('fr-FR')} F`} />
          <ExecKpi label="Coûts enregistrés" value={`${(d.costs || []).reduce((s, c) => s + c.amount, 0).toLocaleString('fr-FR')} F`} />
        </div>
      </div>
    </div>
  );
}

function buildChart6(revenues, now) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = d.toISOString().slice(0, 7);
    return {
      value: revenues.filter(r => r.date?.startsWith(key)).reduce((s, r) => s + r.amount, 0),
      label: MOIS[d.getMonth()],
    };
  });
}

function stageColor(s) {
  if (s === 'Conclu') return 'var(--green)';
  if (s === 'Annulé') return 'var(--red)';
  return 'var(--blue)';
}

function ExecKpi({ label, value, warn }) {
  return (
    <div className="exec-kpi-item">
      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: warn ? 'var(--amber)' : 'var(--text)', fontFamily: 'var(--mono)', marginTop: 4 }}>{value}</div>
    </div>
  );
}
