import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentCalls, setRecentCalls] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    fetchStats();
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await api.get('/health');
      setApiStatus('online');
    } catch {
      setApiStatus('offline');
    }
  };

  const fetchStats = async () => {
    try {
      const [agentsRes, callsRes, allCallsRes] = await Promise.all([
        api.get('/api/agents/'),
        api.get('/api/calls/?limit=5'),
        api.get('/api/calls/?limit=100'),
      ]);

      const allCalls = allCallsRes.data;
      const totalCalls = allCalls.length;
      const successfulCalls = allCalls.filter((c) => c.success).length;
      const totalDuration = allCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
      const avgQuality = allCalls.length > 0
        ? allCalls.reduce((sum, c) => sum + (c.agent_response_quality || 0), 0) / allCalls.length
        : 0;

      setStats({
        totalAgents: agentsRes.data.length,
        activeAgents: agentsRes.data.filter((a) => a.status === 'active').length,
        totalCalls,
        successRate: totalCalls > 0 ? (successfulCalls / totalCalls * 100).toFixed(1) : '0',
        avgDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
        avgQuality: (avgQuality * 100).toFixed(0),
        totalDurationHours: (totalDuration / 3600).toFixed(1),
      });

      setRecentCalls(callsRes.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
    setLoading(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="spinner" />
        <p className="page-sub">Loading dashboard</p>
      </div>
    );
  }

  const metrics = stats
    ? [
        { label: 'Agents', value: stats.totalAgents, sub: `${stats.activeAgents} active` },
        { label: 'Calls', value: stats.totalCalls, sub: `${stats.totalDurationHours}h total` },
        { label: 'Success rate', value: `${stats.successRate}%`, sub: 'Completed calls' },
        { label: 'Avg quality', value: `${stats.avgQuality}%`, sub: `${stats.avgDuration}s avg duration` },
      ]
    : [];

  return (
    <div className="page-enter space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">Overview</span>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Agents and call performance at a glance</p>
        </div>
        <div className={`status-pill ${apiStatus}`}>
          <i />
          API {apiStatus}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map(({ label, value, sub }, i) => (
            <div key={label} className="panel p-4">
              <span className="mono-label">0{i + 1} · {label}</span>
              <p className="stat-value mt-3">{value}</p>
              <p className="page-sub mt-1 !text-xs">{sub}</p>
            </div>
          ))}
        </div>
      )}

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Recent calls
          </h2>
          <span className="mono-label" style={{ color: 'var(--ink-faint)' }}>
            Last 5
          </span>
        </div>

        {recentCalls.length === 0 ? (
          <div className="panel px-6 py-14 text-center">
            <p className="mono-label mb-2" style={{ color: 'var(--ink-faint)' }}>Empty</p>
            <p className="page-sub max-w-sm mx-auto">
              No calls yet. Logged calls will show up here once agents are active.
            </p>
          </div>
        ) : (
          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Caller</th>
                    <th>Agent</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map((call) => (
                    <tr key={call.id}>
                      <td style={{ color: 'var(--ink)', fontWeight: 600 }}>
                        {call.caller_number || 'Unknown'}
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>
                        #{call.agent_id}
                      </td>
                      <td>{formatTime(call.call_start_time)}</td>
                      <td>
                        {call.duration_seconds != null ? `${call.duration_seconds}s` : '—'}
                      </td>
                      <td>
                        <span className={`badge ${call.success ? 'badge-active' : 'badge-inactive'}`}>
                          {call.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {((call.agent_response_quality || 0) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
