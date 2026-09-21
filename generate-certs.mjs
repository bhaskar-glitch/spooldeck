import forge from "node-forge";
import fs from "fs";
import os from "os";

// Accept IP from command line, or auto-detect the machine's LAN IP
let ip = process.argv[2];

if (!ip) {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const iface of nets[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
    if (ip) break;
  }
}

if (!ip) {
  console.error("Could not detect LAN IP. Pass it as an argument:");
  console.error("  node generate-certs.mjs 192.168.1.100");
  process.exit(1);
}

console.log(`Generating Root CA...`);
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = "01";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
const attrs = [
  { name: "commonName", value: "SpoolDeck Local CA" },
  { name: "organizationName", value: "SpoolDeck Offline" }
];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([{ name: "basicConstraints", cA: true }]);
cert.sign(keys.privateKey, forge.md.sha256.create());

const pemCA = forge.pki.certificateToPem(cert);
fs.writeFileSync("rootCA.crt", pemCA);
console.log("Saved rootCA.crt");

console.log(`Generating Server Certificate for ${ip}...`);
const serverKeys = forge.pki.rsa.generateKeyPair(2048);
const serverCert = forge.pki.createCertificate();
serverCert.publicKey = serverKeys.publicKey;
serverCert.serialNumber = "02";
serverCert.validity.notBefore = new Date();
serverCert.validity.notAfter = new Date();
serverCert.validity.notAfter.setFullYear(serverCert.validity.notBefore.getFullYear() + 10);
const serverAttrs = [
  { name: "commonName", value: ip },
  { name: "organizationName", value: "SpoolDeck Server" }
];
serverCert.setSubject(serverAttrs);
serverCert.setIssuer(cert.subject.attributes);
serverCert.setExtensions([
  { name: "basicConstraints", cA: false },
  {
    name: "subjectAltName",
    altNames: [
      { type: 7, ip: ip },
      { type: 2, value: "localhost" }
    ]
  }
]);
serverCert.sign(keys.privateKey, forge.md.sha256.create());

fs.writeFileSync("server.crt", forge.pki.certificateToPem(serverCert));
fs.writeFileSync("server.key", forge.pki.privateKeyToPem(serverKeys.privateKey));
console.log(`Saved server.crt and server.key for ${ip}`);
console.log("");
console.log("Next steps:");
console.log("  1. Install rootCA.crt as a Trusted Root Certificate on your devices");
console.log(`  2. Access SpoolDeck at https://${ip}:8080`);
