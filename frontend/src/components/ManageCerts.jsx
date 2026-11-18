import { useCallback, useEffect, useState } from "react";
import { explainError, fetchLatest } from "../lib/chain.js";

export default function ManageCerts({ contract, canWrite }) {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchLatest(200);
      setList(res.list);
      setTotal(res.total);
    } catch (e) {
      setError(explainError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function revoke(c) {
    if (!window.confirm(`Révoquer le certificat n° ${c.id} (${c.studentName}) ? Cette action est définitive.`)) return;
    setError("");
    setInfo("");
    setRevoking(c.id);
    try {
      const tx = await contract.revokeCertificate(c.id);
      await tx.wait();
      setInfo(`Certificat n° ${c.id} révoqué. Transaction : ${tx.hash}`);
      await load();
    } catch (e) {
      setError(explainError(e));
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Certificats émis</h2>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>Actualiser</button>
      </div>
      {loading && <p className="muted">Chargement…</p>}
      {!loading && list.length === 0 && !error && <p className="muted">Aucun certificat émis pour le moment.</p>}
      {list.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>N°</th><th>Étudiant</th><th>CNE</th><th>Diplôme</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td><td>{c.studentName}</td><td>{c.studentId}</td><td>{c.diplomaTitle}</td>
                  <td><span className={`badge ${c.revoked ? "badge-bad" : "badge-ok"}`}>{c.revoked ? "RÉVOQUÉ" : "VALIDE"}</span></td>
                  <td>
                    {!c.revoked && (
                      <button className="btn btn-danger" onClick={() => revoke(c)} disabled={!canWrite || revoking !== null}>
                        {revoking === c.id ? "Révocation…" : "Révoquer"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > list.length && <p className="muted small">Affichage des {list.length} derniers certificats sur {total}.</p>}
      {info && <p className="notice notice-ok mono small">{info}</p>}
      {error && <p className="notice notice-error">{error}</p>}
    </div>
  );
}
