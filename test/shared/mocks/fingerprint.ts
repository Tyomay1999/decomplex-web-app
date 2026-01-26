import { vi } from "vitest";

export type FingerprintModule = {
  getOrCreateFingerprint: () => string;
};

export const fingerprintMock: FingerprintModule = {
  getOrCreateFingerprint: vi.fn<FingerprintModule["getOrCreateFingerprint"]>(() => ""),
};

export const resetFingerprintMock = (): void => {
  (fingerprintMock.getOrCreateFingerprint as ReturnType<typeof vi.fn>).mockClear();
  (fingerprintMock.getOrCreateFingerprint as ReturnType<typeof vi.fn>).mockImplementation(() => "");
};
