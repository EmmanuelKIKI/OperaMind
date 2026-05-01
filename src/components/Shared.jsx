import { useState } from 'react';
import { useApp } from '../AppContext.jsx';

/* ─── TOAST ─── */
export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const ok = toast.type === 'ok';
  return (
    <div className={`toast ${ok ? 'tok' : 'terr'}`}>
      {ok
        ? <Svg d="M20 6 9 17 4 12" stroke="var(--green)" w={16} />
        : <><circle cx="12" cy="12" r="10" stroke="var(--red)" strokeWidth="2" fill="none" /><SvgRaw><line x1="12" y1="8" x2="12" y2="12" stroke="var(--red)" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="var(--red)" strokeWidth="2" /></SvgRaw></>
      }
      <span>{toast.msg}</span>
    </div>
  );
}

/* ─── LIMIT BAR ─── */
export function LimitBar({ label, current, max }) {
  const { isPro } = useApp();
  const pro = isPro();
  const pct = Math.min(100, Math.round((current / max) * 100));
  const clr = pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--amber)' : 'var(--blue)';
  return (
    <div className="litem">
      <div className="lrow">
        <span className="llbl">{label}</span>
        <span className="lval">{current} / {pro ? '∞' : max}</span>
      </div>
      <div className="ltrack">
        <div className="lfill" style={{ width: `${pro ? Math.min(pct, 45) : pct}%`, background: pro ? 'var(--green)' : clr }} />
      </div>
    </div>
  );
}

/* ─── PRO GATE ─── */
export function ProGate({ title = 'Fonction Pro', sub = 'Disponible avec le plan Pro' }) {
  const { setModal } = useApp();
  return (
    <div className="pro-gate-ov">
      <div className="pro-gate-ico">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <div className="pro-gate-title">{title}</div>
      <div className="pro-gate-sub">{sub}</div>
      <button className="btn-amber" onClick={() => setModal('upgrade')}>
        Passer à Pro — dès 7 500 FCFA / mois
      </button>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
        Offre annuelle : 75 000 FCFA / an (2 mois offerts)
      </div>
    </div>
  );
}

/* ─── CONFIRM MODAL ─── */
let _resolveConfirm = null;
let _setConfirmState = null;

export function useConfirm() {
  return async function confirm(msg) {
    return new Promise(resolve => {
      _resolveConfirm = resolve;
      _setConfirmState && _setConfirmState({ open: true, msg });
    });
  };
}

export function ConfirmModal() {
  const [state, setState] = useState({ open: false, msg: '' });
  _setConfirmState = setState;
  if (!state.open) return null;
  function answer(yes) {
    setState({ open: false, msg: '' });
    _resolveConfirm && _resolveConfirm(yes);
  }
  return (
    <div className="modal-ov" onClick={() => answer(false)}>
      <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">Confirmation</div>
        <div style={{ fontSize: 14, color: 'var(--text2)', margin: '12px 0 20px' }}>{state.msg}</div>
        <div className="modal-acts">
          <button className="btn-ghost" onClick={() => answer(false)}>Annuler</button>
          <button className="btn-red" onClick={() => answer(true)}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MODAL SHELL ─── */
export function ModalShell({ id, children, wide = false }) {
  const { modal, setModal } = useApp();
  if (modal !== id) return null;
  return (
    <div className="modal-ov" onClick={() => setModal(null)}>
      <div className="modal-box" style={wide ? { width: 540 } : {}} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function ModalCloser({ label = 'Fermer' }) {
  const { setModal } = useApp();
  return <button className="btn-ghost" onClick={() => setModal(null)}>{label}</button>;
}

/* ─── KPI CARD ─── */
export function KpiCard({ label, value, change, up, color }) {
  return (
    <div className="card kpi">
      <span className="kpi-lbl">{label}</span>
      <span className="kpi-val" style={color ? { color } : {}}>{value}</span>
      {change !== undefined && (
        <span className={`kpi-chg ${up === true ? 'up' : up === false ? 'dn' : 'neu'}`}>
          {up === true && <ChevUp />}
          {up === false && <ChevDown />}
          {change}
        </span>
      )}
    </div>
  );
}

/* ─── EMPTY STATE ─── */
export function EmptyState({ msg }) {
  return <div className="empty-state">{msg}</div>;
}

/* ─── PAGE HEADER ─── */
export function PageHeader({ title, sub, action }) {
  return (
    <div className="csfull page-head">
      <div>
        <h1 className="pg-title">{title}</h1>
        {sub && <p className="pg-sub">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─── SVG ICON HELPERS ─── */
export const ChevUp   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>;
export const ChevDown = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;
export const Check    = ({ color = 'var(--green)' }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
export const Xmark    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
export const Lock     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

function Svg({ d, stroke = 'currentColor', w = 16 }) {
  return (
    <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5">
      <polyline points={d} />
    </svg>
  );
}
function SvgRaw({ children }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none">{children}</svg>;
}

/* ─── LIMIT BANNER — réutilisable pour tous les blocages freemium ─── */
export function LimitBanner({ type = 'warn', text, onUpgrade }) {
  return (
    <div className={`limit-banner lim-${type} csfull`}>
      <span className="limit-banner-text">{text}</span>
      <button
        className={type === 'block' ? 'btn-amber' : 'btn-amber'}
        style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
        onClick={onUpgrade}
      >
        Passer à Pro
      </button>
    </div>
  );
}
