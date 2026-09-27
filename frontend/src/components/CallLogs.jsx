import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { IconRefresh, IconTrash, IconChevron, IconDoc, IconCheck, IconX } from './Icons';

export default function CallLogs() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCall, setExpandedCall] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/calls/');
      setCalls(res.data);
    } catch (err) {
      console.error('Error fetching calls:', err);
      setError('Could not load call logs');
    }
    setLoading(false);
  };

  const deleteCall = async (id) => {
    try {
      await api.delete(`/api/calls/${id}`);
      setCalls(calls.filter((c) => c.id !== id));
      if (expandedCall === id) setExpandedCall(null);
    } catch (err) {
      setError('Error deleting call log');
    }
  };

  const filteredCalls = calls.filter((call) => {
    if (filter === 'success') return call.success;
    if (filter === 'failed') return !call.success;
    return true;
  });

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="spinner" />
        <p className="page-sub">Loading call logs</p>
      </div>
    );
  }

  const filters = [
    { id: 'all', label: 'All', count: calls.length },
    { id: 'success', label: 'Successful', count: calls.filter((c) => c.success).length },
    { id: 'failed', label: 'Failed', count: calls.filter((c) => !c.success).length },
  ];

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-7 gap-3">
        <div>
          <span className="eyebrow">History</span>
          <h1 className="page-title">Call logs</h1>
          <p className="page-sub">{calls.length} recorded</p>
        </div>
        <button type="button" onClick={fetchCalls} className="btn-secondary">
          <IconRefresh />
          Refresh
        </button>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`filter-chip ${filter === f.id ? 'active' : ''}`}
          >
            {f.label}
            <span className="ml-1.5 opacity-70 tabular-nums" style={{ fontSize: '0.75rem' }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {filteredCalls.length === 0 ? (
        <div className="panel py-16 text-center">
          <p className="mono-label mb-2" style={{ color: 'var(--ink-faint)' }}>Empty</p>
          <p className="page-sub">No call logs match this filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCalls.map((call) => (
            <div key={call.id} className="panel overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                <div
                  className="icon-tile"
                  style={{
                    background: call.success ? 'var(--success-soft)' : 'var(--danger-soft)',
                    color: call.success ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {call.success ? <IconCheck /> : <IconX />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>
                      {call.caller_number || 'Unknown caller'}
                    </span>
                    <span className={`badge ${call.status === 'completed' ? 'badge-active' : 'badge-neutral'}`}>
                      {call.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1" style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>
                    <span>{formatTime(call.call_start_time)}</span>
                    <span>{formatDuration(call.duration_seconds)}</span>
                    <span className="tabular-nums">
                      {((call.agent_response_quality || 0) * 100).toFixed(0)}% quality
                    </span>
                    <span style={{ fontFamily: 'var(--mono)' }}>Agent #{call.agent_id}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                    className="btn-ghost text-xs"
                  >
                    <IconDoc />
                    Transcript
                    <IconChevron up={expandedCall === call.id} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCall(call.id)}
                    className="btn-danger text-xs px-2"
                    aria-label="Delete call"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>

              {expandedCall === call.id && (
                <div
                  className="p-4"
                  style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-alt)' }}
                >
                  <p className="mono-label mb-2" style={{ color: 'var(--ink-faint)' }}>
                    Transcript
                  </p>
                  {call.transcript ? (
                    <pre
                      className="text-sm whitespace-pre-wrap leading-relaxed p-3 rounded-md"
                      style={{
                        fontFamily: 'var(--font)',
                        color: 'var(--ink-soft)',
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                      }}
                    >
                      {call.transcript}
                    </pre>
                  ) : (
                    <p className="page-sub italic">No transcript available</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
