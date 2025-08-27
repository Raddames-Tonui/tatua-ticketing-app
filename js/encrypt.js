export async function getKey() {
  const enc = new TextEncoder();
  const rawKey = enc.encode("super-secret-password"); 
  return window.crypto.subtle.importKey(
    "raw",
    rawKey,                
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(data) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); 
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return JSON.stringify({
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
  });
}

export async function decryptData(payload) {
  try {
    const key = await getKey();
    const parsed = JSON.parse(payload);

    const iv = Uint8Array.from(atob(parsed.iv), c => c.charCodeAt(0));
    const data = Uint8Array.from(atob(parsed.data), c => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (e) {
    console.error("Decryption failed:", e);
    return [];
  }
}
