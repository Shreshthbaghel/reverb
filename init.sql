-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    system_prompt TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent Documents (Knowledge Base)
CREATE TABLE IF NOT EXISTS agent_documents (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Call Logs Table
CREATE TABLE IF NOT EXISTS call_logs (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    caller_number VARCHAR(20),
    call_start_time TIMESTAMP NOT NULL,
    call_end_time TIMESTAMP,
    duration_seconds INTEGER,
    transcript TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    success BOOLEAN DEFAULT FALSE,
    agent_response_quality FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agent Tools (Future Enhancement)
CREATE TABLE IF NOT EXISTS agent_tools (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    tool_name VARCHAR(255),
    tool_description TEXT,
    tool_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_id ON call_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_call_start_time ON call_logs(call_start_time);

-- Insert a default demo user for Phase 1 (user_id = 1)
INSERT INTO users (email, password_hash, name)
VALUES ('demo@voiceagent.com', 'demo_hash_placeholder', 'Demo User')
ON CONFLICT (email) DO NOTHING;
