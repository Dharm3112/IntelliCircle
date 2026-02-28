const crypto = require('crypto');
const fs = require('fs');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const privateKeyStr = privateKey.replace(/\n/g, '\\n');
const publicKeyStr = publicKey.replace(/\n/g, '\\n');

fs.writeFileSync('packages/server/.env.keys', `JWT_PRIVATE_KEY="${privateKeyStr}"\nJWT_PUBLIC_KEY="${publicKeyStr}"\n`);
console.log('Successfully generated RS256 key pair to .env.keys');
