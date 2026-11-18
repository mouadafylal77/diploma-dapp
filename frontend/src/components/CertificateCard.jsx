import { formatTimestamp } from "../lib/chain.js";

export default function CertificateCard({ cert }) {
  return (
    <article className={`diploma ${cert.revoked ? "is-revoked" : ""}`}>
      <header className="diploma-head">
        <span className="diploma-ref">Certificat n° {cert.id}</span>
        <span className={`badge ${cert.revoked ? "badge-bad" : "badge-ok"}`}>{cert.revoked ? "RÉVOQUÉ" : "VALIDE"}</span>
      </header>
      <p className="diploma-lead">Il est certifié que</p>
      <h3 className="diploma-name">{cert.studentName}</h3>
      <p className="diploma-lead">est titulaire du diplôme</p>
      <h4 className="diploma-title">{cert.diplomaTitle}</h4>
      <dl className="diploma-meta">
        <div><dt>CNE</dt><dd>{cert.studentId}</dd></div>
        <div><dt>Date de délivrance</dt><dd>{cert.issueDate}</dd></div>
        {cert.grade && <div><dt>Mention</dt><dd>{cert.grade}</dd></div>}
        <div><dt>Enregistré sur la blockchain le</dt><dd>{formatTimestamp(cert.issuedAt)}</dd></div>
        {cert.recipientAddress && <div className="wide"><dt>Adresse du titulaire</dt><dd className="mono">{cert.recipientAddress}</dd></div>}
      </dl>
      {cert.revoked && <p className="diploma-warning">Ce certificat a été révoqué par l'administration et n'est plus valable.</p>}
    </article>
  );
}
