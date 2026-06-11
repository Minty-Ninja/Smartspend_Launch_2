// src/components/Dashboard.jsx
import { useState }    from "react";
import Sidebar         from "./Sidebar";
import HelloBanner     from "./HelloBanner";
import ExpenseTracker  from "./ExpenseTracker";
import GoalTracker     from "./GoalTracker";

export default function Dashboard({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <section className="screen dashboard-screen" style={{ display:"block" }}>

      {/* Hamburger button */}
      <button className="Hamburger" id="hamIcons"
        onClick={() => setSidebarOpen(true)} aria-label="Menu">
        <span className="menu-icon">☰</span>
      </button>

      {/* Sidebar — only renders when open */}
      {sidebarOpen && (
        <Sidebar
          onNavigate={view => { setSidebarOpen(false); onNavigate(view); }}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="site-wrap">

        <header className="site-header">
          <div className="brand">
            <h1>SmartSpend</h1>
            <p className="tagline">Track expenses • Set goals • Learn smart money habits</p>
          </div>
        </header>

        {/* Hello banner — reads from AuthContext automatically */}
        <HelloBanner />

        <main className="content-grid">
          <ExpenseTracker />
          <GoalTracker />
        </main>

        <footer className="site-footer">
          <small>💡 Use SmartSpend smartly every day!</small>
        </footer>

      </div>
    </section>
  );
}
