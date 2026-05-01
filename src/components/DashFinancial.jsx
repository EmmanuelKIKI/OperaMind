import { useApp } from '../AppContext.jsx';
import { BarChart, DonutChart } from './Charts.jsx';
import { KpiCard, EmptyState, PageHeader } from './Shared.jsx';
import { fmtDate } from '../storage.js';

export function FinancialDashboard() {
  const { getUD, deleteProduct, setModal, setGoal, showToast } = useApp();
  const d = getUD();

  const totalRevenu    = d.revenues.reduce((s, r) => s + (r.amount || 0), 0);
  const revs7          = d.revenues.slice(-7).map(r => r.amount || 0);
  const avg7           = revs7.length ? Math.round(revs7.reduce((s, v) => s + v, 0) / revs7.length) : 0;
  const cmdComplete    = d.orders.filter(o => o.status === 'Conclu');
  const revs30         = d.revenues.slice(-30).map(r => r.amount || 0);
  const avgJour        = revs30.length ? Math.round(revs30.reduce((s, v) => s + v, 0) / revs30.length) : 0;
  const previsionMois  = avgJour * 30;
  const goals          = d.goals;
  const currentMonth   = new Date().toISOString().slice(0, 7);
  const revsThisMonth  = d.revenues.filter(r => r.date?.startsWith(currentMonth));
  const totalThisMonth = revsThisMonth.reduce((s, r) => s + r.amount, 0);
  const targetOk       = goals?.revenueTarget > 0 && goals?.month === currentMonth;
  const goalPct        = targetOk ? Math.min(100, Math.round((totalThisMonth / goals.revenueTarget) * 100)) : 0;
  const chartData      = d.revenues.slice(-14).map((r, i) => ({ value: r.amount || 0, label: i % 3 === 0 ? (r.date?.slice(5) || '') : '' }));

  async function handleSetGoal() {
    const v = parseInt(prompt('Objectif mensuel (FCFA) :')) || 0;
    if (v > 0) await setGoal(v, currentMonth);
  }

  return (
    <div className="pgrid">
      <PageHeader
        title="Finances"
        sub="Santé financière de votre entreprise"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={handleSetGoal}>
              {targetOk ? `Objectif : ${goals.revenueTarget.toLocaleString('fr-FR')} F` : 'Définir objectif'}
            </button>
          </div>
        }
      />
      <KpiCard label="Revenus totaux"        value={`${totalRevenu.toLocaleString('fr-FR')} F`} change="Cumulé"                      up={true} />
      <KpiCard label="Moyenne / jour (7j)"   value={`${avg7.toLocaleString('fr-FR')} F`}         change="7 derniers jours"             up={avg7 > 0} />
      <KpiCard label="Commandes validées"    value={cmdComplete.length}                            change={`sur ${d.orders.length} total`} up={true} />

      {targetOk && (
        <div className="card">
          <div className="card-head"><span className="card-title">Objectif du mois</span><span className="badge b-amber">{goalPct}%</span></div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
            {totalThisMonth.toLocaleString('fr-FR')} F sur {goals.revenueTarget.toLocaleString('fr-FR')} F
          </div>
          <div className="prog-bar"><div className="prog-fill" style={{ width: `${goalPct}%`, background: goalPct >= 100 ? 'var(--green)' : 'var(--blue)' }} /></div>
        </div>
      )}

      <div className={`card ${targetOk ? '' : 'cs2'}`}>
        <div className="card-head"><span className="card-title">Revenus — 14 derniers jours</span></div>
        {d.revenues.length === 0
          ? <EmptyState msg="Ajoutez des revenus dans Opérations." />
          : <BarChart data={chartData} color="var(--blue)" height={130} />}
      </div>

      <div className="card">
        <div className="card-head"><span className="card-title">Prévision mois prochain</span></div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--blue)', margin: '12px 0', fontFamily: 'var(--mono)' }}>
          {previsionMois.toLocaleString('fr-FR')} F
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>Basé sur {revs30.length} jours d'historique · {avgJour.toLocaleString('fr-FR')} F/j en moyenne</div>
        <div style={{ marginTop: 16 }}>
          <DonutChart value={cmdComplete.length} total={d.orders.length || 1} color="var(--green)" size={80} />
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, textAlign: 'center' }}>Taux de conclusion</div>
        </div>
      </div>

      <div className="card csfull">
        <div className="card-head">
          <span className="card-title">Catalogue produits / services</span>
          <button className="btn-ghost" onClick={() => setModal('addProduct')}>+ Ajouter</button>
        </div>
        {d.products.length === 0
          ? <EmptyState msg="Aucun produit enregistré." />
          : (
            <table className="dtable" style={{ marginTop: 12 }}>
              <thead><tr><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th /></tr></thead>
              <tbody>
                {d.products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="badge b-sky">{p.category || 'Service'}</span></td>
                    <td className="mono">{(p.price || 0).toLocaleString('fr-FR')} F</td>
                    <td style={{ color: p.stock < 5 ? 'var(--red)' : 'var(--text2)' }}>{p.stock}</td>
                    <td><button className="tbl-btn tdanger" onClick={() => deleteProduct(p.id)}>Suppr.</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
