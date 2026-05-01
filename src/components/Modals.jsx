import { supabase } from '../supabase.js';
import { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { ModalShell, ModalCloser, Check, Xmark } from './Shared.jsx';
import { today } from '../storage.js';

/* ── UPGRADE ── */
export function UpgradeModal() {
  const { doUpgrade } = useApp();
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'annual'
  const monthly = 7499;
  const annual  = 74990; // = 6 250/mois, 2 mois offerts
  const perMonth = billing === 'annual' ? Math.round(annual / 12) : monthly;

  return (
    <ModalShell id="upgrade" wide>

      {/* En-tête */}
      <div className="modal-title">Passez à Pro</div>
      <div className="modal-sub">Débloquez tout OperaMind, sans aucune limite</div>

      {/* Toggle mensuel / annuel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '18px 0 20px' }}>
        <button
          onClick={() => setBilling('monthly')}
          style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            border: billing === 'monthly' ? '2px solid var(--blue)' : '1px solid var(--border)',
            background: billing === 'monthly' ? 'var(--blue-bg)' : 'transparent',
            color: billing === 'monthly' ? 'var(--blue)' : 'var(--text2)',
          }}>
          Mensuel
        </button>
        <button
          onClick={() => setBilling('annual')}
          style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            border: billing === 'annual' ? '2px solid var(--blue)' : '1px solid var(--border)',
            background: billing === 'annual' ? 'var(--blue-bg)' : 'transparent',
            color: billing === 'annual' ? 'var(--blue)' : 'var(--text2)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          Annuel
          <span style={{ background: 'var(--green)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
            −2 mois
          </span>
        </button>
      </div>

      {/* Grille plans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>

        {/* Plan Gratuit */}
        <div className="up-plan">
          <div className="up-name">Gratuit</div>
          <div className="up-price">0 <span>FCFA / mois</span></div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14 }}>Plan actuel</div>
          <ul className="up-feats">
            <li><Check />6 tableaux de bord</li>
            <li><Check />50 commandes</li>
            <li><Check />15 produits</li>
            <li><Check />5 tickets / mois</li>
            <li><Xmark />Export PDF &amp; Excel</li>
            <li><Xmark />Rapport mensuel auto</li>
            <li><Xmark />Données illimitées</li>
            <li><Xmark />Support prioritaire</li>
          </ul>
        </div>

        {/* Plan Pro */}
        <div className="up-plan feat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="up-name">Pro</div>
            <span className="badge b-amber">RECOMMANDÉ</span>
          </div>

          {/* Prix */}
          <div style={{ margin: '10px 0 2px' }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
              {perMonth.toLocaleString('fr-FR')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 4 }}>FCFA / mois</span>
          </div>
          {billing === 'annual' && (
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, marginBottom: 4 }}>
              Facturé {annual.toLocaleString('fr-FR')} FCFA/an — 2 mois offerts
            </div>
          )}
          {billing === 'monthly' && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
              Facturé {monthly.toLocaleString('fr-FR')} FCFA / mois
            </div>
          )}

          <ul className="up-feats" style={{ marginTop: 10 }}>
            <li><Check />Commandes illimitées</li>
            <li><Check />Produits illimités</li>
            <li><Check />Tickets illimités</li>
            <li><Check />Export PDF &amp; Excel</li>
            <li><Check />Rapport mensuel automatique</li>
            <li><Check />Coûts &amp; Bénéfices complet</li>
            <li><Check />Support prioritaire WhatsApp</li>
            <li><Check />Toutes les futures fonctions</li>
          </ul>

          <button
            className="btn-amber"
            style={{ width: '100%', marginTop: 16, fontWeight: 700 }}
            onClick={() => doUpgrade(billing)}>
            {billing === 'annual'
              ? `Payer ${annual.toLocaleString('fr-FR')} FCFA / an`
              : `Payer ${monthly.toLocaleString('fr-FR')} FCFA / mois`}
          </button>

          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
            Mobile Money · Carte bancaire · FedaPay
            <br />Résiliable à tout moment
          </div>
        </div>
      </div>

      {/* Bandeau offre lancement */}
      <div style={{
        background: 'var(--amber-bg, #FAEEDA)', border: '1px solid var(--amber, #BA7517)',
        borderRadius: 10, padding: '10px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>Offre de lancement</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
            Les 50 premiers abonnés obtiennent <strong>3 mois Pro offerts</strong>. Contactez-nous sur WhatsApp après votre paiement.
          </div>
        </div>
      </div>

      <div className="modal-acts"><ModalCloser label="Plus tard" /></div>
    </ModalShell>
  );
}

/* ── FORGOT ── */
export function ForgotModal() {
  const { setModal, showToast } = useApp();
  const [email, setEmail] = useState('');
  async function send() {
    if (!email.trim()) { showToast('Email requis', 'err'); return; }
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    showToast('Lien de réinitialisation envoyé (vérifiez vos spams)', 'ok');
    setModal(null);
  }
  return (
    <ModalShell id="forgot">
      <div className="modal-title">Mot de passe oublié</div>
      <div className="modal-sub">Entrez votre email pour recevoir un lien de réinitialisation.</div>
      <div className="fgrp">
        <label className="flabel">Email</label>
        <input className="finput" type="email" placeholder="vous@exemple.com" value={email}
          onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
      </div>
      <div className="modal-acts">
        <ModalCloser label="Annuler" />
        <button className="btn-blue" onClick={send}>Envoyer</button>
      </div>
    </ModalShell>
  );
}

