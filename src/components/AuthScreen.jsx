import { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext.jsx';

export default function AuthScreen() {
  const { login, register, showToast, setModal,
          pendingEmail, setPendingEmail, verifyOtp, resendOtp } = useApp();

  const [tab,     setTab]     = useState('login');
  const [loading, setLoading] = useState(false);
  const [show,    setShow]    = useState(false);
  const [err,     setErr]     = useState('');
  const [f, setF] = useState({ email: '', pass: '', pass2: '', first: '', last: '' });
  const s = k => e => { setErr(''); setF(p => ({ ...p, [k]: e.target.value })); };

  // ── Si un email est en attente de vérification OTP, afficher cet écran ──
  if (pendingEmail) {
    return <OtpScreen
      email={pendingEmail}
      onVerify={verifyOtp}
      onResend={resendOtp}
      onBack={() => setPendingEmail(null)}
    />;
  }

  async function doLogin() {
    setErr('');
    if (!f.email || !f.pass) { setErr('Email et mot de passe requis'); return; }
    setLoading(true);
    const ok = await login(f.email, f.pass);
    setLoading(false);
    if (!ok) setErr('Email ou mot de passe incorrect');
  }

  async function doRegister() {
    setErr('');
    if (!f.first || !f.last || !f.email || !f.pass) { setErr('Tous les champs sont requis'); return; }
    if (f.pass.length < 8) { setErr('Mot de passe trop court (8 min)'); return; }
    if (f.pass !== f.pass2) { setErr('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    const ok = await register(f.first, f.last, f.email, f.pass);
    setLoading(false);
    if (!ok) setErr('Inscription échouée. Cet email est peut-être déjà utilisé.');
  }

  function key(e, fn) { if (e.key === 'Enter') fn(); }

  return (
    <div className="auth-root">
      <div className="auth-blobs">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
      </div>
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo-row">
          <div className="auth-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 12 C4 7 7.5 4 12 4 C16.5 4 20 7 20 12"
                stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="3.5" fill="white"/>
              <line x1="8.5" y1="22" x2="15.5" y2="22"
                stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="auth-wordmark">Opera<span>Mind</span></div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setErr(''); }}>
            Connexion
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setErr(''); }}>
            Inscription
          </button>
        </div>

        {err && <div className="auth-error">{err}</div>}

        {/* ── CONNEXION ── */}
        {tab === 'login' && (
          <>
            <div className="auth-h">Bienvenue</div>
            <div className="auth-sub">Connectez-vous à votre tableau de bord</div>

            <div className="fgrp">
              <label className="flabel">Email</label>
              <input className="finput" type="email" placeholder="vous@exemple.com"
                value={f.email} onChange={s('email')} onKeyDown={e => key(e, doLogin)} />
            </div>

            <div className="fgrp">
              <label className="flabel">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input className="finput" type={show ? 'text' : 'password'}
                  placeholder="••••••••" value={f.pass} onChange={s('pass')}
                  onKeyDown={e => key(e, doLogin)} style={{ paddingRight: 40 }} />
                <button type="button" className="eye-btn" onClick={() => setShow(p => !p)}>
                  {show ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <button className="auth-link" onClick={() => setModal('forgot')}>
                Mot de passe oublié ?
              </button>
            </div>

            <button className="btn-primary" onClick={doLogin} disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </>
        )}

        {/* ── INSCRIPTION ── */}
        {tab === 'register' && (
          <>
            <div className="auth-h">Créer un compte</div>
            <div className="auth-sub">Commencez gratuitement, sans carte bancaire</div>

            <div className="frow">
              <div className="fgrp">
                <label className="flabel">Prénom</label>
                <input className="finput" placeholder="Jean"
                  value={f.first} onChange={s('first')} />
              </div>
              <div className="fgrp">
                <label className="flabel">Nom</label>
                <input className="finput" placeholder="Dupont"
                  value={f.last} onChange={s('last')} />
              </div>
            </div>

            <div className="fgrp">
              <label className="flabel">Email</label>
              <input className="finput" type="email" placeholder="vous@exemple.com"
                value={f.email} onChange={s('email')} />
            </div>

            <div className="fgrp">
              <label className="flabel">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input className="finput" type={show ? 'text' : 'password'}
                  placeholder="8 caractères minimum" value={f.pass}
                  onChange={s('pass')} style={{ paddingRight: 40 }} />
                <button type="button" className="eye-btn" onClick={() => setShow(p => !p)}>
                  {show ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="fgrp">
              <label className="flabel">Confirmer le mot de passe</label>
              <input className="finput" type="password" placeholder="••••••••"
                value={f.pass2} onChange={s('pass2')}
                onKeyDown={e => key(e, doRegister)} />
            </div>

            <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6, marginTop: 8 }}>
              En créant un compte vous acceptez nos{' '}
              <button className="auth-link" style={{ fontSize: 11 }}
                onClick={() => setModal('terms')}>CGU</button>
              {' '}et notre{' '}
              <button className="auth-link" style={{ fontSize: 11 }}
                onClick={() => setModal('privacy')}>Politique de confidentialité</button>.
            </div>

            <button className="btn-primary" style={{ marginTop: 14 }}
              onClick={doRegister} disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte gratuit'}
            </button>
          </>
        )}

        {/* Footer */}
        <div className="auth-footer">
          Développé par <strong>Emmanuel KIKI</strong> — Cotonou, Bénin
          <br /><br />
          <button className="auth-link"
            style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 11 }}
            onClick={() => setModal('privacy')}>Confidentialité</button>
          {' '}&middot;{' '}
          <button className="auth-link"
            style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 11 }}
            onClick={() => setModal('terms')}>CGU</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ÉCRAN DE VÉRIFICATION OTP
   Affiché après l'inscription, l'utilisateur saisit le code 6 chiffres
