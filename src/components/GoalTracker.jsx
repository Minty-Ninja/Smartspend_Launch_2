// src/components/GoalTracker.jsx
import { useState } from "react";
import { useAuth }  from "../context/AuthContext";
import { useGoals } from "../hooks/useGoals";

const fmt = n => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

export default function GoalTracker() {
  const { user }  = useAuth();
  const { goals, addGoal, addSavings, deleteGoal } = useGoals(user?.uid);

  const [amount,     setAmount]     = useState("");
  const [name,       setName]       = useState("");
  const [date,       setDate]       = useState("");
  const [saveInputs, setSaveInputs] = useState({});

  // Goals expiring within 7 days
  const urgentGoals = goals.filter(g => {
    const daysLeft = Math.ceil((new Date(g.DateCompletion) - new Date()) / 86400000);
    const pct      = Math.min(100, Math.round(((g.savedAmount||0) / g.AmountToSave) * 100));
    return daysLeft >= 0 && daysLeft <= 7 && pct < 100;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    await addGoal({ AmountToSave: parseFloat(amount), DescriptionName: name, DateCompletion: date });
    setAmount(""); setName(""); setDate("");
  }

  async function handleAddSavings(id) {
    const val = parseFloat(saveInputs[id] || 0);
    if (!val || val <= 0) return;
    await addSavings(id, val);
    setSaveInputs(prev => ({ ...prev, [id]: "" }));
  }

  return (
    <aside className="card" id="goal-section">
      <h2>Goal Oriented Savings</h2>

      {/* Add goal form */}
      <form className="form" onSubmit={handleSubmit}>
        <label>Amount to Save (₹):</label>
        <input type="number" placeholder="e.g. 5000" min="0" step="0.01" required
          value={amount} onChange={e => setAmount(e.target.value)} />

        <label>Goal Name:</label>
        <input type="text" placeholder="e.g. New Phone" required
          value={name} onChange={e => setName(e.target.value)} />

        <label>Target Date:</label>
        <input type="date" required
          value={date} onChange={e => setDate(e.target.value)} />

        <button type="submit" className="btn">Add Goal</button>
      </form>

      {/* Deadline alerts */}
      {urgentGoals.length > 0 && (
        <div className="alertBox">
          {urgentGoals.map(g => {
            const daysLeft = Math.ceil((new Date(g.DateCompletion) - new Date()) / 86400000);
            return (
              <div key={g.id}>
                ⚠️ <strong>{g.DescriptionName}</strong> deadline in {daysLeft} day(s)!
              </div>
            );
          })}
        </div>
      )}

      {/* Goal list */}
      <div className="list">
        <h3>All Goals</h3>
        <div className="items">
          {goals.length === 0 ? (
            <p className="empty-state">No goals yet — add one above!</p>
          ) : goals.map(g => {
            const target   = Number(g.AmountToSave);
            const saved    = Number(g.savedAmount || 0);
            const pct      = Math.min(100, Math.round((saved / target) * 100));
            const daysLeft = Math.ceil((new Date(g.DateCompletion) - new Date()) / 86400000);
            const statusTxt = pct >= 100       ? "✅ Goal achieved!"
              : daysLeft < 0                   ? `⚠️ Overdue by ${Math.abs(daysLeft)} days`
              : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;

            return (
              <div key={g.id} className="goal-item">
                <div className="goal-header">
                  <span className="goal-description">{g.DescriptionName}</span>
                  <span className="goal-amount">{fmt(target)}</span>
                </div>
                <div className="goal-date">{statusTxt} · Due: {g.DateCompletion}</div>
                <div className="progress-wrapper">
                  <div className="progress-bar" style={{ width: `${pct}%` }} />
                </div>
                <div className="progress-text">
                  {fmt(saved)} saved of {fmt(target)} ({pct}%)
                </div>
                <div className="goal-controls">
                  <input
                    type="number" className="update-input"
                    placeholder="Add ₹" min="0" step="0.01"
                    value={saveInputs[g.id] || ""}
                    onChange={e => setSaveInputs(prev => ({ ...prev, [g.id]: e.target.value }))}
                  />
                  <button className="small-btn" onClick={() => handleAddSavings(g.id)}>
                    + Save
                  </button>
                  <button className="delete-btn" onClick={() => deleteGoal(g.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