/* ── PRIVACY ── */
export function PrivacyModal() {
  return (
    <ModalShell id="privacy" wide>
      <div className="modal-title">Politique de confidentialité</div>
      <div className="policy-scroll">
        <p><strong>OperaMind</strong> collecte uniquement les informations nécessaires au service : email, données métier saisies manuellement.</p>
        <p>Vos données sont stockées sur <strong>Supabase</strong> (PostgreSQL chiffré, hébergé en Europe). Elles ne sont jamais vendues ni partagées.</p>
        <p>Les mots de passe sont gérés par Supabase Auth (bcrypt) et ne sont jamais accessibles en clair.</p>
        <p>Vous pouvez demander la suppression de vos données : <strong style={{ color: 'var(--blue)' }}>emmanuel.kiki@operamind.bj</strong></p>
        <p><strong>Développé par Emmanuel KIKI — Cotonou, République du Bénin.</strong></p>
      </div>
      <div className="modal-acts"><ModalCloser /></div>
    </ModalShell>
  );
}

/* ── TERMS ── */
export function TermsModal() {
  return (
    <ModalShell id="terms" wide>
      <div className="modal-title">Conditions d'utilisation</div>
      <div className="policy-scroll">
        <p>En utilisant OperaMind, vous acceptez ces conditions. Le compte est strictement personnel.</p>
        <p><strong>Plan Gratuit :</strong> 50 commandes, 15 produits, 5 tickets/mois. Pages Pro verrouillées.</p>
        <p><strong>Plan Pro mensuel :</strong> 7 499 FCFA/mois via FedaPay. Renouvelable, résiliable à tout moment.</p>
        <p><strong>Plan Pro annuel :</strong> 74 990 FCFA/an (équivalent 6 249 FCFA/mois, soit 2 mois offerts).</p>
        <p>OperaMind peut suspendre tout compte en cas d'abus. Les données supprimées sont effacées sous 30 jours.</p>
        <p><strong>Emmanuel KIKI — Cotonou, République du Bénin.</strong></p>
      </div>
      <div className="modal-acts"><ModalCloser /></div>
    </ModalShell>
  );
}

