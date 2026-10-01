import { describe, it, expect } from 'vitest';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

describe('Auth & Cryptography Engine (Argon2id + SHA-256 Tokens)', () => {
  it('should hash and verify passwords using Argon2id algorithm with OWASP parameters', async () => {
    const rawPassword = 'SuperSecretSecurePassword!123';

    // Hash with OWASP recommended Argon2id parameters
    const hash = await argon2.hash(rawPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);

    // Verify correct password
    const isMatch = await argon2.verify(hash, rawPassword);
    expect(isMatch).toBe(true);

    // Reject wrong password
    const isWrongMatch = await argon2.verify(hash, 'IncorrectPassword456!');
    expect(isWrongMatch).toBe(false);
  });

  it('should generate secure SHA-256 token hashes for database session storage', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    expect(rawToken.length).toBe(64);

    const hash1 = crypto.createHash('sha256').update(rawToken).digest('hex');
    const hash2 = crypto.createHash('sha256').update(rawToken).digest('hex');

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });
});
