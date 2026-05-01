import { useApp } from '../AppContext.jsx';

const PAGE_TITLES = {
  operations: 'Opérations', marketing: 'Marketing', financial: 'Finances',
  executive: 'Tableau Exécutif', sales: 'Ventes', support: 'Support',
  costs: 'Coûts & Bénéfices', report: 'Rapport PDF', settings: 'Paramètres',
  admin: 'Administration', privacy: 'Confidentialité', terms: 'CGU',
};

export default function Topbar({ onToggle }) {
  const { page, activeUser } = useApp();
  const initials = activeUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button className="icon-btn" onClick={onToggle} title="Menu">
          <MenuIcon />
        </button>
        <div className="topbar-title">{PAGE_TITLES[page] || 'OperaMind'}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <div className="topbar-av" title={activeUser?.name || ''}>{initials}</div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
