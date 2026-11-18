# 📘 Notes Techniques & Journal de Développement — Registre des Diplômes (dApp)

> Ce document récapitule l'architecture de l'application, les outils utilisés, leur rôle précis, ainsi que le guide de démarrage et de résolution d'erreurs.

---

## 🔵 1. Schémas de Fonctionnement

### 🟢 Mode Public (Consultation & Vérification)

Accès direct sans portefeuille ni MetaMask. La lecture se fait via la passerelle RPC locale.

```
[ Visiteur / Recruteur ]
        │
        ▼ (Page d'accueil : /)
[ Frontend React (Virtual DOM) ]
        │
        ▼ (ethers.JsonRpcProvider - Lecture seule sans wallet)
[ Nœud Hardhat Local : http://127.0.0.1:8545 ]
        │
        ▼
[ Smart Contract : CertificateRegistry.sol ]
```

### 🟠 Mode Administration (Émission & Révocation)

Connexion obligatoire via MetaMask avec le compte propriétaire (Account #0 / Owner).

```
[ Administrateur ]
        │
        ▼ (Onglet : Administration)
[ Frontend React ] <───> [ Extension MetaMask (Chain ID 31337) ]
                                 │
                                 ▼ (ethers.BrowserProvider - Signature Tx)
                   [ Nœud Hardhat Local : http://127.0.0.1:8545 ]
                                 │
                                 ▼
                   [ Smart Contract : CertificateRegistry.sol ]
```

---

## 🔵 2. Définition des Outils & Logiciels

### 🟣 Focus Principal : Node.js & npm

#### 🟢 Node.js :

- 🟢 **Définition :** Moteur d'exécution JavaScript hors navigateur (basé sur le moteur V8 de Google Chrome et la bibliothèque système libuv). Il permet d'exécuter du code JavaScript directement sur le système d'exploitation (Kubuntu), lui donnant accès au disque dur, à la mémoire RAM et aux ports réseau.
- 🟡 **Pourquoi il est indispensable :** Hardhat et Vite sont entièrement développés en JavaScript/TypeScript. Sans Node.js installé sur la machine, Linux ne peut pas exécuter hardhat ni démarrer le serveur vite (les fichiers .js restent du simple texte brut).
- 🟠 **Exemple d'utilisation :** Lorsque l'on lance `npm run deploy:local`, c'est Node.js qui exécute le script `deploy.js`, établit la connexion avec la blockchain locale et sauvegarde l'adresse du contrat dans `CertificateRegistry.json`.

#### 🟢 npm (Node Package Manager) :

- 🟢 **Définition :** Le gestionnaire de paquets officiel de Node.js.
- 🟠 **Exemple d'utilisation :** La commande `npm install` télécharge les bibliothèques dépendantes (hardhat, ethers, xlsx, react) depuis les dépôts distants vers le dossier local `node_modules/`.

---

### 🟣 Partie Frontend & Interface Web (`frontend/`)

#### 🔷 React (Single Page Application - SPA) :

- 🟢 **Définition :** Framework d'interface basé sur des composantes et un Virtual DOM. Au lieu de recharger toute la page HTML lors d'une action, React compare l'état virtuel et met à jour de façon chirurgicale uniquement l'élément modifié (ex. le texte du diplôme ou le statut d'un bouton).
- 🟠 **Exemple d'utilisation :** Quand un utilisateur saisit un numéro de certificat et clique sur Vérifier, la carte du diplôme s'actualise en quelques millisecondes sans clignotement ni rechargement de la page web.

#### 🔷 Vite :

- 🟢 **Définition :** Outil de compilation et serveur de développement ultra-rapide fonctionnant sous Node.js.
- 🟡 **Rôle de compilation (JSX $\rightarrow$ JS) :** React utilise la syntaxe .jsx (mélange de balises HTML et de code JavaScript). Comme les navigateurs ne savent pas lire le JSX natif, Vite traduit à la volée le JSX en JavaScript standard (`React.createElement(...)`) et regroupe l'ensemble des modules pour le navigateur.

#### 🔷 Ethers.js (v6) :

- 🟢 **Définition :** Bibliothèque faisant le pont entre l'application web JavaScript et le Smart Contract sur Ethereum.
- 🟡 **Deux modes d'utilisation dans le projet :**
  - 🔹 **Mode lecture (JsonRpcProvider) :** Interroge directement `http://127.0.0.1:8545` pour lire les diplômes publiquement sans demander MetaMask.
  - 🔸 **Mode écriture (BrowserProvider) :** Se connecte à `window.ethereum` (MetaMask) pour demander la signature de l'administrateur lors des opérations d'émission ou de révocation.

#### 🔷 SheetJS (xlsx) :

- 🟢 **Définition :** Bibliothèque d'analyse de fichiers tableurs intégrée au navigateur.
- 🟠 **Exemple d'utilisation :** Lit le fichier `etudiants_test.csv` dans l'onglet d'administration, valide la structure des données et prépare le tableau pour l'envoi groupé (`mintBatch`).

#### 🔷 MetaMask :

- 🟢 **Définition :** Portefeuille sous forme d'extension navigateur qui sécurise la clé privée de l'administrateur et signe chaque transaction modifiant l'état de la blockchain.

---

### 🟣 Partie Blockchain & Smart Contracts (`contracts/`)

#### 🔶 Solidity (^0.8.24) :

- 🟢 **Définition :** Langage orienté contrat compilé en bytecode pour la machine virtuelle Ethereum (EVM).
- 🟠 **Exemple d'utilisation :** Le fichier `CertificateRegistry.sol` contient les structures de données (Certificate), le registre (mapping) et la fonction `revokeCertificate(id)`.

#### 🔶 Hardhat (`npx hardhat node`) :

- 🟢 **Définition :** Environnement de simulation d'une blockchain Ethereum locale (Chain ID 31337) s'exécutant entièrement en mémoire RAM via Node.js.
- 🟠 **Exemple d'utilisation :** Fournit 20 comptes de test crédités de 10 000 ETH virtuels pour exécuter et tester la dApp localement sans frais réels.

#### 🔶 OpenZeppelin (Ownable v5) :

- 🟢 **Définition :** Bibliothèque de sécurité standardisée pour contrats Solidity.
- 🟠 **Exemple d'utilisation :** Restreint l'accès aux fonctions sensibles via le modificateur `onlyOwner`. Seule l'adresse Account #0 ayant déployé le contrat a le droit d'émettre ou de révoquer un diplôme.

---

## 🔵 3. Synthèse des Commandes Terminal

| Commande | Répertoire | Rôle & Explication |
|---|---|---|
| 🟢 `npm install` | `contracts/` & `frontend/` | Télécharge l'ensemble des dépendances nécessaires dans `node_modules/`. |
| 🟢 `npx hardhat node` | `contracts/` | **Terminal 1 :** Lance la blockchain locale Hardhat sur `http://127.0.0.1:8545` en mémoire RAM. |
| 🟡 `npm run deploy:local` | `contracts/` | **Terminal 2 :** Compile le contrat Solidity, le déploie sur Hardhat et met à jour `CertificateRegistry.json`. |
| 🔵 `npm run dev` | `frontend/` | **Terminal 3 :** Lance le serveur Vite sous Node.js et rend l'interface accessible sur `http://localhost:5173`. |
| 🔴 `npm run deploy:local && npm run deploy:local` | `contracts/` | **Rattrapage Nonce :** Fait avancer le compteur de transactions de Hardhat pour le réaligner instantanément avec MetaMask. |

---

## 🔴 4. Problème de Nonce & Solutions

### 🔴 Origine du problème

Chaque transaction d'un compte possède un numéro séquentiel appelé **Nonce** (0, 1, 2, ...).
`npx hardhat node` conserve son état en mémoire RAM. À chaque redémarrage de l'ordinateur ou du terminal, Hardhat réinitialise son compteur à 1. En revanche, l'extension MetaMask conserve en mémoire le dernier nonce utilisé lors de la session précédente (ex. nonce 3).

> 🚨 **Symptômes :** Erreur `Nonce too high. Expected nonce to be 1 but got 3` ou `could not coalesce error`.

### ❌ Ce qui NE fonctionne PAS

- ❌ **Réimporter le compte dans MetaMask :** Inefficace car la clé privée de Account #0 reste identique.
- ❌ **Passer sur Account #1 :** Bloqué par OpenZeppelin (`OwnableUnauthorizedAccount`), car seul Account #0 a les privilèges d'administration.

### ✅ Solutions qui fonctionnent

- ✅ **Rattrapage rapide côté Hardhat :**
  Identifier l'écart de nonce dans la console navigateur (F12), exécuter `npm run deploy:local` autant de fois que nécessaire pour faire avancer le nonce d'Hardhat, puis rafraîchir la page (F5).
- ✅ **Réinitialisation du nonce dans MetaMask :**
  Basculer sur le réseau Hardhat Local $\rightarrow$ Paramètres > Developer tools > Delete activity and nonce data $\rightarrow$ Delete.
