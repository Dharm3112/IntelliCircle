const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const envKeysPath = path.resolve(__dirname, '../packages/server/.env.keys');

console.log("==========================================");
console.log("🔐 IntelliCircle Secrets Rotation Script");
console.log("==========================================\n");

// 1. Generate new RSA keys
console.log("[*] Generating new RS256 key pair (2048-bit)...");
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const privateKeyStr = privateKey.replace(/\n/g, '\\n');
const publicKeyStr = publicKey.replace(/\n/g, '\\n');

// 2. Write to local .env.keys
fs.writeFileSync(envKeysPath, `JWT_PRIVATE_KEY="${privateKeyStr}"\nJWT_PUBLIC_KEY="${publicKeyStr}"\n`);
console.log(`[+] Successfully wrote new keys to ${envKeysPath}`);

console.log("\n==========================================");
console.log("🚨 MANUAL ACTIONS REQUIRED FOR PRODUCTION 🚨");
console.log("==========================================");
console.log("To complete the rotation in Production, update your Render / Hosting environment variables with these new keys:\n");

console.log("--- START JWT_PRIVATE_KEY ---");
console.log(privateKeyStr);
console.log("--- END JWT_PRIVATE_KEY ---\n");

console.log("--- START JWT_PUBLIC_KEY ---");
console.log(publicKeyStr);
console.log("--- END JWT_PUBLIC_KEY ---\n");

console.log("Checklist for Full Secrets Rotation:");
console.log("[ ] 1. Update JWT_PRIVATE_KEY on Render Backend (invalidates all existing user sessions)");
console.log("[ ] 2. Update JWT_PUBLIC_KEY on Render Backend");
console.log("[ ] 3. Rotate GEMINI_API_KEY in Google Cloud Console & update Render Worker");
console.log("[ ] 4. (If compromised) Rotate DATABASE_URL password in Render DB");
console.log("[ ] 5. (If compromised) Rotate REDIS_URL in Upstash");
console.log("[ ] 6. (Optional) Rotate PostHog & Datadog API keys");

console.log("\n⚠️ NOTE: Rotating JWT keys will log out ALL currently active users.");
console.log("==========================================");
