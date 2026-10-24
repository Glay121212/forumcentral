import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUsername,
  validatePassword,
  validateImageMagicBytes,
  validateUploadSize,
  isValidId,
  hashToken,
} from './security.js';

test('validateUsername accepts valid usernames', () => {
  assert.equal(validateUsername('Thrall_99').valid, true);
  assert.equal(validateUsername('Arthas').valid, true);
  assert.equal(validateUsername('Orc_1').valid, true);
});

test('validateUsername rejects invalid usernames', () => {
  assert.equal(validateUsername('ab').valid, false); // too short
  assert.equal(validateUsername('this_username_is_way_too_long_for_forums').valid, false); // too long
  assert.equal(validateUsername('invalid-user!').valid, false); // invalid characters
  assert.equal(validateUsername('user name').valid, false); // space
});

test('validatePassword validates strong password criteria', () => {
  // Valid password (12+ chars, uppercase, lowercase, number, symbol, no username)
  assert.equal(validatePassword('Azeroth@2026Secure!', 'Thrall').valid, true);

  // Too short
  assert.equal(validatePassword('Short1!', 'Thrall').valid, false);

  // Missing uppercase
  assert.equal(validatePassword('azeroth@2026secure!', 'Thrall').valid, false);

  // Missing lowercase
  assert.equal(validatePassword('AZEROTH@2026SECURE!', 'Thrall').valid, false);

  // Missing number
  assert.equal(validatePassword('Azeroth@SecretPass!', 'Thrall').valid, false);

  // Missing symbol
  assert.equal(validatePassword('Azeroth2026SecurePass', 'Thrall').valid, false);

  // Contains username
  assert.equal(validatePassword('ThrallIsAwesome2026!', 'Thrall').valid, false);
});

test('validateImageMagicBytes detects genuine JPG, PNG, GIF, and WebP', () => {
  // JPG
  const jpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const jpgRes = validateImageMagicBytes(jpgBuffer);
  assert.equal(jpgRes.valid, true);
  assert.equal(jpgRes.ext, 'jpg');

  // PNG
  const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const pngRes = validateImageMagicBytes(pngBuffer);
  assert.equal(pngRes.valid, true);
  assert.equal(pngRes.ext, 'png');

  // GIF
  const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00]);
  const gifRes = validateImageMagicBytes(gifBuffer);
  assert.equal(gifRes.valid, true);
  assert.equal(gifRes.ext, 'gif');

  // WebP
  const webpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x20, 0x00, 0x00, 0x00, // file size
    0x57, 0x45, 0x42, 0x50, // WEBP
  ]);
  const webpRes = validateImageMagicBytes(webpBuffer);
  assert.equal(webpRes.valid, true);
  assert.equal(webpRes.ext, 'webp');

  // Rejects SVG pretending to be image
  const fakeSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  assert.equal(validateImageMagicBytes(fakeSvg).valid, false);

  // Rejects malicious executable script
  const maliciousScript = Buffer.from('#!/bin/bash\necho dangerous');
  assert.equal(validateImageMagicBytes(maliciousScript).valid, false);
});

test('validateUploadSize enforces limits for members and guests', () => {
  // Member: up to 3MB
  assert.equal(validateUploadSize(2 * 1024 * 1024, false).valid, true);
  assert.equal(validateUploadSize(4 * 1024 * 1024, false).valid, false);

  // Guest: up to 1MB
  assert.equal(validateUploadSize(900 * 1024, true).valid, true);
  assert.equal(validateUploadSize(1.5 * 1024 * 1024, true).valid, false);
});

test('isValidId enforces URL safe IDs', () => {
  assert.equal(isValidId('category-gaming_123'), true);
  assert.equal(isValidId('forum-abc'), true);
  assert.equal(isValidId('../evil-path'), false);
  assert.equal(isValidId('drop table users;'), false);
});

test('hashToken computes deterministic SHA-256 hex string', () => {
  const hash1 = hashToken('session_sample_token');
  const hash2 = hashToken('session_sample_token');
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
});
