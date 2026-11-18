import { useCallback, useEffect, useState } from "react";
import CertificateCard from "./CertificateCard.jsx";
import { explainError, fetchCertificate, fetchLatest, isDeployed } from "../lib/chain.js";

export default function PublicVerify() {
  const [input, setInput] = useState("");
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState({ total: 0, list: [] });
  const [latestError, setLatestError] = useState("");

  const loadLatest = useCallback(async () => {
    if (!isDeployed()) return;
    try {
      setLatest(await fetchLatest(10));
      setLatestError("");
    } catch (e) {
      setLatestError(explainError(e));
    }
  }, []);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  async function verify(rawId) {
    const value = String(rawId).trim();
    setCert(null);
    setError("");
    if (!/^\d+$/.test(value) || Number(value) < 1) {
      setError("Saisissez un identifiant numérique supérieur ou égal à 1 (par exemple 1, 2, 3).");
      return;
    }
    setLoading(true);
    try {
      setCert(await fetchCertificate(BigInt(value)));
    } catch (e) {
      setError(explainError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="stack">
      <div className="panel">
        <h2>Vérifier un diplôme</h2>
        <p className="muted">Saisissez le numéro de certificat figurant sur le diplôme. Aucune connexion ni portefeuille n'est nécessaire.</p>
        {!isDeployed() && (
          <p className="notice notice-warn">Aucun contrat déployé. Lancez « npm run deploy:local » dans le dossier contracts, puis rechargez la page.</p>
        )}
        <div className="inline-form">
          <input
            inputMode="numeric"
            placeholder="Numéro du certificat"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verify(input)}
            aria-label="Numéro du certificat"
          />
          <button className="btn" onClick={() => verify(input)} disabled={loading || !isDeployed()}>
            {loading ? "Vérification…" : "Vérifier"}
          </button>
        </div>
        {error && <p className="notice notice-error">{error}</p>}
      </div>

      {cert && <CertificateCard cert={cert} />}

      <div className="panel">
        <div className="panel-head">
          <h2>Derniers certificats émis</h2>
          <button className="btn btn-ghost" onClick={loadLatest}>Actualiser</button>
        </div>
        {latestError && <p className="notice notice-error">{latestError}</p>}
        {!latestError && latest.list.length === 0 && <p className="muted">Aucun certificat émis pour le moment.</p>}
        {latest.list.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>N°</th><th>Étudiant</th><th>Diplôme</th><th>Date</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {latest.list.map((c) => (
                  <tr key={c.id} className="clickable" onClick={() => { setInput(String(c.id)); verify(c.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    <td>{c.id}</td>
                    <td>{c.studentName}</td>
                    <td>{c.diplomaTitle}</td>
                    <td>{c.issueDate}</td>
                    <td><span className={`badge ${c.revoked ? "badge-bad" : "badge-ok"}`}>{c.revoked ? "RÉVOQUÉ" : "VALIDE"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {latest.total > 0 && <p className="muted small">{latest.total} certificat(s) au total.</p>}
      </div>
    </section>
  );
}
