#!/usr/bin/env node
/**
 * Standalone dev tool — NOT part of the app bundle, run manually on your
 * machine with `node scripts/getFcmAccessToken.js`.
 *
 * Exchanges the Firebase service account key for a short-lived OAuth2 access
 * token, which can be used as a Bearer token in Thunder Client/Postman to
 * POST directly to the FCM HTTP v1 API and trigger a real push to a device.
 *
 * The service account private key never leaves this script / your machine —
 * it must NEVER be bundled into the mobile app (anyone could extract it from
 * a compiled app and send pushes as your project).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEY_PATH = path.join(
  __dirname,
  '../src/core/firebase-test/ariseapp-6adce-a5b07d039116.json',
);

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function main() {
  const serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({alg: 'RS256', typ: 'JWT'}));
  const claims = base64url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: serviceAccount.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signature = crypto
    .createSign('RSA-SHA256')
    .update(`${header}.${claims}`)
    .sign(serviceAccount.private_key)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('Failed to get access token:', json);
    process.exit(1);
  }

  console.log('\nAccess token (valid ~1 hour):\n');
  console.log(json.access_token);
  console.log('\nUse it in Thunder Client like this:\n');
  console.log(`POST https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`);
  console.log('Headers:');
  console.log('  Authorization: Bearer <paste the token above>');
  console.log('  Content-Type: application/json');
  console.log('Body:');
  console.log(
    JSON.stringify(
      {
        message: {
          token: '<DEVICE_FCM_TOKEN — copy from the app console log>',
          notification: {
            title: 'Real Firebase push',
            body: 'Sent directly via FCM HTTP v1 API',
          },
        },
      },
      null,
      2,
    ),
  );
}

main();
