import { useApp } from '../AppContext.jsx';
import { BarChart, DonutChart } from './Charts.jsx';
import { KpiCard, EmptyState, PageHeader, ProGate } from './Shared.jsx';
import { fmtDate } from '../storage.js';

export function CostsBenefits() {
  const { getUD, addCost, deleteCost, isPro, setModal } = useApp();
  const pro = isPro();

  if (!pro) return (
    <div className="pgrid">
      <div className="csfull">
        <ProGate
          title="Coûts & Bénéfices — Plan Pro"
          sub="Analysez vos marges, coûts fixes et variables, et calculez votre bénéfice net. Disponible avec le plan Pro."
        />
      </div>
    </div>
  );

  const d           = getUD();
  const costs       = d.costs || [];
  const totalRevenu = d.revenues.reduce((s, r) => s + (r.amount || 0), 0);
  const totalCosts  = costs.reduce((s, c) => s + (c.amount || 0), 0);
  const benefice    = totalRevenu - totalCosts;
  const marge       = totalRevenu > 0 ? Math.round((benefice / totalRevenu) * 100) : 0;

  const fixe     = costs.filter(c => c.type === 'Fixe').reduce((s, c) => s + c.amount, 0);
  const variable = costs.filter(c => c.type === 'Variable').reduce((s, c) => s + c.amount, 0);
  const excep    = costs.filter(c => c.type === 'Exceptionnel').reduce((s, c) => s + c.amount, 0);

  const costChart = [
    { value: fixe,     label: 'Fixe' },
    { value: variable, label: 'Var.' },
    { value: excep,    label: 'Excep.' },
  ];

  return (
    <div className="pgrid">
      <PageHeader
        title="Coûts & Bénéfices"
        sub="Analysez vos marges et votre rentabilité"
        action={<button className="btn-blue" onClick={() => setModal('addCost')}>+ Ajouter coût</button>}
      />
      <KpiCard label="Revenus totaux" value={`${totalRevenu.toLocaleString('fr-FR')} F`} change="Cumulé"    up={true} />
      <KpiCard label="Coûts totaux"   value={`${totalCosts.toLocaleString('fr-FR')} F`}  change="Enregistrés" up={false} color="var(--red)" />
      <KpiCard label="Bénéfice net"   value={`${benefice.toLocaleString('fr-FR')} F`}    change={`Marge ${marge}%`} up={benefice >= 0} color={benefice >= 0 ? 'var(--green)' : 'var(--red)'} />

      <div className="card cs2">
        <div className="card-head"><span className="card-title">Répartition des coûts</span></div>
        {costs.length < 2
          ? <EmptyState msg="Ajoutez au moins 2 coûts pour voir la répartition." />
          : <BarChart data={costChart} color="var(--red)" height={120} />}
      </div>

      <div className="card">
        <div className="card-head"><span className="card-title">Rentabilité</span></div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <DonutChart value={Math.max(0, benefice)} total={Math.max(1, totalRevenu)} color={marge >= 0 ? 'var(--green)' : 'var(--red)'} size={90} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>Bénéfice / Revenu total</div>
        <div style={{ marginTop: 12 }}>
          {[['Charges fixes', fixe, 'var(--amber)'], ['Charges variables', variable, 'var(--blue)'], ['Charges except.', excep, 'var(--red)']].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>{l}</span>
              <span style={{ fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>{v.toLocaleString('fr-FR')} F</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card csfull">
        <div className="card-head"><span className="card-title">Détail des coûts ({costs.length})</span></div>
        {costs.length === 0
          ? <EmptyState msg="Aucun coût enregistré." />
          : (
            <table className="dtable" style={{ marginTop: 12 }}>
              <thead><tr><th>Intitulé</th><th>Type</th><th>Montant</th><th>Date</th><th /></tr></thead>
              <tbody>
                {costs.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td><span className={`badge ${c.type === 'Fixe' ? 'b-blue' : c.type === 'Variable' ? 'b-amber' : 'b-red'}`}>{c.type}</span></td>
                    <td className="mono" style={{ color: 'var(--red)' }}>{(c.amount || 0).toLocaleString('fr-FR')} F</td>
                    <td>{fmtDate(c.date)}</td>
                    <td><button className="tbl-btn tdanger" onClick={() => deleteCost(c.id)}>Suppr.</button></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}><strong>Total</strong></td>
                  <td className="mono" style={{ color: 'var(--red)' }}><strong>{totalCosts.toLocaleString('fr-FR')} F</strong></td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
