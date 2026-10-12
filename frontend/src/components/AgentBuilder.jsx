import React, { useState } from 'react';
import { api } from '../api';
import EmbedSnippet from './EmbedSnippet';

const TEMPLATES = [
  {
    label: 'Customer support',
    description: 'Help customers with products, orders, refunds, and account questions for an online store.',
  },
  {
    label: 'Appointment booking',
    description: 'Schedule, reschedule, or cancel appointments. Collect name, preferred time, and reason for visit.',
  },
  {
    label: 'Real estate inquiry',
    description: 'Answer property questions, pricing, availability, and help book viewings for buyers and renters.',
  },
  {
    label: 'Restaurant orders',
    description: 'Take food orders, handle dietary restrictions, and confirm pickup or delivery details.',
  },
];

export default function AgentBuilder({ onAgentCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
    description: '',
    tone: 'professional, clear, and helpful',
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [createdAgent, setCreatedAgent] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      name: formData.name || template.label,
      description: template.description,
    });
  };

  const generatePrompt = async () => {
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setMessage('Add a description of at least 10 characters before generating the prompt');
      setMessageType('error');
      return;
    }

    setGenerating(true);
    setMessage('');
    try {
      const res = await api.post('/api/agents/generate-prompt', {
        description: formData.description,
        name: formData.name || undefined,
        tone: formData.tone || undefined,
      });
      setFormData((prev) => ({ ...prev, system_prompt: res.data.system_prompt }));
      setMessage('Master prompt generated — review and edit before creating the agent');
      setMessageType('success');
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
      setMessageType('error');
    }
    setGenerating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.system_prompt.trim()) {
      setMessage('Agent name and system prompt are required');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/api/agents/', {
        name: formData.name,
        system_prompt: formData.system_prompt,
        description: formData.description || null,
      });
      setMessage(`Agent "${response.data.name}" created — copy the embed tag below`);
      setMessageType('success');
      setCreatedAgent(response.data);
      setFormData({
        name: '',
        system_prompt: '',
        description: '',
        tone: 'professional, clear, and helpful',
      });
      if (onAgentCreated) {
        // Delay navigation so user can copy embed; parent can still refresh list later
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message);
      setMessageType('error');
    }
    setLoading(false);
  };

  return (
    <div className="page-enter max-w-2xl">
      <div className="mb-7">
        <span className="eyebrow">Create</span>
        <h1 className="page-title">New agent</h1>
        <p className="page-sub">
          Describe the agent, generate a master prompt with Groq, then embed it on any site
        </p>
      </div>

      <div className="panel p-4 mb-4">
        <p className="mono-label mb-3">Quick descriptions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t)}
              className="template-chip"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel p-5 space-y-4">
        <div>
          <label className="label" htmlFor="agent-name-input">
            Name <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <input
            id="agent-name-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Support desk"
            className="input"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="description-input">
            Description <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <textarea
            id="description-input"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what this agent should do, for whom, and any rules…"
            rows={4}
            className="input resize-y"
            required
          />
          <p className="page-sub !text-xs mt-1.5">
            Used to auto-generate the master system prompt.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="tone-input">Tone</label>
          <input
            id="tone-input"
            type="text"
            name="tone"
            value={formData.tone}
            onChange={handleChange}
            placeholder="professional, clear, and helpful"
            className="input"
          />
        </div>

        <button
          type="button"
          className="btn-accent w-full"
          onClick={generatePrompt}
          disabled={generating}
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="spinner"
                style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
              />
              Generating master prompt…
            </span>
          ) : (
            'Generate master prompt with Groq'
          )}
        </button>

        <div>
          <label className="label" htmlFor="system-prompt-input">
            Master system prompt <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <textarea
            id="system-prompt-input"
            name="system_prompt"
            value={formData.system_prompt}
            onChange={handleChange}
            placeholder="Click generate above, or write the prompt manually…"
            rows={8}
            className="input resize-y"
            required
          />
          <p className="page-sub !text-xs mt-1.5">
            Always review and edit before publishing — this is what the embed widget uses.
          </p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="spinner"
                style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
              />
              Creating…
            </span>
          ) : (
            'Create agent & get embed code'
          )}
        </button>

        {message && (
          <div className={messageType === 'success' ? 'alert-success' : 'alert-error'}>
            {message}
          </div>
        )}
      </form>

      {createdAgent && (
        <div className="panel p-5 mt-4 space-y-3">
          <div>
            <span className="eyebrow">Ready to ship</span>
            <h2 className="page-title" style={{ fontSize: '1.25rem' }}>
              Embed {createdAgent.name}
            </h2>
            <p className="page-sub">
              Drop the HTML tag into any project — visitors chat with this agent live.
            </p>
          </div>
          <EmbedSnippet agentId={createdAgent.id} agentName={createdAgent.name} />
          {onAgentCreated && (
            <button type="button" className="btn-secondary w-full" onClick={onAgentCreated}>
              Done — go to agents
            </button>
          )}
        </div>
      )}
    </div>
  );
}
