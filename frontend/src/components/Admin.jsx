import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS, CHAIN_ID_HEX, RPC_URL, explainError, isDeployed } from "../lib/chain.js";
import MintSingle from "./MintSingle.jsx";
import BatchImport from "./BatchImport.jsx";
import ManageCerts from "./ManageCerts.jsx";

const HARDHAT_CHAIN = {
  chainId: CHAIN_ID_HEX,
  chainName: "Hardhat Local",
  rpcUrls: [RPC_URL],
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
};

async function ensureHardhatNetwork() {
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_ID_HEX }] });
  } catch (e) {
    const unknown = e?.code === 4902 || e?.data?.originalError?.code === 4902 || /unrecognized chain/i.test(e?.message || "");
    if (!unknown) throw e;
    await window.ethereum.request({ method: "wallet_addEthereumChain", params: [HARDHAT_CHAIN] });
  }
}

export default function Admin() {
  const [session, setSession] = useState(null); // { address, owner, isOwner, contract }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sub, setSub] = useState("mint");

  const connect = useCallback(async () => {
    setError("");
    if (!window.ethereum) {
      setError("MetaMask n'est pas détecté dans ce navigateur. Installez l'extension MetaMask puis rechargez la page.");
      return;
    }
    setBusy(true);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await ensureHardhatNetwork();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const owner = await contract.owner();
      setSession({ address, owner, isOwner: owner.toLowerCase() === address.toLowerCase(), contract });
    } catch (e) {
      setSession(null);
      setError(explainError(e));
    } finally {
      setBusy(false);
    }
  }, []);

  // Les écouteurs ne sont posés qu'après connexion, depuis l'onglet Administration.
  const connected = !!session;
  useEffect(() => {
    if (!connected || !window.ethereum?.on) return;
    const onAccounts = (accounts) => (accounts.length === 0 ? setSession(null) : connect());
    const onChain = () => connect();
    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccounts);
      window.ethereum.removeListener("chainChanged", onChain);
    };
  }, [connected, connect]);

  if (!isDeployed()) {
    return <p className="notice notice-warn">Aucun contrat déployé. Lancez « npm run deploy:local » dans le dossier contracts, puis rechargez la page.</p>;
  }

  if (!session) {
    return (
      <div className="panel">
        <h2>Espace administrateur</h2>
        <p className="muted">L'émission et la révocation de certificats nécessitent MetaMask, connecté au compte administrateur (compte #0 de Hardhat) sur le réseau Hardhat Local (31337).</p>
        <button className="btn" onClick={connect} disabled={busy}>{busy ? "Connexion…" : "Connecter MetaMask"}</button>
        {error && <p className="notice notice-error">{error}</p>}
      </div>
    );
  }

  const short = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;
  return (
    <section className="stack">
      <div className="panel panel-row">
        <div>
          <p className="muted small">Compte connecté</p>
          <p className="mono">{session.address}</p>
        </div>
        <span className={`badge ${session.isOwner ? "badge-ok" : "badge-bad"}`}>{session.isOwner ? "Administrateur" : "Non autorisé"}</span>
      </div>

      {!session.isOwner && (
        <p className="notice notice-error">
          Ce compte n'est pas l'administrateur du contrat (administrateur : {short(session.owner)}). Dans MetaMask, basculez sur le compte #0 de Hardhat. Les actions d'écriture sont désactivées.
        </p>
      )}
      {error && <p className="notice notice-error">{error}</p>}

      <nav className="subtabs" role="tablist">
        {[["mint", "Émission unitaire"], ["batch", "Import Excel et lots"], ["manage", "Gestion et révocation"]].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={sub === k} className={sub === k ? "active" : ""} onClick={() => setSub(k)}>{label}</button>
        ))}
      </nav>

      {sub === "mint" && <MintSingle contract={session.contract} canWrite={session.isOwner} />}
      {sub === "batch" && <BatchImport contract={session.contract} canWrite={session.isOwner} />}
      {sub === "manage" && <ManageCerts contract={session.contract} canWrite={session.isOwner} />}
    </section>
  );
}
