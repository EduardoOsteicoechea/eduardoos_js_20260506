export function getEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function getEnvOrDefault(name: string, fallback: string): string {
  return getEnv(name) ?? fallback;
}

export function getEnvNumber(name: string, fallback: number): number {
  const raw = getEnv(name);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}
