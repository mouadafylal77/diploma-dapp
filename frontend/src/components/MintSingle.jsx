import { useState } from "react";
import { ethers } from "ethers";
import { explainError } from "../lib/chain.js";

const EMPTY = { studentName: "", studentId: "", diplomaTitle: "", issueDate: "", grade: "", recipientAddress: "" };

export default function MintSingle({ contract, canWrite }) {
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ phase: "idle" }); // idle | signing | pending | done | error
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    if (!f.studentName || !f.studentId || !f.diplomaTitle || !f.issueDate) {
      return setState({ phase: "error", message: "Renseignez le nom, le CNE, l'intitulé du diplôme et la date de délivrance." });
    }
    if (f.recipientAddress && !ethers.isAddress(f.recipientAddress)) {
      return setState({ phase: "error", message: "L'adresse du titulaire n'est pas une adresse Ethereum valide." });
    }
    try {
      setState({ phase: "signing" });
      const tx = await contract.mintCertificate(f.studentName, f.studentId, f.diplomaTitle, f.issueDate, f.grade, f.recipientAddress || ethers.ZeroAddress);
      setState({ phase: "pending", hash: tx.hash });
      const receipt = await tx.wait();
      let id = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed?.name === "CertificateIssued") id = parsed.args.id.toString();
        } catch { /* log d'un autre contrat */ }
      }
      setState({ phase: "done", hash: tx.hash, id });
      setForm(EMPTY);
    } catch (err) {
      setState({ phase: "error", message: explainError(err) });
    }
  }

  const working = state.phase === "signing" || state.phase === "pending";
  return (
    <form className="panel" onSubmit={submit}>
      <h2>Émettre un certificat</h2>
      <div className="grid-2">
        <label>Nom complet de l'étudiant<input value={form.studentName} onChange={set("studentName")} disabled={!canWrite || working} /></label>
        <label>CNE (unique)<input value={form.studentId} onChange={set("studentId")} disabled={!canWrite || working} /></label>
        <label className="span-2">Intitulé du diplôme<input value={form.diplomaTitle} onChange={set("diplomaTitle")} disabled={!canWrite || working} /></label>
        <label>Date de délivrance<input type="date" value={form.issueDate} onChange={set("issueDate")} disabled={!canWrite || working} /></label>
        <label>Mention (facultatif)<input value={form.grade} onChange={set("grade")} disabled={!canWrite || working} /></label>
        <label className="span-2">Adresse du titulaire (facultatif)<input className="mono" placeholder="0x…" value={form.recipientAddress} onChange={set("recipientAddress")} disabled={!canWrite || working} /></label>
      </div>
      <button className="btn" type="submit" disabled={!canWrite || working}>{state.phase === "signing" ? "Confirmez dans MetaMask…" : state.phase === "pending" ? "Transaction en cours…" : "Émettre le certificat"}</button>

      {state.phase === "pending" && <p className="notice">Transaction envoyée : <span className="mono">{state.hash}</span></p>}
      {state.phase === "done" && (
        <p className="notice notice-ok">
          Certificat n° <strong>{state.id ?? "?"}</strong> émis. Hash de la transaction : <span className="mono">{state.hash}</span>
        </p>
      )}
      {state.phase === "error" && <p className="notice notice-error">{state.message}</p>}
    </form>
  );
}
