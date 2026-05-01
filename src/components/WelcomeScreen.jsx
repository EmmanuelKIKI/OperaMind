import { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext.jsx';

/* ─────────────────────────────────────────────────────────────────
   ÉCRAN DE BIENVENUE — affiché une seule fois après la première
   connexion. Texte qui s'écrit lettre par lettre, comme Claude.
───────────────────────────────────────────────────────────────── */

const WELCOME_KEY = 'operamind_welcome_seen_v1';

const LINES = (name) => [
  { text: `Bonjour ${name} 👋`, delay: 0, big: true },
  { text: 'Bienvenue sur OperaMind.', delay: 900, big: true },
  { text: 'Votre tableau de bord intelligent pour piloter votre entreprise depuis Cotonou.', delay: 2000 },
  { text: 'Commencez par ajouter vos premières commandes, produits ou revenus.', delay: 4200 },
  { text: 'Tout est prêt — à vous de jouer.', delay: 6000, accent: true },
];

function TypedLine({ text, onDone, speed = 28 }) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}<span className="cursor-blink" /></span>;
}

export function WelcomeScreen({ onDone }) {
  const { activeProfile } = useApp();
  const firstName = (activeProfile?.name || '').split(' ')[0] || 'vous';
  const lines = LINES(firstName);

  const [shownCount, setShownCount] = useState(0);
  const [typingIdx, setTypingIdx]   = useState(0);
  const [allDone, setAllDone]        = useState(false);

  // Affiche les lignes une par une avec délai
  useEffect(() => {
    if (shownCount >= lines.length) return;
    const t = setTimeout(() => {
      setShownCount(c => c + 1);
    }, lines[shownCount]?.delay || 0);
    return () => clearTimeout(t);
  }, [shownCount]);

  function handleLineDone() {
    setTypingIdx(i => i + 1);
    if (typingIdx >= lines.length - 1) {
      setTimeout(() => setAllDone(true), 600);
    }
  }

  function handleClose() {
    localStorage.setItem(WELCOME_KEY, '1');
    onDone();
  }

  return (
    <div className="welcome-overlay" onClick={allDone ? handleClose : undefined}>
      <div className="welcome-card" onClick={e => e.stopPropagation()}>

        {/* Logo */}
        <div className="welcome-logo">
          <div className="auth-mark" style={{ width: 36, height: 36 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 12 C4 7 7.5 4 12 4 C16.5 4 20 7 20 12"
                stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="3.5" fill="white"/>
              <line x1="8.5" y1="22" x2="15.5" y2="22"
                stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Lignes animées */}
        <div className="welcome-lines">
          {lines.slice(0, shownCount).map((line, i) => (
            <div
              key={i}
              className={`welcome-line ${line.big ? 'wl-big' : ''} ${line.accent ? 'wl-accent' : ''}`}
            >
              {i === typingIdx ? (
                <TypedLine text={line.text} onDone={handleLineDone} speed={line.big ? 40 : 22} />
              ) : i < typingIdx ? (
                <span>{line.text}</span>
              ) : null}
            </div>
          ))}
        </div>

        {/* Bouton — apparaît quand tout est écrit */}
        {allDone && (
          <button
            className="btn-primary welcome-btn"
            onClick={handleClose}
            style={{ animationFillMode: 'both' }}
          >
            Commencer →
          </button>
        )}

        {/* Skip discret */}
        {!allDone && (
          <button className="welcome-skip" onClick={handleClose}>
            Passer
          </button>
        )}
      </div>
    </div>
  );
}

/* Hook à utiliser dans App.jsx pour savoir si on doit afficher le welcome */
export function shouldShowWelcome() {
  return !localStorage.getItem(WELCOME_KEY);
}
