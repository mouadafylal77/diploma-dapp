const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Déploiement avec :", deployer.address);

  const factory = await hre.ethers.getContractFactory("CertificateRegistry");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  const artifact = await hre.artifacts.readArtifact("CertificateRegistry");
  const outFile = path.join(__dirname, "..", "..", "frontend", "src", "contracts", "CertificateRegistry.json");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(
    outFile,
    JSON.stringify({ address, chainId: 31337, deployer: deployer.address, abi: artifact.abi }, null, 2)
  );

  console.log("CertificateRegistry déployé à :", address);
  console.log("Adresse et ABI écrites dans :", outFile);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
