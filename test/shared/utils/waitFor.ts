export type WaitForOptions = {
  timeoutMs?: number;
  intervalMs?: number;
};

export const waitFor = async (
  predicate: () => boolean,
  opts: WaitForOptions = {},
): Promise<void> => {
  const timeoutMs = opts.timeoutMs ?? 1500;
  const intervalMs = opts.intervalMs ?? 20;

  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (predicate()) return;
    await new Promise<void>((r) => setTimeout(r, intervalMs));
  }

  throw new Error("waitFor timeout");
};
