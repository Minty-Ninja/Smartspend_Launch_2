// src/components/Chatbot.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth }     from "../context/AuthContext";
import { useExpenses } from "../hooks/useExpenses";
import { useGoals }    from "../hooks/useGoals";
import { GEMINI_KEY }  from "../firebase/config";


const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
const fmt = n => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

function buildContext(profile, expenses, goals) {
  const name = profile?.name || "User";
  if (!expenses.length && !goals.length)
    return `User "${name}" has no data yet. Encourage them to add expenses and goals.`;

  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();

  const thisMonth = expenses.filter(e => {
    const d = new Date(e.Date || "");
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const total = thisMonth.reduce((s, e) => s + Number(e.Amount || 0), 0);

  const byCat = {};
  thisMonth.forEach(e => {
    byCat[e.Category] = (byCat[e.Category] || 0) + Number(e.Amount || 0);
  });

  const catLines = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .map(([c, v]) => `  • ${c}: ${fmt(v)}`).join("\n") || "  None this month";

  const goalLines = goals.map(g => {
    const target = Number(g.AmountToSave || 0);
    const saved  = Number(g.savedAmount  || 0);
    const pct    = target > 0 ? Math.round((saved / target) * 100) : 0;
    const days   = Math.ceil((new Date(g.DateCompletion) - now) / 86400000);
    return `  • "${g.DescriptionName}": ${fmt(saved)}/${fmt(target)} (${pct}%)` +
      (pct >= 100 ? " ✅" : days < 0 ? ` ⚠️ overdue` : `, ${days}d left`);
  }).join("\n") || "  No goals yet";

  return `USER: ${name}
MONTH: ${now.toLocaleString("default",{month:"long"})} ${year}
TOTAL THIS MONTH: ${fmt(total)} across ${thisMonth.length} transactions
SPENDING BY CATEGORY:\n${catLines}
GOALS:\n${goalLines}`;
}

export default function Chatbot() {
  const { user, profile } = useAuth();
  const { expenses }      = useExpenses(user?.uid);
  const { goals }         = useGoals(user?.uid);

  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const historyRef = useRef([]);
  const msgEndRef  = useRef(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addMsg(role, text) {
    setMessages(prev => [...prev, { role, text }]);
  }

  function handleOpen() {
    setOpen(true);
    if (!welcomed) {
      setWelcomed(true);
      const hour  = new Date().getHours();
      const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
      const name  = profile?.name || "there";
      const now   = new Date();
      const thisM = expenses.filter(e => {
        const d = new Date(e.Date||"");
        return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
      });
      const total  = thisM.reduce((s,e)=>s+Number(e.Amount||0),0);
      const byCat  = {};
      thisM.forEach(e=>{byCat[e.Category]=(byCat[e.Category]||0)+Number(e.Amount||0);});
      const topCat = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];

      let msg = `${greet}, **${name}**! 👋 I'm Smartbot.`;
      if (total > 0) {
        msg += `\n\nThis month you've spent **${fmt(total)}**`;
        if (topCat) msg += ` — mostly on **${topCat[0]}** (${fmt(topCat[1])})`;
        msg += `.\n\nAsk me anything about your spending or goals 👇`;
      } else {
        msg += `\n\nAdd expenses and goals — I'll give you personalised advice! 💡`;
      }
      addMsg("bot", msg);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    addMsg("user", text);
    setSending(true);

    const context  = buildContext(profile, expenses, goals);
    const contents = [];

    if (historyRef.current.length === 0) {
      contents.push({ role:"user", parts:[{ text:
        `You are Smartbot, a friendly finance assistant for SmartSpend.\n` +
        `Give specific advice using ONLY the user's real data. Use ₹. Under 130 words.\n\n` +
        `=== FINANCIAL DATA ===\n${context}`
      }]});
      contents.push({ role:"model", parts:[{ text:"Ready to give personalised advice!" }]});
    }

    historyRef.current.forEach(m =>
      contents.push({ role:m.role, parts:[{ text:m.content }] })
    );
    contents.push({ role:"user", parts:[{ text }]});

    try {
      const res  = await fetch(GEMINI_URL, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          contents,
          generationConfig:{ temperature:0.7, maxOutputTokens:350 },
        }),
      });
      const data  = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim()
        || "Sorry, no response. Try again.";
      addMsg("bot", reply);
      historyRef.current.push({ role:"user",  content:text  });
      historyRef.current.push({ role:"model", content:reply });
    } catch {
      addMsg("bot", "⚠️ Network error. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  if (!user) return null;

  return (
    <>
      {open && (
        <div className="chatbox open">
          <div className="chat-header">
            <span>🤖 Smartbot</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <span dangerouslySetInnerHTML={{ __html:
                  m.text
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\n/g, "<br/>")
                }} />
              </div>
            ))}
            {sending && (
              <div className="msg bot">
                <em style={{ color:"#aaa", fontSize:"12px" }}>Smartbot is typing…</em>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>
          <div className="input-area">
            <input
              value={input} placeholder="Ask Smartbot…"
              disabled={sending} autoComplete="off"
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
            />
            <button onClick={sendMessage} disabled={sending}>
              {sending ? "…" : "Send"}
            </button>
          </div>
        </div>
      )}
      <button className="chat-icon" onClick={handleOpen} aria-label="Open Smartbot">
        💬
      </button>
    </>
  );
}
