import { useApp } from '../AppContext.jsx';

/* ── SVG Icons — déclarés AVANT les tableaux NAV ── */
function mkIcon(content) {
  return function Icon() {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {content}
      </svg>
    );
  };
}

const OpsIcon    = mkIcon(<><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></>);
const MktIcon    = mkIcon(<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>);
const FinIcon    = mkIcon(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>);
const ExecIcon   = mkIcon(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>);
const SalesIcon  = mkIcon(<><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>);
const SuppIcon   = mkIcon(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>);
const CostIcon   = mkIcon(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>);
const RptIcon    = mkIcon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>);
const SettIcon   = mkIcon(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>);
const AdminIcon  = mkIcon(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>);
const LogoutIcon = mkIcon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>);

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

/* ── Navigation arrays — APRÈS les icônes ── */
const NAV = [
  { id: 'operations', label: 'Opérations',  Icon: OpsIcon },
  { id: 'marketing',  label: 'Marketing',   Icon: MktIcon },
  { id: 'financial',  label: 'Finances',    Icon: FinIcon },
  { id: 'executive',  label: 'Exécutif',    Icon: ExecIcon },
  { id: 'sales',      label: 'Ventes',      Icon: SalesIcon },
  { id: 'support',    label: 'Support',     Icon: SuppIcon },
];

const PRO_NAV = [
  { id: 'costs',  label: 'Coûts & Bénéfices', Icon: CostIcon },
  { id: 'report', label: 'Rapport PDF',        Icon: RptIcon },
];

export default function Sidebar({ collapsed }) {
  const { page, setPage, isAdmin, isPro } = useApp();
  const pro = isPro();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 12 C4 7 7.5 4 12 4 C16.5 4 20 7 20 12"
              stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="3" fill="white"/>
            <line x1="9" y1="21" x2="15" y2="21"
              stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        {!collapsed && <span className="logo-text">OperaMind</span>}
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section">Tableaux de bord</div>}
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item ${page === id ? 'active' : ''}`}
            onClick={() => setPage(id)}
            title={collapsed ? label : ''}
          >
            <Icon />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}

        {!collapsed && <div className="nav-section" style={{ marginTop: 8 }}>Pro</div>}
        {PRO_NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item ${page === id ? 'active' : ''} ${!pro ? 'locked' : ''}`}
            onClick={() => setPage(id)}
            title={collapsed ? label : ''}
          >
            <Icon />
            {!collapsed && (
              <span style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {label}
                {!pro && <LockIcon />}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`nav-item ${page === 'settings' ? 'active' : ''}`}
          onClick={() => setPage('settings')}
          title={collapsed ? 'Paramètres' : ''}
        >
          <SettIcon />
          {!collapsed && <span>Paramètres</span>}
        </button>

        {isAdmin && (
          <button
            className={`nav-item admin-item ${page === 'admin' ? 'active' : ''}`}
            onClick={() => setPage('admin')}
            title={collapsed ? 'Administration' : ''}
          >
            <AdminIcon />
            {!collapsed && <span>Administration</span>}
          </button>
        )}

        <LogoutBtn collapsed={collapsed} />
      </div>
    </aside>
  );
}

function LogoutBtn({ collapsed }) {
  const { logout, activeUser } = useApp();
  if (!activeUser) return null;

  const initials = activeUser.name
    ? activeUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (collapsed) {
    return (
      <button className="nav-item logout" onClick={logout} title="Déconnexion">
        <LogoutIcon />
      </button>
    );
  }

  return (
    <div className="user-row">
      <div className="user-av">{initials}</div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div className="user-name">{activeUser.name}</div>
        <div className="user-plan">{activeUser.plan === 'pro' ? '✦ Pro' : 'Gratuit'}</div>
      </div>
      <button className="logout-btn" onClick={logout} title="Déconnexion">
        <LogoutIcon />
      </button>
    </div>
  );
}
