// src/App.jsx
import { useState }                from "react";
import { AuthProvider, useAuth }   from "./context/AuthContext";
import AuthSection   from "./components/AuthSection";
import Dashboard     from "./components/Dashboard";
import MonthlyReview from "./components/MonthlyReview";
import Chatbot       from "./components/Chatbot";

function AppContent() {
  const { user } = useAuth();
  const [view, setView] = useState("home"); // "home" | "monthly"

  // Not logged in → show auth
  if (!user) return <AuthSection />;

  // Logged in → show correct view + chatbot
  return (
    <>
      {view === "monthly"
        ? <MonthlyReview onNavigate={setView} />
        : <Dashboard     onNavigate={setView} />
      }
      <Chatbot />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
