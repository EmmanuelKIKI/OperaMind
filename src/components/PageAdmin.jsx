import { useEffect } from 'react';
import { useApp } from '../AppContext.jsx';
import { PageHeader } from './Shared.jsx';
import { fmtDate } from '../storage.js';

export function AdminPanel() {
  const {
    isAdmin, allProfiles, loadAllProfiles,
    adminTogglePlan, adminToggleBlock, adminDeleteUser,
    startImpersonate, showToast,
  } = useApp();

  useEffect(() => { if (isAdmin) loadAllProfiles(); }, [isAdmin]);

  if (!isAdmin) return (
    <div className="pgrid">
      <div className="csfull" style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" style={{ display: 'inline' }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 12 }}>Accès refusé</div>
        <div style={{ marginTop: 8, fontSize: 13 }}>Cette page est réservée à l'administrateur.</div>
      </div>
    </div>
  );

  const totalUsers = allProfiles.length;
  const proUsers   = allProfiles.filter(u => u.plan === 'pro').length;
  const freeUsers  = totalUsers - proUsers;
  const mrr        = proUsers * 7500;
  const blocked    = allProfiles.filter(u => u.status === 'blocked').length;

  async function handleDelete(u) {
    if (!window.confirm(`Supprimer définitivement ${u.name} ? Cette action est irréversible.`)) return;
    await adminDeleteUser(u.id);
  }

  // ✅ CORRIGÉ : Le bouton Email ne prétend plus "simuler" un envoi réel.
  // Il affiche une action claire à faire (contact direct).
  function handleEmail(u) {
    window.open(`mailto:${u.email}`, '_blank');
  }

  return (
    <div className="pgrid">
      <PageHeader title="Administration" sub="Gestion des utilisateurs et métriques plateforme — Développé par Emmanuel KIKI" />

      <div className="card kpi" style={{ borderTop: '3px solid var(--blue)' }}>
        <span className="kpi-lbl">Utilisateurs total</span>
        <span className="kpi-val">{totalUsers}</span>
      </div>
      <div className="card kpi" style={{ borderTop: '3px solid var(--amber)' }}>
        <span className="kpi-lbl">Comptes Pro</span>
        <span className="kpi-val" style={{ color: 'var(--amber)' }}>{proUsers}</span>
      </div>
      <div className="card kpi" style={{ borderTop: '3px solid var(--green)' }}>
        <span className="kpi-lbl">MRR estimé</span>
        <span className="kpi-val" style={{ color: 'var(--green)', fontSize: 18 }}>{mrr.toLocaleString('fr-FR')} F</span>
      </div>

      <div className="card csfull">
        <div className="card-head">
          <span className="card-title">Vue d'ensemble</span>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
            <span>Gratuit : <strong>{freeUsers}</strong></span>
            <span>Pro : <strong>{proUsers}</strong></span>
            <span>Suspendus : <strong style={{ color: 'var(--red)' }}>{blocked}</strong></span>
          </div>
        </div>
        <div style={{ marginTop: 16, marginBottom: 4, fontSize: 12, color: 'var(--text2)' }}>
          Taux conversion Free → Pro : <strong>{totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0}%</strong>
        </div>
        <div className="prog-bar">
          <div className="prog-fill" style={{ width: `${totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0}%`, background: 'var(--amber)' }} />
        </div>
      </div>

      <div className="card csfull">
        <div className="card-head">
          <span className="card-title">Utilisateurs ({totalUsers})</span>
          <button className="btn-ghost" onClick={loadAllProfiles}>Actualiser</button>
        </div>
        {allProfiles.length === 0
          ? <div style={{ color: 'var(--text3)', fontSize: 13, padding: '20px 0' }}>Aucun utilisateur enregistré.</div>
          : (
            <table className="dtable" style={{ marginTop: 14 }}>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Statut</th>
                  <th>Inscrit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map(u => (
                  <tr key={u.id} style={{ opacity: u.status === 'blocked' ? 0.55 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="admin-av">{u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                        <div>
                          <strong>{u.name}</strong>
                          {u.is_admin && <span className="badge b-red" style={{ marginLeft: 6, fontSize: 10 }}>ADMIN</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.plan === 'pro' ? 'b-amber' : 'b-blue'}`}>
                        {u.plan === 'pro' ? '✦ Pro' : 'Gratuit'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'blocked' ? 'b-red' : 'b-green'}`}>
                        {u.status === 'blocked' ? 'Suspendu' : 'Actif'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{fmtDate(u.joined || u.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {!u.is_admin && <button className="tbl-btn tprimary" onClick={() => startImpersonate(u)} title="Voir le compte">Voir</button>}
                        <button className="tbl-btn" onClick={() => adminTogglePlan(u.id)} title={u.plan === 'pro' ? 'Rétrograder' : 'Activer Pro'}>
                          {u.plan === 'pro' ? '→ Free' : '→ Pro'}
                        </button>
                        {!u.is_admin && (
                          <button className={`tbl-btn ${u.status === 'blocked' ? '' : 'tdanger'}`} onClick={() => adminToggleBlock(u.id)}>
                            {u.status === 'blocked' ? 'Débloquer' : 'Bloquer'}
                          </button>
                        )}
                        {/* ✅ CORRIGÉ : Ouvre le client mail au lieu de simuler un envoi */}
                        <button className="tbl-btn" onClick={() => handleEmail(u)} title={`Envoyer un email à ${u.email}`}>Email</button>
                        {!u.is_admin && <button className="tbl-btn tdanger" onClick={() => handleDelete(u)}>Suppr.</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
