import React, { useState } from 'react';
import { api } from '../api';

const TEMPLATES = [
  {
    label: 'Customer support',
    prompt:
      'You are a friendly and professional customer support agent. Help users with questions about products, orders, and services. Be empathetic and solution-oriented. Always ask if there is anything else you can help with.',
  },
  {
    label: 'Appointment booking',
    prompt:
      'You are a scheduling assistant. Help callers book, reschedule, or cancel appointments. Collect their name, preferred date/time, and reason for visit. Confirm all details before finalizing.',
  },
  {
    label: 'Real estate inquiry',
    prompt:
      'You are a knowledgeable real estate assistant. Help potential buyers and renters with property inquiries, pricing, availability, and schedule viewings. Be professional and informative.',
  },
  {
    label: 'Restaurant orders',
    prompt:
      'You are a restaurant ordering assistant. Help customers browse the menu, take their order, handle special requests and dietary restrictions, and confirm pickup or delivery details.',
  },
];

export default function AgentBuilder({ onAgentCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyTemplate = (template) => {
    setFormData({ ...formData, system_prompt: template.prompt });
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
      const response = await api.post('/api/agents/', formData);
      setMessage(`Agent "${response.data.name}" created`);
      setMessageType('success');
      setFormData({ name: '', system_prompt: '', description: '' });
      if (onAgentCreated) onAgentCreated();
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
        <p className="page-sub">Define name, behavior, and optional description</p>
      </div>

      <div className="panel p-4 mb-4">
        <p className="mono-label mb-3">Prompt templates</p>
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
          <label className="label" htmlFor="system-prompt-input">
            System prompt <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <textarea
            id="system-prompt-input"
            name="system_prompt"
            value={formData.system_prompt}
            onChange={handleChange}
            placeholder="Describe how the agent should behave, tone, and goals..."
            rows={7}
            className="input resize-y"
            required
          />
          <p className="page-sub !text-xs mt-1.5">
            Controls personality, tone, and what the agent is allowed to do.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="description-input">
            Description <span style={{ fontWeight: 400, color: 'var(--ink-faint)' }}>(optional)</span>
          </label>
          <input
            id="description-input"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Short note for your team"
            className="input"
          />
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
            'Create agent'
          )}
        </button>

        {message && (
          <div className={messageType === 'success' ? 'alert-success' : 'alert-error'}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
