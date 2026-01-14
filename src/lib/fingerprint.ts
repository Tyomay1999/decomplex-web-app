const FP_KEY = "dc_fingerprint";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < buf.length; i += 1) {
      buf[i] = Math.floor(Math.random() * 256);
    }
  }

  let out = "";
  for (const b of buf) out += b.toString(16).padStart(2, "0");
  return out;
}

function createFingerprint(): string {
  return `fp_${randomHex(16)}`;
}

export function getOrCreateFingerprint(serverFingerprint?: string): string {
  if (!isBrowser()) return serverFingerprint ?? "";

  const fromServer = typeof serverFingerprint === "string" ? serverFingerprint.trim() : "";
  if (fromServer.length > 0) {
    writeLocalStorage(FP_KEY, fromServer);
    return fromServer;
  }

  const stored = readLocalStorage(FP_KEY);
  if (typeof stored === "string" && stored.trim().length > 0) return stored;

  const created = createFingerprint();
  writeLocalStorage(FP_KEY, created);
  return created;
}
