import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  IconBot, IconRefresh, IconEdit, IconTrash, IconChevron, IconPlus,
} from './Icons';

export default function AgentsList({ onCreateAgent }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [editingAgent, setEditingAgent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/agents/');
      setAgents(res.data);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Could not load agents. Is the API running?');
    }
    setLoading(false);
  };

  const fetchAnalytics = async (agentId) => {
    try {
      const res = await api.get(`/api/calls/analytics/${agentId}`);
      setAnalytics((prev) => ({ ...prev, [agentId]: res.data }));
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const toggleExpand = (agentId) => {
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
    } else {
      setExpandedAgent(agentId);
      if (!analytics[agentId]) fetchAnalytics(agentId);
    }
  };

  const startEdit = (agent) => {
    setEditingAgent(agent.id);
    setEditForm({
      name: agent.name,
      system_prompt: agent.system_prompt,
      description: agent.description || '',
      status: agent.status,
    });
  };

  const saveEdit = async (agentId) => {
    try {
      await api.put(`/api/agents/${agentId}`, editForm);
      fetchAgents();
      setEditingAgent(null);
    } catch (err) {
      console.error('Error updating agent:', err);
      setError('Failed to save changes');
    }
  };

  const deleteAgent = async (id) => {
    try {
      await api.delete(`/api/agents/${id}`);
      setAgents(agents.filter((a) => a.id !== id));
      setDeleteConfirm(null);
      if (expandedAgent === id) setExpandedAgent(null);
    } catch (err) {
      setError('Error deleting agent');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="spinner" />
        <p className="page-sub">Loading agents</p>
      </div>
    );
  }

  if (agents.length === 0 && !error) {
    return (
      <div className="page-enter flex flex-col items-center justify-center py-20 gap-5">
        <div className="icon-tile" style={{ width: '3rem', height: '3rem' }}>
          <IconBot s={22} />
        </div>
        <div className="text-center max-w-sm">
          <span className="eyebrow">Agents</span>
          <h2 className="page-title" style={{ fontSize: '1.35rem' }}>No agents yet</h2>
          <p className="page-sub mt-2">
            Create an agent with a system prompt to start handling calls.
          </p>
        </div>
        {onCreateAgent && (
          <button type="button" onClick={onCreateAgent} className="btn-primary">
            <IconPlus s={16} />
            Create agent
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-7 gap-3">
        <div>
          <span className="eyebrow">Library</span>
          <h1 className="page-title">Agents</h1>
          <p className="page-sub">{agents.length} configured</p>
        </div>
        <button type="button" onClick={fetchAgents} className="btn-secondary">
          <IconRefresh />
          Refresh
        </button>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.id} className="panel overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="icon-tile">
                    <IconBot s={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingAgent === agent.id ? (
                      <input
                        className="input mb-2"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    ) : (
                      <h3
                        className="truncate"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}
                      >
                        {agent.name}
                      </h3>
                    )}

                    {editingAgent === agent.id ? (
                      <input
                        className="input text-sm mt-1"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Description"
                      />
                    ) : (
                      <p className="page-sub truncate">
                        {agent.description || 'No description'}
                      </p>
                    )}

                    <div className="flex items-center gap-2.5 mt-2">
                      <span className={`badge ${agent.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {agent.status}
                      </span>
                      <span className="mono-label" style={{ color: 'var(--ink-faint)' }}>
                        {new Date(agent.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                  <button type="button" onClick={() => toggleExpand(agent.id)} className="btn-ghost text-xs">
                    Analytics
                    <IconChevron up={expandedAgent === agent.id} />
                  </button>

                  {editingAgent === agent.id ? (
                    <>
                      <button type="button" onClick={() => saveEdit(agent.id)} className="btn-primary text-xs">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingAgent(null)} className="btn-ghost text-xs">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => startEdit(agent)} className="btn-ghost text-xs">
                        <IconEdit />
                        Edit
                      </button>
                      {deleteConfirm === agent.id ? (
                        <div className="flex gap-1">
                          <button type="button" onClick={() => deleteAgent(agent.id)} className="btn-danger text-xs">
                            Confirm
                          </button>
                          <button type="button" onClick={() => setDeleteConfirm(null)} className="btn-ghost text-xs">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(agent.id)}
                          className="btn-danger text-xs"
                        >
                          <IconTrash />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {editingAgent === agent.id ? (
                <div className="mt-4">
                  <label className="label">System prompt</label>
                  <textarea
                    className="input resize-y min-h-[120px]"
                    rows={5}
                    value={editForm.system_prompt}
                    onChange={(e) => setEditForm({ ...editForm, system_prompt: e.target.value })}
                  />
                </div>
              ) : (
                <div className="prompt-preview">
                  <p className="mono-label mb-1.5" style={{ color: 'var(--ink-faint)' }}>
                    System prompt
                  </p>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                    {agent.system_prompt}
                  </p>
                </div>
              )}
            </div>

            {expandedAgent === agent.id && (
              <div
                className="p-4 sm:p-5"
                style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-alt)' }}
              >
                <p className="mono-label mb-3">Performance</p>
                {analytics[agent.id] ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Total calls', value: analytics[agent.id].total_calls, suffix: '' },
                      { label: 'Success rate', value: analytics[agent.id].success_rate?.toFixed(1), suffix: '%' },
                      { label: 'Avg duration', value: Math.round(analytics[agent.id].avg_call_duration || 0), suffix: 's' },
                      {
                        label: 'Quality',
                        value: ((analytics[agent.id].avg_response_quality || 0) * 100).toFixed(0),
                        suffix: '%',
                      },
                    ].map(({ label, value, suffix }) => (
                      <div key={label} className="metric-cell">
                        <p className="stat-value" style={{ fontSize: '1.25rem' }}>
                          {value}{suffix}
                        </p>
                        <p className="page-sub !text-xs mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 page-sub">
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Loading analytics
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
