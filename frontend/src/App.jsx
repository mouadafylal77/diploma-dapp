import { useState } from "react";
import PublicVerify from "./components/PublicVerify.jsx";
import Admin from "./components/Admin.jsx";

export default function App() {
  const [tab, setTab] = useState("public");
  const [adminOpened, setAdminOpened] = useState(false);

  const open = (t) => {
    if (t === "admin") setAdminOpened(true);
    setTab(t);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div>
            <h1>Registre des diplômes</h1>
            <p>Certification académique sur blockchain</p>
          </div>
          <nav className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === "public"} className={tab === "public" ? "active" : ""} onClick={() => open("public")}>Vérification publique</button>
            <button role="tab" aria-selected={tab === "admin"} className={tab === "admin" ? "active" : ""} onClick={() => open("admin")}>Administration</button>
          </nav>
        </div>
      </header>
      <main className="content">
        {tab === "public" && <PublicVerify />}
        {/* Monté uniquement après le premier clic : aucun appel à window.ethereum avant. */}
        {adminOpened && <div hidden={tab !== "admin"}><Admin /></div>}
      </main>
    </div>
  );
}
