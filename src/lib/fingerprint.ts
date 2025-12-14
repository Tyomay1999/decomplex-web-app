const FP_KEY = "dc_fingerprint";

export const getOrCreateFingerprint = (serverFingerprint: string = ""): string => {
  if (typeof window === "undefined") return serverFingerprint || "server-fingerprint";
  if (!serverFingerprint) return window.localStorage.getItem(FP_KEY) || "";
  window.localStorage.setItem(FP_KEY, serverFingerprint);
  return serverFingerprint;
};
