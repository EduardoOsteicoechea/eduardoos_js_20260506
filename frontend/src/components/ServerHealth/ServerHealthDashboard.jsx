import { useCallback, useEffect, useState } from 'react';

const HEALTH_API_PATH = '/api/server/health';

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

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function CopyButton({ text, label = 'Copiar' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyTextToClipboard(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="theme-toolbar-btn shrink-0 px-3 py-1 text-xs"
      title="Copiar al portapapeles"
    >
      {copied ? 'Copiado' : label}
    </button>
  );
}

function PanelHeader({ title, subtitle, copyText }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="theme-muted text-xs">{subtitle}</p> : null}
      </div>
      <CopyButton text={copyText} />
    </div>
  );
}

function StatusBadge({ ok, label }) {
  return (
    <span
      className={
        ok
          ? 'rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300'
          : 'rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-300'
      }
    >
      {label}
    </span>
  );
}

function formatMemoryText(memory) {
  if (!memory) return '';
  return [
    `Total: ${formatBytes(memory.total_bytes)}`,
    `Usada: ${formatBytes(memory.used_bytes)}`,
    `Disponible: ${formatBytes(memory.available_bytes)}`,
    `Uso: ${memory.used_percent}%`,
  ].join('\n');
}

function formatDiskText(disk) {
  if (!disk) return '';
  return [
    `Ruta: ${disk.path}`,
    `Total: ${formatBytes(disk.total_bytes)}`,
    `Usado: ${formatBytes(disk.used_bytes)}`,
    `Libre: ${formatBytes(disk.free_bytes)}`,
    `Uso: ${disk.used_percent}%`,
  ].join('\n');
}

