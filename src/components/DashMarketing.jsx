import { useApp } from '../AppContext.jsx';
import { LineChart, BarChart } from './Charts.jsx';
import { KpiCard, EmptyState, PageHeader } from './Shared.jsx';
import { MOIS } from '../storage.js';

export function MarketingDashboard() {
  const { getUD } = useApp();
  const d = getUD();

  // Tout calculé depuis les données réelles
  const now         = new Date();
  const thisMonth   = now.toISOString().slice(0, 7);
  const lastMonth   = new Date(now.getFullYear(), now.getMonth() - 1).toISOString().slice(0, 7);

  const revsThisMonth = d.revenues.filter(r => r.date?.startsWith(thisMonth));
  const revsLastMonth = d.revenues.filter(r => r.date?.startsWith(lastMonth));
  const totalThisMonth = revsThisMonth.reduce((s, r) => s + r.amount, 0);
  const totalLastMonth = revsLastMonth.reduce((s, r) => s + r.amount, 0);
  const growth = totalLastMonth > 0 ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100) : 0;

  // Nouveaux clients ce mois vs mois dernier
  const cmdThisMonth = d.orders.filter(o => o.date?.startsWith(thisMonth));
  const cmdLastMonth = d.orders.filter(o => o.date?.startsWith(lastMonth));
  const newClientsThis = new Set(cmdThisMonth.map(o => o.name)).size;
  const newClientsLast = new Set(cmdLastMonth.map(o => o.name)).size;
  const clientGrowth = newClientsLast > 0 ? Math.round(((newClientsThis - newClientsLast) / newClientsLast) * 100) : 0;

  // Meilleur produit
  const prodCounts = {};
  d.orders.filter(o => o.status === 'Conclu').forEach(o => {
    if (o.product) prodCounts[o.product] = (prodCounts[o.product] || 0) + o.amount;
  });
  const topProduct = Object.entries(prodCounts).sort((a, b) => b[1] - a[1])[0];

  // Meilleur jour de la semaine
  const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const dayTotals = Array(7).fill(0);
  d.revenues.forEach(r => {
    if (r.date) {
      const day = new Date(r.date).getDay();
      dayTotals[day] += r.amount || 0;
    }
  });
  const bestDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
  const bestDay = d.revenues.length > 0 ? JOURS[bestDayIdx] : '—';

  // Graphique mensuel sur 6 mois
  const monthChart = buildMonthChart(d.revenues, now);

  // Graphique par jour de semaine
  const dayChart = JOURS.slice(1).concat(JOURS[0]).map((j, i) => ({
    value: dayTotals[(i + 1) % 7],
    label: j.slice(0, 3),
  }));

  // Taux de conversion pipeline
  const totalOrders = d.orders.length;
  const conclues    = d.orders.filter(o => o.status === 'Conclu').length;
  const txConv      = totalOrders > 0 ? Math.round((conclues / totalOrders) * 100) : 0;

  return (
    <div className="pgrid">
      <PageHeader title="Marketing" sub="Analyse de vos performances — calculée depuis vos données réelles" />

      <KpiCard label="Revenus ce mois" value={`${totalThisMonth.toLocaleString('fr-FR')} F`}
        change={`${growth >= 0 ? '+' : ''}${growth}% vs mois dernier`} up={growth >= 0} />
      <KpiCard label="Nouveaux clients" value={newClientsThis}
        change={`${clientGrowth >= 0 ? '+' : ''}${clientGrowth}% vs mois dernier`} up={clientGrowth >= 0} />
      <KpiCard label="Taux de conversion" value={`${txConv}%`}
        change={`${conclues} sur ${totalOrders} commandes`} up={txConv >= 50} />

      {/* Évolution mensuelle */}
      <div className="card cs2">
        <div className="card-head">
          <span className="card-title">Revenus sur 6 mois</span>
          <span className="badge b-green">Tendance</span>
        </div>
        {monthChart.length < 2
          ? <EmptyState msg="Ajoutez des revenus sur plusieurs mois pour voir la tendance." />
          : <LineChart data={monthChart} color="var(--green)" height={130} />
        }
      </div>

      {/* Stats clés */}
      <div className="card">
        <div className="card-head"><span className="card-title">Points clés</span></div>
        <div style={{ marginTop: 12 }}>
          <StatRow label="Meilleur jour" value={bestDay} color="var(--blue)" />
          <StatRow label="Meilleur produit" value={topProduct ? topProduct[0] : '—'} color="var(--green)" />
          <StatRow label="CA top produit" value={topProduct ? `${topProduct[1].toLocaleString('fr-FR')} F` : '—'} color="var(--green)" />
          <StatRow label="Commandes ce mois" value={cmdThisMonth.length} color="var(--blue)" />
          <StatRow label="CA mois précédent" value={`${totalLastMonth.toLocaleString('fr-FR')} F`} color="var(--text2)" />
        </div>
      </div>

      {/* Revenus par jour de semaine */}
      <div className="card csfull">
        <div className="card-head">
          <span className="card-title">Revenus par jour de la semaine</span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Identifiez vos jours les plus performants</span>
        </div>
        {d.revenues.length < 7
          ? <EmptyState msg="Ajoutez au moins 7 jours de revenus pour voir cette analyse." />
          : <BarChart data={dayChart} color="var(--green)" height={130} />
        }
      </div>
    </div>
  );
}

function buildMonthChart(revenues, now) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const total = revenues.filter(r => r.date?.startsWith(key)).reduce((s, r) => s + r.amount, 0);
    months.push({ value: total, label: MOIS[d.getMonth()] });
  }
  return months;
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: color || 'var(--text)', fontFamily: 'var(--mono)' }}>{value}</span>
    </div>
  );
}
