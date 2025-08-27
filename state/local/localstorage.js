//  Local storage
// AES-256 ENCRYPTION
// Key derivation
async function getKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("l13l_%223$"), 
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt
async function encryptData(data, password) {
  const key = await getKey(password);
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(data))
  );

  // Return Base64 for storage (iv + ciphertext)
  const buffer = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + buffer.length);
  combined.set(iv);
  combined.set(buffer, iv.length);
  return btoa(String.fromCharCode(...combined));
}

// Decrypt
async function decryptData(encoded, password) {
  const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const key = await getKey(password);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}








// const tickets = [{ id: 1, name: "Alice" }];
// const password = "secret123";

// encryptData(tickets, password).then(enc => {
//   localStorage.setItem("tickets", enc);

//   decryptData(enc, password).then(console.log); // [{ id: 1, name: "Alice" }]
// });





// Encoding using BTOA
// function encrypt(data) {
//   return btoa(JSON.stringify(data));
// }
// function decrypt(data) {
//   return JSON.parse(atob(data));
// }

// function saveTickets(tickets) {
//   localStorage.setItem("tickets", encrypt(tickets));
// }
// function getTickets() {
//   const raw = localStorage.getItem("tickets");
//   if (!raw) return [];

//   try {
//     return decrypt(raw);
//   } catch (e) {
//     console.warn("Failed to decode tickets, clearing corrupted data:", e);
//     localStorage.removeItem("tickets"); 
//     return [];
//   }
// }
