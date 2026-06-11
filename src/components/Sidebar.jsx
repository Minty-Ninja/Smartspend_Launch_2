// src/components/Sidebar.jsx
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onNavigate, onClose }) {
  const { profile, initials, logout } = useAuth();

  return (
    <>
      <div className="sideBar-Overlay visible" onClick={onClose} />
      <nav className="sidebar open">

        {/* ── User avatar + name at top of sidebar ── */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{profile?.name || "User"}</span>
            <span className="sidebar-user-label">My Account</span>
          </div>
        </div>
        <hr className="sidebar-divider" />

        <h2>SmartSpend</h2>
        <a href="#" onClick={e => { e.preventDefault(); onNavigate("home"); }}>
          🏠 Dashboard
        </a>
        <a href="#" onClick={e => { e.preventDefault(); onNavigate("monthly"); }}>
          📊 Monthly Review
        </a>
        <a href="#" onClick={e => { e.preventDefault(); logout(); }}>
          🚪 Logout
        </a>
      </nav>
    </>
  );
}
