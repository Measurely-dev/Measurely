CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SET
    TIME ZONE 'UTC';

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password TEXT NOT NULL,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    image TEXT NOT NULL DEFAULT '',
    invoice_status SMALLINT NOT NULL DEFAULT 0
);

-- Create Providers table
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL,
    type SMALLINT NOT NULL,
    provider_user_id TEXT NOT NULL,
    UNIQUE (type, provider_user_id),
    UNIQUE (type, user_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create Applications table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    api_key TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    units JSONB NOT NULL DEFAULT '[]',
    image TEXT NOT NULL DEFAULT '',
    current_plan TEXT NOT NULL DEFAULT '',
    subscription_type SMALLINT NOT NULL DEFAULT 0,
    stripe_subscription_id TEXT NOT NULL DEFAULT '',
    max_event_per_month INT NOT NULL DEFAULT 0,
    monthly_event_count INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create Metrics table
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    project_id UUID NOT NULL,
    unit TEXT NOT NULL DEFAULT '',
    name VARCHAR(50) NOT NULL,
    type SMALLINT NOT NULL,
    total_pos BIGINT NOT NULL DEFAULT 0,
    total_neg BIGINT NOT NULL DEFAULT 0,
    name_pos VARCHAR(50) NOT NULL DEFAULT '',
    name_neg VARCHAR(50) NOT NULL DEFAULT '',
    created TIMESTAMP NOT NULL DEFAULT timezone ('UTC', CURRENT_TIMESTAMP),
    filter_category TEXT NOT NULL DEFAULT '',
    parent_metric_id UUID,
    event_count BIGINT NOT NULL DEFAULT 0,
    last_event_timestamp TIMESTAMP,
    stripe_api_key TEXT,
    UNIQUE (parent_metric_id, name, filter_category),
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_metric_id) REFERENCES metrics (id) ON DELETE CASCADE
);

-- Create Metric events table
CREATE TABLE IF NOT EXISTS metric_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    metric_id UUID NOT NULL,
    value_pos INT NOT NULL,
    value_neg INT NOT NULL,
    relative_total_pos BIGINT NOT NULL,
    relative_total_neg BIGINT NOT NULL,
    date TIMESTAMP NOT NULL,
    relative_event_count BIGINT NOT NULL DEFAULT 0,
    event_count INT NOT NULL DEFAULT 1,
    UNIQUE (metric_id, date),
    FOREIGN KEY (metric_id) REFERENCES metrics (id) ON DELETE CASCADE
);

-- Create Account Recovery table
CREATE TABLE IF NOT EXISTS account_recovery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create Email Change table
CREATE TABLE IF NOT EXISTS email_change (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL,
    new_email VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create Feedback table
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL
);

-- Create Waitlist table
CREATE TABLE IF NOT EXISTS waitlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

-- Create Team table
CREATE TABLE IF NOT EXISTS team_relation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    role SMALLINT NOT NULL,
    UNIQUE (user_id, project_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Create Blocks table
CREATE TABLE IF NOT EXISTS blocks (
    team_relation_id UUID,
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    layout JSONB NOT NULL DEFAULT '[]',
    labels JSONB NOT NULL DEFAULT '[]',
    UNIQUE (user_id, team_relation_id, project_id),
    FOREIGN KEY (team_relation_id) REFERENCES team_relation (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Create Migrations table
CREATE TABLE IF NOT EXISTS migrations (filename TEXT NOT NULL);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_emailchange_userid ON email_change (user_id);

CREATE INDEX IF NOT EXISTS idx_accountrecovery_userid ON account_recovery (user_id);

CREATE INDEX IF NOT EXISTS idx_metricevents_metricid ON metric_events (metric_id);

CREATE INDEX IF NOT EXISTS idx_metricevents_date ON metric_events (date);

CREATE INDEX IF NOT EXISTS idx_metrics_projectid ON metrics (project_id);

CREATE INDEX IF NOT EXISTS idx_projects_userid ON projects (user_id);

CREATE INDEX IF NOT EXISTS idx_providers_userid_type ON providers (user_id, type);

CREATE INDEX IF NOT EXISTS idx_metrics_parentmetricid ON metrics (parent_metric_id);

CREATE INDEX IF NOT EXISTS idx_metrics_filtercategory ON metrics (filter_category);

CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics (name);

CREATE INDEX IF NOT EXISTS idx_teamrelation_userid ON team_relation (user_id);

CREATE INDEX IF NOT EXISTS idx_teamrelation_projectid ON team_relation (project_id);

CREATE INDEX IF NOT EXISTS idx_blocks_userid_projectid ON blocks (user_id, project_id);
