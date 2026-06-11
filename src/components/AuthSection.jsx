// src/components/AuthSection.jsx
import { useState } from "react";
import { useAuth, COUNTRIES } from "../context/AuthContext";

export default function AuthSection() {
  const { signup, login } = useAuth();

  const [isSignup, setIsSignup] = useState(true);
  const [status,   setStatus]   = useState({ msg: "", err: false });
  const [loading,  setLoading]  = useState(false);

  // Signup fields
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [phone,    setPhone]    = useState("");
  const [country,  setCountry]  = useState("");

  // Login fields
  const [lEmail, setLEmail] = useState("");
  const [lPass,  setLPass]  = useState("");

  function showStatus(msg, err = false) { setStatus({ msg, err }); }

  async function handleSignup(e) {
    e.preventDefault();
    if (!country) { showStatus("Please select your country.", true); return; }
    setLoading(true);
    try {
      await signup(name, email, password, phone, country);
      showStatus("Account created! Welcome to SmartSpend 💸");
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "This email is already registered."
        : err.code === "auth/weak-password"
        ? "Password must be at least 8 characters."
        : err.message;
      showStatus(msg, true);
    } finally { setLoading(false); }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(lEmail, lPass);
    } catch {
      showStatus("Incorrect email or password.", true);
    } finally { setLoading(false); }
  }

  return (
    <section className="screen auth-screen">
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>SmartSpend 💸</h1>
          <p id="auth-message">
            {isSignup ? "Create an account to start tracking smarter" : "Welcome back! Log in to continue."}
          </p>

          {/* ── SIGNUP FORM ── */}
          {isSignup && (
            <form className="auth-form" onSubmit={handleSignup}>
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" required
                value={name} onChange={e => setName(e.target.value)} />

              <label>Email</label>
              <input type="email" placeholder="Enter your email" required
                value={email} onChange={e => setEmail(e.target.value)} />

              <label>Password</label>
              <input type="password" placeholder="Min 8 characters" required minLength={8}
                value={password} onChange={e => setPassword(e.target.value)} />

              <label>Phone (for account recovery)</label>
              <input type="tel" placeholder="+91 99999 99999" required
                value={phone} onChange={e => setPhone(e.target.value)} />
              <small className="field-hint">Include country code e.g. +91</small>

              <label>Country</label>
              <select required value={country} onChange={e => setCountry(e.target.value)}>
                <option value="">— Select Country —</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Creating…" : "Sign Up"}
              </button>
            </form>
          )}

          {/* ── LOGIN FORM ── */}
          {!isSignup && (
            <form className="auth-form" onSubmit={handleLogin}>
              <label>Email</label>
              <input type="email" placeholder="Enter your email" required
                value={lEmail} onChange={e => setLEmail(e.target.value)} />

              <label>Password</label>
              <input type="password" placeholder="Enter your password" required
                value={lPass} onChange={e => setLPass(e.target.value)} />

              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Signing in…" : "Log In"}
              </button>
            </form>
          )}

          {/* Status message */}
          {status.msg && (
            <div className="status-box" style={{
              display:    "block",
              background: status.err ? "#fee2e2" : "#e3f8e8",
              color:      status.err ? "#991b1b" : "#15803d",
              border:     `1px solid ${status.err ? "#fca5a5" : "#86efac"}`,
            }}>
              {status.msg}
            </div>
          )}

          <p className="login-text">
            <span>{isSignup ? "Already have an account?" : "Don't have an account?"}</span>{" "}
            <a href="#" onClick={e => {
              e.preventDefault();
              setIsSignup(s => !s);
              setStatus({ msg: "", err: false });
            }}>
              {isSignup ? "Log in" : "Sign up"}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
