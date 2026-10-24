import crypto from 'crypto';

/**
 * Validates a username according to ForumCentral rules:
 * 3-20 characters, letters, numbers, and underscore only.
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required.' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, error: 'Username must be between 3 and 20 characters.' };
  }
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!regex.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  return { valid: true, username: trimmed };
}

/**
 * Validates a password according to security rules:
 * 12-72 characters, uppercase, lowercase, number, symbol,
 * not containing the username.
 */
export function validatePassword(password, username = '') {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 12 || password.length > 72) {
    return { valid: false, error: 'Password must be between 12 and 72 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number.' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one symbol (!@#$%^&* etc.).' };
  }
  if (username && username.length >= 3 && password.toLowerCase().includes(username.toLowerCase())) {
    return { valid: false, error: 'Password must not contain your username.' };
  }
  return { valid: true };
}

/**
 * Validates image buffer by inspecting its magic bytes.
 * Supports strictly JPG, PNG, GIF, and WebP.
 * Rejects SVGs, executables, HTML, and any other file type.
 */
export function validateImageMagicBytes(buffer) {
  if (!buffer || !(buffer instanceof Buffer) || buffer.length < 12) {
    return { valid: false, error: 'File is empty or corrupted.' };
  }

  // JPG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: 'jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, ext: 'png', mime: 'image/png' };
  }

  // GIF: GIF87a or GIF89a (47 49 46 38 37 61 or 47 49 46 38 39 61)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { valid: true, ext: 'gif', mime: 'image/gif' };
  }

  // WebP: 'RIFF' .... 'WEBP'
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, ext: 'webp', mime: 'image/webp' };
  }

  return {
    valid: false,
    error: 'Invalid file format. Only real JPG, PNG, WebP, and GIF images are permitted.',
  };
}

/**
 * Validates upload size per user role.
 * Maximum 3 MB for members, 1 MB for guests.
 */
export function validateUploadSize(sizeInBytes, isGuest = false) {
  const maxBytes = isGuest ? 1 * 1024 * 1024 : 3 * 1024 * 1024;
  if (sizeInBytes > maxBytes) {
    const limitMb = isGuest ? '1 MB' : '3 MB';
    return {
      valid: false,
      error: `File size exceeds the allowed limit of ${limitMb} for ${isGuest ? 'guests' : 'members'}.`,
    };
  }
  return { valid: true };
}

/**
 * Validates that an ID from a URL parameter is well-formed.
 */
export function isValidId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

/**
 * SHA-256 hash helper for session tokens
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
