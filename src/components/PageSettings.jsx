import { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { PageHeader } from './Shared.jsx';

export function SettingsPage() {
  const { profile, activeProfile, changePassword, isPro, setModal } = useApp();
  const user = profile;
  const [f, setF] = useState({ old: '', new1: '', new2: '' });
  const [saving, setSaving] = useState(false);

  async function doChange() {
    if (!f.old || !f.new1) return;
    if (f.new1 !== f.new2) { alert('Les mots de passe ne correspondent pas'); return; }
    setSaving(true);
    await changePassword(f.old, f.new1);
    setSaving(false);
    setF({ old: '', new1: '', new2: '' });
  }

  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="pgrid">
      <PageHeader title="Paramètres" sub="Gérez votre compte et vos préférences" />

      <div className="card cs2">
        <div className="card-head"><span className="card-title">Mon profil</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, marginBottom: 16 }}>
          <div className="settings-av">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{user?.email}</div>
            <span className={`badge ${isPro() ? 'b-amber' : 'b-blue'}`} style={{ marginTop: 6, display: 'inline-block' }}>
              {isPro() ? '✦ Plan Pro' : 'Plan Gratuit'}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          Compte Supabase — Données synchronisées en temps réel
        </div>
      </div>

      <div className="card">
        <div className="card-head"><span className="card-title">Votre plan</span></div>
        {isPro() ? (
          <div style={{ marginTop: 12 }}>
            <div className="badge b-amber" style={{ fontSize: 14, padding: '6px 14px' }}>✦ Plan Pro actif</div>
            <ul style={{ marginTop: 16, fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
              <li>Commandes et produits illimités</li>
              <li>Coûts &amp; Bénéfices complet</li>
              <li>Rapport PDF mensuel</li>
              <li>Données sauvegardées sur Supabase</li>
            </ul>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div className="badge b-blue" style={{ fontSize: 13, padding: '5px 12px' }}>Plan Gratuit</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 12, marginBottom: 16, lineHeight: 1.6 }}>
              50 commandes, 15 produits. Pages Pro verrouillées.
            </div>
            <button className="btn-amber" onClick={() => setModal('upgrade')}>
              Passer à Pro — dès 7 500 FCFA / mois
            </button>
          </div>
        )}
      </div>

      <div className="card cs2">
        <div className="card-head"><span className="card-title">Modifier le mot de passe</span></div>
        <div style={{ marginTop: 16 }}>
          <div className="frow">
            <div className="fgrp">
              <label className="flabel">Ancien mot de passe</label>
              <input className="finput" type="password" placeholder="••••••••" value={f.old} onChange={s('old')} />
            </div>
          </div>
          <div className="frow">
            <div className="fgrp">
              <label className="flabel">Nouveau mot de passe</label>
              <input className="finput" type="password" placeholder="8 caractères min" value={f.new1} onChange={s('new1')} />
            </div>
            <div className="fgrp">
              <label className="flabel">Confirmer</label>
              <input className="finput" type="password" placeholder="••••••••" value={f.new2} onChange={s('new2')} />
            </div>
          </div>
          <button className="btn-blue" onClick={doChange} disabled={saving} style={{ marginTop: 8 }}>
            {saving ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </div>
      </div>

      <div className="card csfull">
        <div className="card-head"><span className="card-title">Documents légaux &amp; Informations</span></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <button className="btn-ghost" onClick={() => setModal('privacy')}>Politique de confidentialité</button>
          <button className="btn-ghost" onClick={() => setModal('terms')}>Conditions d'utilisation</button>
        </div>
        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text3)' }}>
          OperaMind v3.1 — Base de données Supabase PostgreSQL — Développé par <strong>Emmanuel KIKI</strong> — Cotonou, République du Bénin
        </div>
      </div>
    </div>
  );
}
