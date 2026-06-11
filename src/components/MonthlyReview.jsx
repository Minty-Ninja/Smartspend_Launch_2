// src/components/MonthlyReview.jsx
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from "chart.js";
import { useAuth }     from "../context/AuthContext";
import { useExpenses } from "../hooks/useExpenses";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CAT_COLORS = { Food:"#f87171", Miscellaneous:"#60a5fa", Leisure:"#a78bfa" };
const fmt = n => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

export default function MonthlyReview({ onNavigate }) {
  const { user } = useAuth();
  const { expenses } = useExpenses(user?.uid);

  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();

  // Group all expenses by month label for bar chart
  const byMonth = {};
  expenses.forEach(e => {
    const d     = new Date(e.Date);
    const label = d.toLocaleString("default", { month: "short", year: "numeric" });
    byMonth[label] = (byMonth[label] || 0) + Number(e.Amount);
  });

  // This month by category for the legend
  const byCat = {};
  expenses.filter(e => {
    const d = new Date(e.Date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).forEach(e => {
    byCat[e.Category] = (byCat[e.Category] || 0) + Number(e.Amount);
  });

  const barData = {
    labels:   Object.keys(byMonth),
    datasets: [{
      label:           "Total Spent",
      data:            Object.values(byMonth),
      backgroundColor: "#60a5fa",
      borderRadius:    6,
    }],
  };

  return (
    <section className="monthlyInsight" style={{ display: "block" }}>
      <div className="monthly-header">
        <button className="btn" style={{ marginBottom: "1rem" }}
          onClick={() => onNavigate("home")}>
          ← Back to Dashboard
        </button>
        <h2>Monthly Expenditure Overview</h2>
      </div>

      {Object.keys(byMonth).length === 0 ? (
        <p className="empty-state" style={{ textAlign:"center", padding:"2rem" }}>
          No expense data yet.
        </p>
      ) : (
        <div>
          {/* Category legend */}
          <div className="chart-legend">
            {Object.entries(byCat).map(([cat, amt]) => (
              <span key={cat} className="legend-chip">
                <span className="legend-dot"
                  style={{ background: CAT_COLORS[cat] || "#94a3b8",
                           width: 10, height: 10, borderRadius: "50%",
                           display: "inline-block", marginRight: 6 }} />
                {cat}: {fmt(amt)}
              </span>
            ))}
          </div>
          <div className="monthly-chart-wrap">
            <Bar data={barData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true,
                  ticks: { callback: v => "₹" + Number(v).toLocaleString("en-IN") }},
              },
            }} />
          </div>
        </div>
      )}
    </section>
  );
}
