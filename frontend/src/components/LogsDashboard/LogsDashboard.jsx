import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import './LogsDashboard.css';

const LOGS_API_PATH = '/api/logs';
const SERVICES = ['', 'backend', 'chatbot', 'documenter', 'database', 's3'];
const LEVELS = ['', 'debug', 'info', 'warn', 'error'];
const POLL_MS = 5000;

function levelClass(level) {
  const clean = String(level ?? '').toLowerCase();
  if (clean === 'error') return 'logs-dashboard__level--error';
  if (clean === 'warn') return 'logs-dashboard__level--warn';
  if (clean === 'debug') return 'logs-dashboard__level--debug';
  return 'logs-dashboard__level--info';
}

function formatTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatContext(context) {
  if (!context || typeof context !== 'object') return '';
  try {
    return JSON.stringify(context, null, 2);
  } catch {
    return String(context);
  }
}

export default function LogsDashboard() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [service, setService] = useState('');
  const [level, setLevel] = useState('');
  const [limit, setLimit] = useState(200);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (service) params.set('service', service);
    if (level) params.set('level', level);
    if (limit) params.set('limit', String(limit));
    return params.toString();
  }, [service, level, limit]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(query ? `${LOGS_API_PATH}?${query}` : LOGS_API_PATH);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setTotal(Number(data.total) || 0);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Error de red');
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [autoRefresh, load]);

  return (
    <div className="logs-dashboard">
      <div className="logs-dashboard__header">
        <div>
          <h1 className="logs-dashboard__title">Logs de servicios</h1>
          <p className="logs-dashboard__subtitle theme-muted">
            Registros centralizados de backend, chatbot, documenter, database y s3.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="theme-toolbar-btn logs-dashboard__refresh"
        >
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      <div className="logs-dashboard__filters theme-border">
        <label className="logs-dashboard__filter">
          <span>Servicio</span>
          <select value={service} onChange={(event) => setService(event.target.value)}>
            {SERVICES.map((item) => (
              <option key={item || 'all'} value={item}>
                {item || 'Todos'}
              </option>
            ))}
          </select>
        </label>

        <label className="logs-dashboard__filter">
          <span>Nivel</span>
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            {LEVELS.map((item) => (
              <option key={item || 'all'} value={item}>
                {item || 'Todos'}
              </option>
            ))}
          </select>
        </label>

        <label className="logs-dashboard__filter">
          <span>Límite</span>
          <select
            value={String(limit)}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            {[50, 100, 200, 500].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="logs-dashboard__filter logs-dashboard__filter--checkbox">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(event) => setAutoRefresh(event.target.checked)}
          />
          <span>Auto-refresh ({POLL_MS / 1000}s)</span>
        </label>
      </div>

      {error ? (
        <p className="logs-dashboard__error">
          No se pudo cargar {LOGS_API_PATH}: {error}
        </p>
      ) : null}

      <p className="logs-dashboard__meta theme-muted">
        Mostrando {logs.length} de {total} entradas almacenadas
      </p>

      <div className="logs-dashboard__table-wrap theme-border">
        <table className="logs-dashboard__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Servicio</th>
              <th>Nivel</th>
              <th>Mensaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="logs-dashboard__empty">
                  {loading ? 'Cargando…' : 'Sin registros para los filtros actuales.'}
                </td>
              </tr>
            ) : (
              logs.map((entry) => {
                const hasContext =
                  entry.context && Object.keys(entry.context).length > 0;
                const isExpanded = expandedId === entry.id;

                return (
                  <Fragment key={entry.id}>
                    <tr>
                      <td>{entry.id}</td>
                      <td>
                        <span className="logs-dashboard__service">{entry.service}</span>
                      </td>
                      <td>
                        <span className={`logs-dashboard__level ${levelClass(entry.level)}`}>
                          {entry.level}
                        </span>
                      </td>
                      <td className="logs-dashboard__message">
                        <button
                          type="button"
                          className="logs-dashboard__message-btn"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : entry.id)
                          }
                          disabled={!hasContext}
                          title={hasContext ? 'Ver contexto' : undefined}
                        >
                          {entry.message}
                        </button>
                      </td>
                      <td className="logs-dashboard__time">
                        {formatTimestamp(entry.created_at)}
                      </td>
                    </tr>
                    {isExpanded && hasContext ? (
                      <tr key={`${entry.id}-context`} className="logs-dashboard__context-row">
                        <td colSpan={5}>
                          <pre className="logs-dashboard__context theme-border">
                            {formatContext(entry.context)}
                          </pre>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
