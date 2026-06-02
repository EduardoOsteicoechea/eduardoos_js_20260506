import { useCallback, useEffect, useState } from 'react';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function MetricCard({ label, children }) {
  return (
    <div className="theme-border rounded-xl border p-4">
      <p className="theme-muted mb-2 text-xs font-semibold uppercase tracking-wide">
        {label}
      </p>
      {children}
    </div>
  );
}

function LogPanel({ title, block }) {
  const error = block?.error;
  const lines = Array.isArray(block?.logs) ? block.logs : [];

  return (
    <section className="theme-border space-y-2 rounded-xl border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="theme-muted text-xs">{block?.service}</span>
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
      ) : null}
      <pre className="theme-border max-h-72 overflow-auto rounded-lg border bg-black/5 p-3 text-xs leading-relaxed dark:bg-white/5">
        {lines.length ? lines.join('\n') : '(sin líneas de log)'}
      </pre>
    </section>
  );
}

export default function ServerHealthDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/server/healt');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Error de red');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const memory = data?.system?.memory;
  const disk = data?.system?.disk;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Estado del servidor</h1>
          <p className="theme-muted mt-1 text-sm">
            Logs de backend y documenter, RAM y disco del host.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="theme-toolbar-btn px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          No se pudo cargar /api/server/healt: {error}
        </p>
      ) : null}

      {data?.timestamp ? (
        <p className="theme-muted text-xs">Última respuesta: {data.timestamp}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Memoria RAM">
          {memory ? (
            <ul className="space-y-1 text-sm">
              <li>Total: {formatBytes(memory.total_bytes)}</li>
              <li>Usada: {formatBytes(memory.used_bytes)}</li>
              <li>Disponible: {formatBytes(memory.available_bytes)}</li>
              <li>Uso: {memory.used_percent}%</li>
            </ul>
          ) : (
            <p className="theme-muted text-sm">Sin datos</p>
          )}
        </MetricCard>

        <MetricCard label="Disco">
          {disk ? (
            <ul className="space-y-1 text-sm">
              <li>Ruta: {disk.path}</li>
              <li>Total: {formatBytes(disk.total_bytes)}</li>
              <li>Usado: {formatBytes(disk.used_bytes)}</li>
              <li>Libre: {formatBytes(disk.free_bytes)}</li>
              <li>Uso: {disk.used_percent}%</li>
            </ul>
          ) : (
            <p className="theme-muted text-sm">Sin datos</p>
          )}
        </MetricCard>
      </div>

      {data?.system?.error ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">{data.system.error}</p>
      ) : null}

      {data ? (
        <>
          <LogPanel title="Backend" block={data.backend} />
          <LogPanel title="Documenter" block={data.documenter} />
        </>
      ) : null}
    </div>
  );
}
