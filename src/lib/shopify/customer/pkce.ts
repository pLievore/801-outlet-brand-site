import { createHash, randomBytes } from 'node:crypto';

export function generateRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** RFC 7636 S256: BASE64URL(SHA256(ASCII(verifier))). */
export function codeChallengeFromVerifier(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}
