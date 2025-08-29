
const enc = new TextEncoder();
const dec = new TextDecoder();

let keyPromise = crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"]
);

export async function encryptData(data) {
  const key = await keyPromise;
  const iv = crypto.getRandomValues(new Uint8Array(12)); 
  const encoded = enc.encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return btoa(
    JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(ciphertext))
    })
  );
}

export async function decryptData(base64) {
  const key = await keyPromise;
  const { iv, data } = JSON.parse(atob(base64));
  const buffer = new Uint8Array(data);
  const ivArr = new Uint8Array(iv);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivArr },
    key,
    buffer
  );

  return JSON.parse(dec.decode(decrypted));
}
