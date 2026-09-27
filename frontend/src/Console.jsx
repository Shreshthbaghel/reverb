import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AgentsList from './components/AgentsList';
import AgentBuilder from './components/AgentBuilder';
import CallLogs from './components/CallLogs';
import {
  IconLayout, IconBot, IconPlus, IconPhone, IconMic, IconExternal,
} from './components/Icons';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconLayout },
  { id: 'agents', label: 'Agents', Icon: IconBot },
  { id: 'create', label: 'New agent', Icon: IconPlus },
  { id: 'calls', label: 'Call logs', Icon: IconPhone },
];

export default function Console() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agentKey, setAgentKey] = useState(0);

  const handleAgentCreated = () => {
    setAgentKey((prev) => prev + 1);
    setActiveTab('agents');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'agents':
        return (
          <AgentsList
            key={agentKey}
            onCreateAgent={() => setActiveTab('create')}
          />
        );
      case 'create':
        return <AgentBuilder onAgentCreated={handleAgentCreated} />;
      case 'calls':
        return <CallLogs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="console">
      <div className="grain" aria-hidden="true" />

      <header className="console-header">
        <div className="console-header-inner">
          <Link to="/" className="console-brand">
            <span className="console-brand-mark">
              <IconMic s={15} />
            </span>
            <span>
              <span className="console-brand-name">VoiceAgent</span>
              <span className="console-brand-sub block">Agent console</span>
            </span>
          </Link>

          <div className="console-header-links">
            <Link to="/">Landing</Link>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
              API docs
              <IconExternal />
            </a>
          </div>
        </div>
      </header>

      <div className="console-body">
        <aside className="console-aside">
          <nav className="panel console-nav" aria-label="Console">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`nav-item ${activeTab === id ? 'active' : ''}`}
              >
                <Icon s={17} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <nav className="console-mobile-nav" aria-label="Console mobile">
          <div className="console-mobile-nav-inner">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`console-mobile-tab ${activeTab === id ? 'active' : ''}`}
              >
                <Icon s={18} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <main className="console-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
