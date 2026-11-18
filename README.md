# Registre des diplômes — dApp de certification sur blockchain locale

Smart contract Solidity (Hardhat, OpenZeppelin `Ownable`) et application React + Vite + Ethers.js v6.
Réseau : Hardhat local, Chain ID 31337, RPC `http://127.0.0.1:8545`.

## Prérequis

Node.js 18 ou plus récent. MetaMask n'est nécessaire que pour l'onglet Administration.

## Installation (une seule fois)

```bash
cd contracts && npm install
cd ../frontend && npm install
```

## Démarrage en local (3 commandes)

Terminal 1, dossier `contracts/` : nœud local

```bash
npx hardhat node
```

Terminal 2, dossier `contracts/` : déploiement (écrit l'adresse et l'ABI dans `frontend/src/contracts/CertificateRegistry.json`)

```bash
npm run deploy:local
```

Terminal 3, dossier `frontend/` : application

```bash
npm run dev
```

Ouvrez http://localhost:5173.

## Utilisation

- **Vérification publique** (page d'accueil) : lecture seule via `JsonRpcProvider`, sans MetaMask. Saisissez `1`, `2`, etc.
- **Administration** : cliquez sur l'onglet pour afficher « Connecter MetaMask ». Le réseau Hardhat Local est ajouté automatiquement si absent. Utilisez le compte #0 de Hardhat (administrateur) :
  importez dans MetaMask la clé privée affichée par `hardhat node` pour « Account #0 ».
- **Import Excel / CSV** : essayez `frontend/etudiants_test.csv`. Colonnes : `studentName, studentId, diplomaTitle, issueDate, grade, recipientAddress`. Émission par lots de 10 maximum.

## Si vous redémarrez le nœud Hardhat

1. Relancez `npm run deploy:local` (nouvelle chaîne, contrat redéployé).
2. Dans MetaMask : Paramètres > Avancé > « Effacer les données de l'onglet d'activité ». Sans cela, l'erreur `Nonce too high` apparaît ; l'application l'explique en français.
3. Rechargez la page.

## Structure

```
contracts/   Hardhat : contracts/CertificateRegistry.sol, scripts/deploy.js
frontend/    React + Vite : src/components, src/lib/chain.js, etudiants_test.csv
```