/* ── ADD ORDER ── */
export function AddOrderModal() {
  const { modal, setModal, addOrder, isPro } = useApp();
  const [f, setF] = useState({ name: '', amount: '', product: '', stage: 'Prospect' });
  const [busy, setBusy] = useState(false);
  if (modal !== 'addOrder') return null;

  const status = f.stage === 'Conclu' ? 'Conclu' : f.stage === 'Annulé' ? 'Annulé' : 'En cours';

  async function save() {
    if (!f.name.trim()) return;
    setBusy(true);
    const ok = await addOrder({ name: f.name.trim(), amount: parseInt(f.amount) || 0, product: f.product, stage: f.stage, status, date: today() });
    setBusy(false);
    if (ok !== false) { setModal(null); setF({ name: '', amount: '', product: '', stage: 'Prospect' }); }
  }

  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <div className="modal-ov" onClick={() => setModal(null)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Nouvelle commande</div>
        <div className="fgrp"><label className="flabel">Nom / Client</label><input className="finput" placeholder="Ex: Commande Alpha SARL" value={f.name} onChange={s('name')} /></div>
        <div className="fgrp"><label className="flabel">Montant (FCFA)</label><input className="finput" type="number" placeholder="Ex: 75000" value={f.amount} onChange={s('amount')} /></div>
        <div className="fgrp"><label className="flabel">Produit / Service</label><input className="finput" placeholder="Ex: Service Premium" value={f.product} onChange={s('product')} /></div>
        <div className="fgrp"><label className="flabel">Étape pipeline</label>
          <select className="finput" value={f.stage} onChange={s('stage')}>
            <option>Prospect</option><option>Devis envoyé</option><option>Négociation</option><option>Conclu</option><option>Annulé</option>
          </select>
        </div>
        <div className="modal-acts">
          <button className="btn-ghost" onClick={() => setModal(null)}>Annuler</button>
          <button className="btn-blue" onClick={save} disabled={busy}>{busy ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── ADD PRODUCT ── */
export function AddProductModal() {
  const { modal, setModal, addProduct } = useApp();
  const [f, setF] = useState({ name: '', price: '', stock: '', category: 'Service' });
  const [busy, setBusy] = useState(false);
  if (modal !== 'addProduct') return null;

  async function save() {
    if (!f.name.trim()) return;
    setBusy(true);
    const ok = await addProduct({ name: f.name.trim(), price: parseInt(f.price) || 0, stock: parseInt(f.stock) || 0, category: f.category });
    setBusy(false);
    if (ok !== false) { setModal(null); setF({ name: '', price: '', stock: '', category: 'Service' }); }
  }

  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <div className="modal-ov" onClick={() => setModal(null)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Nouveau produit / service</div>
        <div className="fgrp"><label className="flabel">Nom</label><input className="finput" placeholder="Ex: Service Premium" value={f.name} onChange={s('name')} /></div>
        <div className="frow">
          <div className="fgrp"><label className="flabel">Prix (FCFA)</label><input className="finput" type="number" placeholder="75000" value={f.price} onChange={s('price')} /></div>
          <div className="fgrp"><label className="flabel">Stock</label><input className="finput" type="number" placeholder="100" value={f.stock} onChange={s('stock')} /></div>
        </div>
        <div className="fgrp"><label className="flabel">Catégorie</label>
          <select className="finput" value={f.category} onChange={s('category')}>
            <option>Service</option><option>Produit physique</option><option>Consulting</option><option>Abonnement</option>
          </select>
        </div>
        <div className="modal-acts">
          <button className="btn-ghost" onClick={() => setModal(null)}>Annuler</button>
          <button className="btn-blue" onClick={save} disabled={busy}>{busy ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── ADD COST ── */
export function AddCostModal() {
  const { modal, setModal, addCost } = useApp();
  const [f, setF] = useState({ name: '', amount: '', type: 'Fixe' });
  const [busy, setBusy] = useState(false);
  if (modal !== 'addCost') return null;

  async function save() {
    if (!f.name.trim()) return;
    setBusy(true);
    const ok = await addCost({ name: f.name.trim(), amount: parseInt(f.amount) || 0, type: f.type, date: today() });
    setBusy(false);
    if (ok !== false) { setModal(null); setF({ name: '', amount: '', type: 'Fixe' }); }
  }

  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <div className="modal-ov" onClick={() => setModal(null)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Ajouter un coût</div>
        <div className="fgrp"><label className="flabel">Intitulé</label><input className="finput" placeholder="Ex: Loyer bureau" value={f.name} onChange={s('name')} /></div>
        <div className="frow">
          <div className="fgrp"><label className="flabel">Montant (FCFA)</label><input className="finput" type="number" placeholder="80000" value={f.amount} onChange={s('amount')} /></div>
          <div className="fgrp"><label className="flabel">Type</label>
            <select className="finput" value={f.type} onChange={s('type')}>
              <option>Fixe</option><option>Variable</option><option>Exceptionnel</option>
            </select>
          </div>
        </div>
        <div className="modal-acts">
          <button className="btn-ghost" onClick={() => setModal(null)}>Annuler</button>
          <button className="btn-blue" onClick={save} disabled={busy}>{busy ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── ADD TICKET ── */
export function AddTicketModal() {
  const { modal, setModal, addTicket } = useApp();
  const [f, setF] = useState({ title: '', priority: 'Moyenne', desc: '' });
  const [busy, setBusy] = useState(false);
  if (modal !== 'addTicket') return null;

  async function save() {
    if (!f.title.trim()) return;
    setBusy(true);
    const ok = await addTicket({ title: f.title.trim(), priority: f.priority, desc: f.desc });
    setBusy(false);
    if (ok !== false) { setModal(null); setF({ title: '', priority: 'Moyenne', desc: '' }); }
  }

  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <div className="modal-ov" onClick={() => setModal(null)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Nouveau ticket</div>
        <div className="fgrp"><label className="flabel">Titre</label><input className="finput" placeholder="Ex: Problème livraison client Alpha" value={f.title} onChange={s('title')} /></div>
        <div className="fgrp"><label className="flabel">Priorité</label>
          <select className="finput" value={f.priority} onChange={s('priority')}>
            <option>Basse</option><option>Moyenne</option><option>Haute</option><option>Urgente</option>
          </select>
        </div>
        <div className="fgrp"><label className="flabel">Description</label><textarea className="finput" rows="3" placeholder="Décrivez le problème..." value={f.desc} onChange={s('desc')} /></div>
        <div className="modal-acts">
          <button className="btn-ghost" onClick={() => setModal(null)}>Annuler</button>
          <button className="btn-blue" onClick={save} disabled={busy}>{busy ? 'Création...' : 'Créer'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── SET GOAL ── */
export function SetGoalModal() {
  const { modal, setModal, getUD, setGoal } = useApp();
  const d = getUD();
  const [target, setTarget] = useState(d.goals?.revenueTarget || '');
  if (modal !== 'setGoal') return null;

  async function save() {
    const v = parseInt(target) || 0;
    if (v <= 0) return;
    const month = new Date().toISOString().slice(0, 7);
    await setGoal(v, month);
    setModal(null);
  }

  return (
    <div className="modal-ov" onClick={() => setModal(null)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Objectif mensuel</div>
        <div className="modal-sub">Définissez votre objectif de revenu pour ce mois.</div>
        <div className="fgrp">
          <label className="flabel">Objectif (FCFA)</label>
          <input className="finput" type="number" placeholder="Ex: 500 000" value={target}
            onChange={e => setTarget(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} />
        </div>
        <div className="modal-acts">
          <button className="btn-ghost" onClick={() => setModal(null)}>Annuler</button>
          <button className="btn-blue" onClick={save}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
