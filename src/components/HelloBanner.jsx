// src/components/HelloBanner.jsx
import { useAuth } from "../context/AuthContext";

export default function HelloBanner() {
  const { user, profile, initials, greeting } = useAuth();

  if (!user) return null; // show nothing when logged out

  const name = profile?.name || "User";

  return (
    <div className="hello-banner">
      <div className="hello-avatar">{initials}</div>
      <div className="hello-text">
        <span className="hello-greeting">{greeting}, {name}! 👋</span>
        <span className="hello-sub">Ready to track smarter today?</span>
      </div>
    </div>
  );
}
