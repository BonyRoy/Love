import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ContentProvider } from "./context/ContentContext.jsx";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";
import { initSupabase } from "./supabase/config.js";
import { enablePageProtection } from "./utils/pageProtection.js";
import { hardenClient } from "./utils/security.js";

enablePageProtection();
hardenClient();

function BootScreen({ message, error }) {
  return (
    <div className="app-error">
      <p>{error ? "Could not start the app." : "Loading..."}</p>
      {error && <p>{error}</p>}
      {!error && message && <p>{message}</p>}
    </div>
  );
}

function BootstrapApp() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initSupabase()
      .then(() => setReady(true))
      .catch((err) => {
        setError(err?.message ?? "Bootstrap failed.");
      });
  }, []);

  if (error) return <BootScreen error={error} />;
  if (!ready) return <BootScreen message="Securing connection..." />;

  return (
    <BrowserRouter>
      <ContentProvider>
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </ContentProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BootstrapApp />
  </StrictMode>,
);
