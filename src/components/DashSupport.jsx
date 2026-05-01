import { useApp } from '../AppContext.jsx';
import { KpiCard, EmptyState, PageHeader, LimitBanner } from './Shared.jsx';
import { fmtDate } from '../storage.js';

export function SupportDashboard() {
  const { getUD, addTicket, updateTicketStatus, deleteTicket, setModal, isPro } = useApp();
  const d = getUD();
  const pro = isPro();
  const tickets = d.tickets || [];
  const open   = tickets.filter(t => t.status === 'Ouvert').length;
  const inprog = tickets.filter(t => t.status === 'En cours').length;
  const solved = tickets.filter(t => t.status === 'Résolu').length;

  // Calcul limite mensuelle pour les comptes gratuits
  const thisMonth = new Date().toISOString().slice(0, 7);
  const ticketsThisMonth = tickets.filter(t => (t.date || '').startsWith(thisMonth)).length;
  const nearLimit = !pro && ticketsThisMonth >= 4;
  const atLimit   = !pro && ticketsThisMonth >= 5;

  function prioBadge(p) {
    if (p === 'Urgente' || p === 'Haute') return 'b-red';
    if (p === 'Moyenne') return 'b-amber';
    return 'b-blue';
  }

  return (
    <div className="pgrid">
      <PageHeader
        title="Support"
        sub="Gestion des incidents et demandes clients"
        action={<button className="btn-blue" onClick={() => setModal('addTicket')}>+ Nouveau ticket</button>}
      />
      <KpiCard label="Tickets ouverts"   value={open}    change="À traiter"     up={open === 0} />
      <KpiCard label="En cours"          value={inprog}  change="En traitement"  up={true} />
      <KpiCard label="Résolus"           value={solved}  change="Total fermés"   up={true} />
      {!pro && (
        <KpiCard
          label="Tickets ce mois (gratuit)"
          value={`${ticketsThisMonth} / 5`}
          change={atLimit ? 'Limite atteinte' : nearLimit ? 'Presque atteint' : 'Disponibles'}
          up={!atLimit}
          color={atLimit ? 'var(--red)' : nearLimit ? 'var(--amber)' : undefined}
        />
      )}
      {atLimit && (
        <LimitBanner type="block" text="Limite de 5 tickets/mois atteinte — Pro = tickets illimités." onUpgrade={() => setModal('upgrade')} />
      )}
      {nearLimit && !atLimit && (
        <LimitBanner type="warn" text="Plus qu'un ticket disponible ce mois. Pro = tickets illimités." onUpgrade={() => setModal('upgrade')} />
      )}

      <div className="card csfull">
        <div className="card-head">
          <span className="card-title">Tous les tickets ({tickets.length})</span>
          <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text3)' }}>
            <span>Ouverts : <strong style={{ color: 'var(--red)' }}>{open}</strong></span>
            <span>Résolus : <strong style={{ color: 'var(--green)' }}>{solved}</strong></span>
          </div>
        </div>
        {tickets.length === 0
          ? <EmptyState msg="Aucun ticket. Cliquez sur '+ Nouveau ticket' pour commencer." />
          : (
            <table className="dtable" style={{ marginTop: 12 }}>
              <thead><tr><th>Titre</th><th>Priorité</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.title}</strong>{t.description && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{t.description}</div>}</td>
                    <td><span className={`badge ${prioBadge(t.priority)}`}>{t.priority}</span></td>
                    <td>
                      <select
                        className="finput"
                        style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                        value={t.status}
                        onChange={e => updateTicketStatus(t.id, e.target.value)}
                      >
                        <option>Ouvert</option>
                        <option>En cours</option>
                        <option>Résolu</option>
                      </select>
                    </td>
                    <td>{fmtDate(t.date)}</td>
                    <td><button className="tbl-btn tdanger" onClick={() => deleteTicket(t.id)}>Suppr.</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
