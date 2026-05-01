import { useApp } from '../AppContext.jsx';
import { LineChart } from './Charts.jsx';
import { KpiCard, LimitBar, EmptyState, PageHeader, LimitBanner } from './Shared.jsx';
import { fmtDate } from '../storage.js';

export function OperationsDashboard() {
  const { getUD, addOrder, deleteOrder, addRevenue, isPro, setModal, showToast } = useApp();
  const d = getUD();
  const pro = isPro();

  // Calcul limites freemium
  const orderLimit   = 50;
  const productLimit = 15;
  const nearOrders   = !pro && nbCommandes >= orderLimit - 5;
  const atOrders     = !pro && nbCommandes >= orderLimit;
  const nearProducts = !pro && d.products.length >= productLimit - 2;
  const atProducts   = !pro && d.products.length >= productLimit;

  const totalRevenu  = d.revenues.reduce((s, r) => s + (r.amount || 0), 0);
  const nbCommandes  = d.orders.length;
  const cmdComplete  = d.orders.filter(o => o.status === 'Conclu').length;
  const txCompletion = nbCommandes > 0 ? Math.round((cmdComplete / nbCommandes) * 100) : 0;

  const revChart = buildRevChart(d.revenues);
  const alerts   = buildAlerts(d);

  async function handleAddRevenu(e) {
    e.preventDefault();
    const v = parseInt(e.target.rev.value) || 0;
    if (v <= 0) { showToast('Montant invalide', 'err'); return; }
    await addRevenue(v);
    e.target.reset();
  }

  return (
    <div className="pgrid">
      <PageHeader
        title="Opérations"
        sub="Suivez l'activité opérationnelle de votre entreprise"
        action={<button className="btn-blue" onClick={() => setModal('addOrder')}>+ Nouvelle commande</button>}
      />
      {atOrders && (
        <LimitBanner type="block" text="Limite de 50 commandes atteinte — Pro = illimité." onUpgrade={() => setModal('upgrade')} />
      )}
      {nearOrders && !atOrders && (
        <LimitBanner type="warn" text={`Plus que ${orderLimit - nbCommandes} commande(s) disponible(s) sur votre plan gratuit.`} onUpgrade={() => setModal('upgrade')} />
      )}
      {atProducts && (
        <LimitBanner type="block" text="Limite de 15 produits atteinte — Pro = illimité." onUpgrade={() => setModal('upgrade')} />
      )}
      {nearProducts && !atProducts && (
        <LimitBanner type="warn" text={`Plus que ${productLimit - d.products.length} produit(s) disponible(s) sur votre plan gratuit.`} onUpgrade={() => setModal('upgrade')} />
      )}
      <KpiCard label="Revenus totaux"      value={`${totalRevenu.toLocaleString('fr-FR')} F`} change="Cumulé"             up={true} />
      <KpiCard label="Commandes"           value={nbCommandes}                                  change={`${cmdComplete} conclues`} up={true} />
      <KpiCard label="Taux de complétion" value={`${txCompletion}%`}                           change={txCompletion >= 70 ? 'Bon rythme' : 'À améliorer'} up={txCompletion >= 70} />

      <div className="card cs2">
        <div className="card-head">
          <span className="card-title">Revenus — 30 derniers jours</span>
          <span className="badge b-blue">{d.revenues.length} entrées</span>
        </div>
        <LineChart data={revChart} color="var(--blue)" height={130} />
        <form onSubmit={handleAddRevenu} style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="flabel">Ajouter revenu du jour (FCFA)</label>
            <input name="rev" className="finput" type="number" placeholder="Ex: 45 000" style={{ marginTop: 4 }} />
          </div>
          <button type="submit" className="btn-blue" style={{ height: 40, paddingTop: 0, paddingBottom: 0 }}>Ajouter</button>
        </form>
      </div>

      <div className="card">
        <div className="card-head"><span className="card-title">Usage du plan</span></div>
        <LimitBar label="Commandes" current={nbCommandes} max={50} />
        <LimitBar label="Produits"  current={d.products.length} max={15} />
        <LimitBar label="Tickets ce mois" current={(() => {
          const m = new Date().toISOString().slice(0, 7);
          return d.tickets.filter(t => (t.date || '').startsWith(m)).length;
        })()} max={5} />
        {!pro && (
          <button className="btn-amber" style={{ width: '100%', marginTop: 14, fontSize: 12 }}
            onClick={() => setModal('upgrade')}>Passer à Pro — dès 7 499 FCFA / mois</button>
        )}
        {alerts.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div className="card-title" style={{ marginBottom: 8 }}>Alertes</div>
            {alerts.map((a, i) => (
              <div key={i} className="alert-row">
                <span className={`alert-dot ${a.type}`} />
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{a.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card csfull">
        <div className="card-head">
          <span className="card-title">Commandes récentes</span>
          <button className="btn-ghost" onClick={() => setModal('addOrder')}>+ Ajouter</button>
        </div>
        {d.orders.length === 0
          ? <EmptyState msg="Aucune commande. Commencez par en ajouter une." />
          : (
            <table className="dtable" style={{ marginTop: 12 }}>
              <thead><tr><th>Client / Commande</th><th>Produit</th><th>Montant</th><th>Statut</th><th>Date</th><th /></tr></thead>
              <tbody>
                {d.orders.slice(0, 10).map(o => (
                  <tr key={o.id}>
                    <td><strong>{o.name}</strong></td>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{o.product || '—'}</td>
                    <td className="mono">{(o.amount || 0).toLocaleString('fr-FR')} F</td>
                    <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                    <td>{fmtDate(o.date)}</td>
                    <td><button className="tbl-btn tdanger" onClick={() => deleteOrder(o.id)}>Suppr.</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

function buildRevChart(revenues) {
  const last = revenues.slice(-14);
  if (!last.length) return Array(7).fill({ value: 0, label: '' });
  return last.map((r, i) => ({ value: r.amount || 0, label: i % 3 === 0 ? (r.date ? r.date.slice(5) : '') : '' }));
}

function buildAlerts(d) {
  const alerts = [];
  const revs = d.revenues.slice(-3).map(r => r.amount || 0);
  if (revs.length === 3 && revs[0] > revs[1] && revs[1] > revs[2])
    alerts.push({ type: 'warn', msg: 'Revenus en baisse 3 jours consécutifs' });
  const pending = d.orders.filter(o => o.status === 'En cours').length;
  if (pending >= 5) alerts.push({ type: 'info', msg: `${pending} commandes en attente` });
  const stockBas = d.products.filter(p => p.stock < 5);
  if (stockBas.length) alerts.push({ type: 'warn', msg: `Stock bas : ${stockBas.map(p => p.name).join(', ')}` });
  return alerts;
}

function statusBadge(s) {
  if (s === 'Conclu') return 'b-green';
  if (s === 'Annulé') return 'b-red';
  return 'b-amber';
}
