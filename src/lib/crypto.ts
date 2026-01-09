const ENCRYPTION_KEY_NAME = 'jobhunt-encryption-key';
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);

  if (storedKey) {
    const keyData = Uint8Array.from(atob(storedKey), c => c.charCodeAt(0));
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Generate new key
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );

  // Export and store
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  localStorage.setItem(ENCRYPTION_KEY_NAME, keyBase64);

  // Re-import as non-extractable for use
  return crypto.subtle.importKey(
    'raw',
    exportedKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptApiKey(plaintext: string): Promise<string> {
  if (!plaintext) return '';

  const key = await getOrCreateEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encodedText
  );

  // Combine IV + ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return 'enc:' + btoa(String.fromCharCode(...combined));
}

export async function decryptApiKey(encrypted: string): Promise<string> {
  if (!encrypted) return '';

  // Handle unencrypted legacy keys
  if (!encrypted.startsWith('enc:')) {
    return encrypted;
  }

  try {
    const key = await getOrCreateEncryptionKey();
    const combined = Uint8Array.from(atob(encrypted.slice(4)), c => c.charCodeAt(0));

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    // Decryption failed (likely imported from different device)
    // Return empty string so user can re-enter the key
    console.warn('Failed to decrypt API key - may have been imported from another device');
    return '';
  }
}

export function isEncrypted(value: string | undefined): boolean {
  return !!value?.startsWith('enc:');
}