───────────────────────────────────────────────────────────────── */
function OtpScreen({ email, onVerify, onResend, onBack }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [err, setErr] = useState('');
  const inputs = useRef([]);

  // Compte à rebours avant de pouvoir renvoyer le code
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleDigit(i, val) {
    // Accepte seulement les chiffres
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    setErr('');

    // Avancer automatiquement au champ suivant
    if (v && i < 5) {
      inputs.current[i + 1]?.focus();
    }

    // Si le dernier chiffre est rempli, soumettre automatiquement
    if (i === 5 && v) {
      const code = [...next.slice(0, 5), v].join('');
      if (code.length === 6) submit(code);
    }
  }

  function handleKeyDown(i, e) {
    // Retour arrière : effacer et reculer
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    // Coller un code complet
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) return;
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setDigits(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) submit(pasted);
  }

  async function submit(code) {
    const otp = code || digits.join('');
    if (otp.length < 6) { setErr('Entrez les 6 chiffres du code'); return; }
    setLoading(true);
    setErr('');
    const ok = await onVerify(email, otp);
    setLoading(false);
    if (!ok) {
      setErr('Code incorrect ou expiré. Vérifiez votre email ou demandez un nouveau code.');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
  }

  async function handleResend() {
    setResending(true);
    await onResend(email);
    setResending(false);
    setCountdown(60);
    setDigits(['', '', '', '', '', '']);
    setErr('');
    inputs.current[0]?.focus();
  }

  const filled = digits.filter(d => d !== '').length;

  return (
    <div className="auth-root">
      <div className="auth-blobs">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
      </div>

      <div className="auth-card" style={{ maxWidth: 400 }}>
        {/* Logo */}
        <div className="auth-logo-row">
          <div className="auth-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 12 C4 7 7.5 4 12 4 C16.5 4 20 7 20 12"
                stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="3.5" fill="white"/>
              <line x1="8.5" y1="22" x2="15.5" y2="22"
                stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="auth-wordmark">Opera<span>Mind</span></div>
        </div>

        {/* Icône email */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--blue-bg)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="var(--blue)" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
        </div>

        <div className="auth-h" style={{ textAlign: 'center' }}>
          Vérifiez votre email
        </div>
        <div className="auth-sub" style={{ textAlign: 'center', marginBottom: 6 }}>
          Nous avons envoyé un code à 6 chiffres à
        </div>
        <div style={{
          textAlign: 'center', fontWeight: 700, fontSize: 13,
          color: 'var(--text)', marginBottom: 20,
          wordBreak: 'break-all',
        }}>
          {email}
        </div>

        {/* Champs OTP */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16,
        }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              style={{
                width: 44, height: 52, textAlign: 'center',
                fontSize: 22, fontWeight: 800, fontFamily: 'var(--mono)',
                border: `2px solid ${d ? 'var(--blue)' : 'var(--border)'}`,
                borderRadius: 10, outline: 'none', background: 'white',
                color: 'var(--text)',
                transition: 'border-color .15s',
                caretColor: 'var(--blue)',
              }}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {err && (
          <div className="auth-error" style={{ marginBottom: 12 }}>{err}</div>
        )}

        {/* Progression visuelle */}
        {filled > 0 && filled < 6 && (
          <div style={{
            fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginBottom: 8,
          }}>
            {filled}/6 chiffres
          </div>
        )}

        <button
          className="btn-primary"
          onClick={() => submit()}
          disabled={loading || filled < 6}
          style={{ marginBottom: 12 }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span className="spinner-sm" /> Vérification...
            </span>
          ) : 'Confirmer mon compte'}
        </button>

        {/* Renvoyer le code */}
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
          Pas reçu le code ?{' '}
          {countdown > 0 ? (
            <span style={{ color: 'var(--text3)' }}>
              Renvoyer dans <strong style={{ color: 'var(--text2)' }}>{countdown}s</strong>
            </span>
          ) : (
            <button
              className="auth-link"
              onClick={handleResend}
              disabled={resending}
              style={{ fontSize: 13 }}
            >
              {resending ? 'Envoi...' : 'Renvoyer le code'}
            </button>
          )}
        </div>

        {/* Retour */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="auth-link"
            style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 400 }}
            onClick={onBack}>
            ← Modifier mon email
          </button>
        </div>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          Développé par <strong>Emmanuel KIKI</strong> — Cotonou, Bénin
        </div>
      </div>
    </div>
  );
}

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
