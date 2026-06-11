// src/components/ExpenseTracker.jsx
import { useState }  from "react";
import { Doughnut }  from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
} from "chart.js";
import { useAuth }     from "../context/AuthContext";
import { useExpenses } from "../hooks/useExpenses";

ChartJS.register(ArcElement, Tooltip, Legend);

const CAT_COLORS = {
  Food: "#f87171", Miscellaneous: "#60a5fa", Leisure: "#a78bfa",
};

const fmt   = n => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const today = () => new Date().toISOString().split("T")[0];

export default function ExpenseTracker() {
  const { user }    = useAuth();
  const { expenses, addExpense, deleteExpense } = useExpenses(user?.uid);

  const [amount,      setAmount]      = useState("");
  const [description, setDescription] = useState("");
  const [date,        setDate]        = useState(today());
  const [category,    setCategory]    = useState("Food");

  const total = expenses.reduce((s, e) => s + Number(e.Amount), 0);

  // Build chart data from expenses
  const byCat = {};
  expenses.forEach(e => {
    byCat[e.Category] = (byCat[e.Category] || 0) + Number(e.Amount);
  });
  const chartData = {
    labels:   Object.keys(byCat),
    datasets: [{
      data:            Object.values(byCat),
      backgroundColor: Object.keys(byCat).map(k => CAT_COLORS[k] || "#94a3b8"),
      borderWidth: 2,
    }],
  };

  async function handleSubmit(e) {
    e.preventDefault();
    await addExpense({
      Amount: parseFloat(amount), Description: description,
      Date: date, Category: category,
    });
    setAmount(""); setDescription(""); setDate(today()); setCategory("Food");
  }

  return (
    <section className="card" id="expense-section">
      <h2>Expense Tracker</h2>

      {/* Add expense form */}
      <form className="form" onSubmit={handleSubmit}>
        <label>Amount (₹):</label>
        <input type="number" placeholder="e.g. 250" min="0" step="0.01" required
          value={amount} onChange={e => setAmount(e.target.value)} />

        <label>Description:</label>
        <input type="text" placeholder="e.g. Lunch" required
          value={description} onChange={e => setDescription(e.target.value)} />

        <label>Date:</label>
        <input type="date" required
          value={date} onChange={e => setDate(e.target.value)} />

        <label>Category:</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="Food">🍔 Food</option>
          <option value="Miscellaneous">📦 Miscellaneous</option>
          <option value="Leisure">🎬 Leisure</option>
        </select>

        <button type="submit" className="btn">Add Expense</button>
      </form>

      {/* Expense list */}
      <div className="list">
        <h3>All Expenses</h3>
        <div className="items">
          {expenses.length === 0 ? (
            <p className="empty-state">No expenses yet — add one above!</p>
          ) : (
            <>
              {expenses.map(e => (
                <div key={e.id} className="expense-item">
                  <div className="expense-header">
                    <span className="expense-description">{e.Description}</span>
                    <span className="expense-amount">{fmt(e.Amount)}</span>
                  </div>
                  <div className="expense-meta">
                    <span className={`category-badge category-${(e.Category||"miscellaneous").toLowerCase()}`}>
                      {e.Category}
                    </span>
                    <span>{e.Date}</span>
                    <button className="delete-btn" onClick={() => deleteExpense(e.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <div className="total-section">
                Total: <span className="total-amount">{fmt(total)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pie chart */}
      {Object.keys(byCat).length > 0 && (
        <div className="chart-container">
          <h3>Expenses by Category</h3>
          <div style={{ maxWidth: 300, margin: "0 auto" }}>
            <Doughnut data={chartData} options={{
              plugins: { legend: { position: "bottom" } },
              cutout: "55%",
            }} />
          </div>
        </div>
      )}
    </section>
  );
}
