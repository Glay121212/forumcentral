import crypto from 'crypto';
import { getFirebaseAdmin } from './firebase-admin.js';
import { validateImageMagicBytes, validateUploadSize } from './security.js';

/**
 * Validates and stores up to 4 images from FormData into Firebase Storage.
 * Validates real magic bytes (strictly JPG, PNG, GIF, WebP).
 * Generates random filenames.
 */
export async function processAndUploadImages(files = [], isGuest = false) {
  if (!files || files.length === 0) return { success: true, images: [] };

  // Maximum 4 images per post
  const filesToProcess = files.slice(0, 4);
  const uploadedImages = [];

  const { isConfigured, bucket } = getFirebaseAdmin();

  for (const file of filesToProcess) {
    if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
      continue;
    }

    // 1. Enforce size limits
    const sizeCheck = validateUploadSize(file.size, isGuest);
    if (!sizeCheck.valid) {
      return { success: false, error: sizeCheck.error };
    }

    // 2. Read bytes and validate real magic bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const typeCheck = validateImageMagicBytes(buffer);
    if (!typeCheck.valid) {
      return { success: false, error: `${file.name || 'File'}: ${typeCheck.error}` };
    }

    // 3. Generate random unique file name
    const randomHex = crypto.randomBytes(16).toString('hex');
    const safeFileName = `${randomHex}.${typeCheck.ext}`;
    const storagePath = `forum_uploads/${safeFileName}`;

    if (isConfigured && bucket) {
      try {
        const fileRef = bucket.file(storagePath);
        await fileRef.save(buffer, {
          contentType: typeCheck.mime,
          metadata: {
            metadata: {
              uploadedBy: isGuest ? 'guest' : 'member',
              originalName: file.name ? file.name.slice(0, 50) : 'image',
            },
          },
        });

        // Generate public storage download URL
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`;

        uploadedImages.push({
          url: publicUrl,
          fileName: safeFileName,
          size: file.size,
          mime: typeCheck.mime,
        });
      } catch (err) {
        console.error('Firebase Storage upload error:', err);
        return { success: false, error: 'Failed to upload photo to storage. Please try again.' };
      }
    } else {
      // Local/demo fallback: data URL representation for preview environments
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${typeCheck.mime};base64,${base64Data}`;

      uploadedImages.push({
        url: dataUrl,
        fileName: safeFileName,
        size: file.size,
        mime: typeCheck.mime,
      });
    }
  }

  return { success: true, images: uploadedImages };
}
