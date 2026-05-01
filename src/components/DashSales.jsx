import { useApp } from '../AppContext.jsx';
import { BarChart, DonutChart } from './Charts.jsx';
import { KpiCard, EmptyState, PageHeader, LimitBanner } from './Shared.jsx';
import { fmtDate } from '../storage.js';

const STAGES = ['Prospect', 'Devis envoyé', 'Négociation', 'Conclu', 'Annulé'];
const STAGE_COLORS = {
  'Prospect':     'var(--blue)',
  'Devis envoyé': 'var(--amber)',
  'Négociation':  '#7c3aed',
  'Conclu':       'var(--green)',
  'Annulé':       'var(--red)',
};

export function SalesDashboard() {
  const { getUD, isPro, setModal, patchUD } = useApp();
  const d = getUD();

  // Métriques calculées
  const conclues   = d.orders.filter(o => o.stage === 'Conclu');
  const pipeline   = d.orders.filter(o => !['Conclu', 'Annulé'].includes(o.stage));
  const annulées   = d.orders.filter(o => o.stage === 'Annulé');
  const caConclus  = conclues.reduce((s, o) => s + (o.amount || 0), 0);
  const valPipeline= pipeline.reduce((s, o) => s + (o.amount || 0), 0);
  const txConv     = d.orders.length > 0 ? Math.round((conclues.length / d.orders.length) * 100) : 0;

  // Graphique valeur par stage
  const stageValues = STAGES.map(s => ({
    value: d.orders.filter(o => o.stage === s).reduce((sum, o) => sum + (o.amount || 0), 0),
    label: s.slice(0, 5),
  }));

  function moveStage(id, stage) {
    patchUD({
      orders: d.orders.map(o => o.id === id
        ? { ...o, stage, status: stage === 'Conclu' ? 'Conclu' : stage === 'Annulé' ? 'Annulé' : 'En cours' }
        : o
      ),
    });
  }

  function deleteOrder(id) {
    patchUD({ orders: d.orders.filter(o => o.id !== id) });
  }

  return (
    <div className="pgrid">
      <PageHeader
        title="Ventes"
        sub="Pipeline commercial et suivi des deals"
        action={<button className="btn-blue" onClick={() => setModal('addOrder')}>+ Nouvelle commande</button>}
      />
      {atOrders && (
        <LimitBanner type="block" text="Limite de 50 commandes atteinte — Pro = illimité." onUpgrade={() => setModal('upgrade')} />
      )}
      {nearOrders && !atOrders && (
        <LimitBanner type="warn" text={`Plus que ${50 - d.orders.length} commande(s) disponible(s). Passez à Pro pour continuer.`} onUpgrade={() => setModal('upgrade')} />
      )}
      <KpiCard label="CA Conclus" value={`${caConclus.toLocaleString('fr-FR')} F`} change={`${conclues.length} deals`} up={conclues.length > 0} />
      <KpiCard label="Pipeline actif" value={`${valPipeline.toLocaleString('fr-FR')} F`} change={`${pipeline.length} en cours`} up={pipeline.length > 0} />
      <KpiCard label="Taux de conversion" value={`${txConv}%`} change={`${annulées.length} annulés`} up={txConv >= 50} />

      {/* Graphique par étape */}
      <div className="card cs2">
        <div className="card-head">
          <span className="card-title">Valeur par étape pipeline</span>
        </div>
        {d.orders.length === 0
          ? <EmptyState msg="Aucune commande dans le pipeline." />
          : <BarChart data={stageValues} color="var(--blue)" height={120} />
        }
      </div>

      {/* Donut répartition */}
      <div className="card">
        <div className="card-head"><span className="card-title">Répartition</span></div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <DonutChart value={conclues.length} total={Math.max(d.orders.length, 1)} color="var(--green)" size={100} />
        </div>
        <div style={{ marginTop: 10 }}>
          {STAGES.slice(0, 3).map(s => {
            const cnt = d.orders.filter(o => o.stage === s).length;
            return (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: STAGE_COLORS[s], display: 'inline-block' }} />
                  {s}
                </span>
                <strong>{cnt}</strong>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban pipeline */}
      <div className="card csfull">
        <div className="card-head">
          <span className="card-title">Kanban — Pipeline commercial</span>
          <button className="btn-ghost" onClick={() => setModal('addOrder')}>+ Ajouter</button>
        </div>
        {d.orders.length === 0
          ? <EmptyState msg="Aucun deal dans le pipeline. Créez votre première commande." />
          : (
            <div className="kanban-board">
              {STAGES.filter(s => s !== 'Annulé').map(stage => {
                const items = d.orders.filter(o => o.stage === stage);
                return (
                  <div key={stage} className="kanban-col">
                    <div className="kanban-head" style={{ borderTop: `3px solid ${STAGE_COLORS[stage]}` }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: STAGE_COLORS[stage] }}>{stage}</span>
                      <span className="count-badge" style={{ background: STAGE_COLORS[stage] + '22', color: STAGE_COLORS[stage] }}>{items.length}</span>
                    </div>
                    {items.length === 0
                      ? <div style={{ fontSize: 12, color: 'var(--text3)', padding: '12px 0', textAlign: 'center' }}>Vide</div>
                      : items.map(o => (
                        <div key={o.id} className="kanban-card">
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{o.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{o.product || '—'}</div>
                          <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: STAGE_COLORS[stage], marginBottom: 8 }}>
                            {(o.amount || 0).toLocaleString('fr-FR')} F
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{fmtDate(o.date)}</div>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {STAGES.filter(s => s !== stage).map(s => (
                              <button key={s} className="tbl-btn" style={{ fontSize: 10 }} onClick={() => moveStage(o.id, s)}>
                                → {s}
                              </button>
                            ))}
                            <button className="tbl-btn tdanger" style={{ fontSize: 10 }} onClick={() => deleteOrder(o.id)}>Suppr.</button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                );
              })}
            </div>
          )
        }
      </div>
    </div>
  );
}