function formatUnitText(unit) {
  if (!unit) return '';
  const enabled =
    unit.enabled === undefined ? 'n/a' : unit.enabled ? 'enabled' : 'disabled';
  return [
    `unit: ${unit.unit}`,
    `exists: ${unit.exists}`,
    `active: ${unit.active}`,
    `state: ${unit.state}`,
    `enabled: ${enabled}`,
    unit.error ? `error: ${unit.error}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function formatPortText(port) {
  if (!port) return '';
  if (!port.listening) return `port ${port.port}: not listening`;
  return [
    `port ${port.port}: listening`,
    port.address ? `address: ${port.address}` : null,
    port.process ? `process: ${port.process}` : null,
    port.pid ? `pid: ${port.pid}` : null,
    port.raw ? `raw: ${port.raw}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function formatProbeText(probe) {
  if (!probe) return '';
  return [
    `url: ${probe.url}`,
    `ok: ${probe.ok}`,
    probe.status ? `status: ${probe.status}` : null,
    probe.latency_ms != null ? `latency_ms: ${probe.latency_ms}` : null,
    probe.snippet ? `snippet: ${probe.snippet}` : null,
    probe.error ? `error: ${probe.error}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function formatArtifactText(artifact) {
  if (!artifact) return '';
  return `path: ${artifact.path}\nexists: ${artifact.exists}`;
}

function MetricCard({ label, copyText, children }) {
  return (
    <div className="theme-border space-y-2 rounded-xl border p-4">
      <PanelHeader title={label} copyText={copyText} />
      {children}
    </div>
  );
}

function InfoPanel({ title, subtitle, copyText, children }) {
  return (
    <section className="theme-border space-y-2 rounded-xl border p-4">
      <PanelHeader title={title} subtitle={subtitle} copyText={copyText} />
      {children}
    </section>
  );
}

function LogPanel({ title, block }) {
  const error = block?.error;
  const lines = Array.isArray(block?.logs) ? block.logs : [];
  const logText = lines.length ? lines.join('\n') : '(sin líneas de log)';
  const copyText = error ? `${error}\n\n${logText}` : logText;
  const scopeLabel = block?.scope ? ` · ${block.scope}` : '';

  return (
    <section className="theme-border space-y-2 rounded-xl border p-4">
      <PanelHeader
        title={title}
        subtitle={`${block?.service ?? ''}${scopeLabel}`}
        copyText={copyText}
      />
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
      ) : null}
      <pre className="theme-border max-h-72 overflow-auto rounded-lg border bg-black/5 p-3 text-xs leading-relaxed dark:bg-white/5">
        {logText}
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
      const response = await fetch(HEALTH_API_PATH);
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
  const services = data?.services;
  const ports = data?.ports;
  const deploy = data?.deploy;
  const probes = data?.probes;
  const issues = Array.isArray(data?.issues) ? data.issues : [];
  const warnings = Array.isArray(data?.warnings) ? data.warnings : [];

  const issuesCopyText = issues.length ? issues.join('\n') : 'Sin problemas críticos.';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Estado del servidor</h1>
          <p className="theme-muted mt-1 text-sm">
            Servicios, puertos, artefactos de deploy, probes HTTP, logs y recursos.
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
          No se pudo cargar {HEALTH_API_PATH}: {error}
        </p>
      ) : null}

      {data ? (
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge ok={data.ok} label={data.ok ? 'Sistema OK' : 'Hay problemas'} />
          {data.timestamp ? (
            <span className="theme-muted text-xs">Última respuesta: {data.timestamp}</span>
          ) : null}
        </div>
      ) : null}

      {data && issues.length > 0 ? (
        <InfoPanel title="Problemas detectados" copyText={issuesCopyText}>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700 dark:text-red-300">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </InfoPanel>
      ) : null}

      {data && warnings.length > 0 ? (
        <InfoPanel title="Avisos en logs recientes" copyText={warnings.join('\n')}>
          <ul className="list-inside list-disc space-y-1 text-sm text-amber-800 dark:text-amber-300">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </InfoPanel>
      ) : null}

      {services ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <InfoPanel
            title="Servicio backend"
            subtitle={services.backend?.unit}
            copyText={formatUnitText(services.backend)}
          >
            <ul className="space-y-1 text-sm">
              <li>
                Activo: <StatusBadge ok={services.backend?.active} label={services.backend?.active ? 'sí' : 'no'} />
              </li>
              <li>Estado: {services.backend?.state}</li>
              {services.backend?.enabled !== undefined ? (
                <li>Habilitado: {services.backend.enabled ? 'sí' : 'no'}</li>
              ) : null}
            </ul>
          </InfoPanel>

          <InfoPanel
            title="Servicio documenter"
            subtitle={services.documenter?.unit}
            copyText={formatUnitText(services.documenter)}
          >
            <ul className="space-y-1 text-sm">
              <li>
                Activo:{' '}
                <StatusBadge
                  ok={services.documenter?.active}
                  label={services.documenter?.active ? 'sí' : 'no'}
                />
              </li>
              <li>Estado: {services.documenter?.state}</li>
            </ul>
          </InfoPanel>

          <InfoPanel
            title="API legacy (Python)"
            subtitle={services.legacy_api?.unit}
            copyText={formatUnitText(services.legacy_api)}
          >
            <ul className="space-y-1 text-sm">
              <li>Existe: {services.legacy_api?.exists ? 'sí' : 'no'}</li>
              <li>
                Activo:{' '}
                <StatusBadge
                  ok={!services.legacy_api?.active}
                  label={services.legacy_api?.active ? 'sí (conflicto)' : 'no'}
                />
              </li>
            </ul>
          </InfoPanel>

          <InfoPanel
            title="Telemetry"
            subtitle={services.telemetry?.unit}
            copyText={formatUnitText(services.telemetry)}
          >
            <ul className="space-y-1 text-sm">
              <li>
                Activo:{' '}
                <StatusBadge
                  ok={services.telemetry?.active}
                  label={services.telemetry?.active ? 'sí' : 'no'}
                />
              </li>
              <li>Estado: {services.telemetry?.state}</li>
            </ul>
          </InfoPanel>
        </div>
      ) : null}

      {ports ? (
        <InfoPanel
          title="Puertos (8080 / 8090 / 8100)"
          copyText={[formatPortText(ports.backend), formatPortText(ports.documenter), formatPortText(ports.telemetry)].join('\n\n')}
        >
          <ul className="space-y-2 text-sm">
            <li>
              <strong>8080 backend:</strong>{' '}
              {ports.backend?.listening
                ? `${ports.backend.process ?? '?'} (pid ${ports.backend.pid ?? '?'})`
                : 'no escucha'}
            </li>
            <li>
              <strong>8090 documenter:</strong>{' '}
              {ports.documenter?.listening
                ? `${ports.documenter.process ?? '?'} (pid ${ports.documenter.pid ?? '?'})`
                : 'no escucha'}
            </li>
            <li>
              <strong>8100 telemetry:</strong>{' '}
              {ports.telemetry?.listening
                ? `${ports.telemetry.process ?? '?'} (pid ${ports.telemetry.pid ?? '?'})`
                : 'no escucha'}
            </li>
          </ul>
        </InfoPanel>
      ) : null}

      {deploy ? (
        <InfoPanel
          title="Artefactos de deploy"
          copyText={`${formatArtifactText(deploy.backend_dist)}\n\n${formatArtifactText(deploy.documenter_dist)}`}
        >
          <ul className="space-y-1 text-sm">
            <li>
              Backend:{' '}
              <StatusBadge
                ok={deploy.backend_dist?.exists}
                label={deploy.backend_dist?.exists ? 'dist/server.js OK' : 'falta dist'}
              />
            </li>
            <li className="theme-muted text-xs break-all">{deploy.backend_dist?.path}</li>
            <li>
              Documenter:{' '}
              <StatusBadge
                ok={deploy.documenter_dist?.exists}
                label={deploy.documenter_dist?.exists ? 'dist/server.js OK' : 'falta dist'}
              />
            </li>
            <li className="theme-muted text-xs break-all">{deploy.documenter_dist?.path}</li>
          </ul>
        </InfoPanel>
      ) : null}

      {probes ? (
        <InfoPanel
          title="Probes HTTP"
          copyText={`${formatProbeText(probes.backend_catalog)}\n\n${formatProbeText(probes.documenter_health)}`}
        >
          <ul className="space-y-2 text-sm">
            <li>
              Catalog:{' '}
              <StatusBadge ok={probes.backend_catalog?.ok} label={probes.backend_catalog?.ok ? 'OK' : 'falló'} />
              {probes.backend_catalog?.status ? ` HTTP ${probes.backend_catalog.status}` : ''}
              {probes.backend_catalog?.latency_ms != null
                ? ` · ${probes.backend_catalog.latency_ms} ms`
                : ''}
            </li>
            <li className="theme-muted break-all text-xs">{probes.backend_catalog?.url}</li>
            <li>
              Documenter /health:{' '}
              <StatusBadge ok={probes.documenter_health?.ok} label={probes.documenter_health?.ok ? 'OK' : 'falló'} />
              {probes.documenter_health?.status ? ` HTTP ${probes.documenter_health.status}` : ''}
            </li>
            <li className="theme-muted break-all text-xs">{probes.documenter_health?.url}</li>
          </ul>
        </InfoPanel>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Memoria RAM" copyText={formatMemoryText(memory)}>
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

        <MetricCard label="Disco" copyText={formatDiskText(disk)}>
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
          <LogPanel title="Logs backend" block={data.backend} />
          <LogPanel title="Logs documenter" block={data.documenter} />
        </>
      ) : null}
    </div>
  );
}
