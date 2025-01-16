CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SET
    TIME ZONE 'UTC';

-- Create Plans table
CREATE TABLE IF NOT EXISTS Plans (
    Identifier TEXT NOT NULL UNIQUE,
    Name VARCHAR(50) NOT NULL,
    Price TEXT NOT NULL,
    ProjectLimit INT NOT NULL,
    MetricPerProjectLimit INT NOT NULL,
    RequestLimit INT NOT NULL,
    MonthlyEventLimit BIGINT NOT NULL,
    Range INT NOT NULL
);

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    Email VARCHAR(255) NOT NULL UNIQUE,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Password TEXT NOT NULL,
    stripeCustomerId TEXT NOT NULL UNIQUE,
    CurrentPlan TEXT NOT NULL,
    Image TEXT NOT NULL DEFAULT '',
    MonthlyEventCount BIGINT NOT NULL DEFAULT 0,
    StartCountDate TIMESTAMP NOT NULL DEFAULT timezone ('UTC', CURRENT_TIMESTAMP),
    FOREIGN KEY (CurrentPlan) REFERENCES Plans (Identifier)
);

-- Create Providers table
CREATE TABLE IF NOT EXISTS Providers (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    UserId UUID NOT NULL,
    Type SMALLINT NOT NULL,
    ProviderUserId TEXT NOT NULL,
    UNIQUE (Type, ProviderUserId),
    UNIQUE (Type, UserId),
    FOREIGN KEY (UserId) REFERENCES Users (Id) ON DELETE CASCADE
);

-- Create Applications table
CREATE TABLE IF NOT EXISTS Projects (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    ApiKey TEXT NOT NULL UNIQUE,
    UserId UUID NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Image TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (UserId) REFERENCES Users (Id) ON DELETE CASCADE
);

-- Create Metrics table
CREATE TABLE IF NOT EXISTS Metrics (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    ProjectId UUID NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Type SMALLINT NOT NULL,
    TotalPos BIGINT NOT NULL DEFAULT 0,
    TotalNeg BIGINT NOT NULL DEFAULT 0,
    NamePos VARCHAR(50) NOT NULL DEFAULT '',
    NameNeg VARCHAR(50) NOT NULL DEFAULT '',
    Created TIMESTAMP NOT NULL DEFAULT timezone ('UTC', CURRENT_TIMESTAMP),
    FilterCategory TEXT NOT NULL DEFAULT '',
    ParentMetricId UUID,
    EventCount BIGINT NOT NULL DEFAULT 0,
    LastEventTimestamp TIMESTAMP,
    -- INTEGRATION COLUMNS
    StripeAccount TEXT,
    UNIQUE (ParentMetricId, Name, FilterCategory),
    FOREIGN KEY (ProjectId) REFERENCES Projects (Id) ON DELETE CASCADE,
    FOREIGN KEY (ParentMetricId) REFERENCES Metrics (Id) ON DELETE CASCADE
);

-- Create Metric events table
CREATE TABLE IF NOT EXISTS MetricEvents (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    MetricId UUID NOT NULL,
    ValuePos INT NOT NULL,
    ValueNeg INT NOT NULL,
    RelativeTotalPos BIGINT NOT NULL,
    RelativeTotalNeg BIGINT NOT NULL,
    Date TIMESTAMP NOT NULL,
    RelativeEventCount BIGINT NOT NULL DEFAULT 0,
    EventCount INT NOT NULL DEFAULT 1,
    UNIQUE (MetricId, Date),
    FOREIGN KEY (MetricId) REFERENCES Metrics (Id) ON DELETE CASCADE
);

-- Create Account Recovery table
CREATE TABLE IF NOT EXISTS AccountRecovery (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    UserId UUID NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users (Id) ON DELETE CASCADE
);

-- Create Email Change table
CREATE TABLE IF NOT EXISTS EmailChange (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    UserId UUID NOT NULL,
    NewEmail VARCHAR(255) NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users (Id) ON DELETE CASCADE
);

-- Create Feedback table
CREATE TABLE IF NOT EXISTS Feedbacks (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    Date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Email VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL
);

-- Create Waitlist table
CREATE TABLE IF NOT EXISTS Waitlists (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    Email TEXT NOT NULL UNIQUE,
    Name TEXT NOT NULL
);

-- Create Team table
CREATE TABLE IF NOT EXISTS TeamRelation (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    UserId UUID NOT NULL,
    ProjectId UUID NOT NULL,
    Role SMALLINT NOT NULL,
    UNIQUE (UserId, ProjectId),
    FOREIGN KEY (UserId) REFERENCES Users (Id) ON DELETE CASCADE,
    FOREIGN KEY (ProjectId) REFERENCES Projects (Id) ON DELETE CASCADE
);

-- Create Blocks table
CREATE TABLE IF NOT EXISTS Blocks (
    TeamRelationId UUID,
    UserId UUID NOT NULL,
    ProjectId UUID NOT NULL,
    Layout JSONB NOT NULL,
    Labels JSONB NOT NULL,
    UNIQUE (UserId, TeamRelationId, ProjectId),
    FOREIGN KEY (TeamRelationId) REFERENCES TeamRelation (Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users (Id) ON DELETE CASCADE,
    FOREIGN KEY (ProjectId) REFERENCES Projects (Id) ON DELETE CASCADE
);

-- Create Migrations table
CREATE TABLE IF NOT EXISTS Migrations (Filename TEXT NOT NULL);

CREATE INDEX IF NOT EXISTS idx_users_email ON Users (Email);

CREATE INDEX IF NOT EXISTS idx_emailchange_userid ON EmailChange (UserId);

CREATE INDEX IF NOT EXISTS idx_accountrecovery_userid ON AccountRecovery (UserId);

CREATE INDEX IF NOT EXISTS idx_metricevents_metricid ON MetricEvents (MetricId);

CREATE INDEX IF NOT EXISTS idx_metricevents_date ON MetricEvents (Date);

CREATE INDEX IF NOT EXISTS idx_metrics_projectid ON Metrics (ProjectId);

CREATE INDEX IF NOT EXISTS idx_projects_userid ON Projects (UserId);

CREATE INDEX IF NOT EXISTS idx_providers_userid_type ON Providers (UserId, Type);

CREATE INDEX IF NOT EXISTS idx_metrics_parentmetricid ON Metrics (ParentMetricId);

CREATE INDEX IF NOT EXISTS idx_metrics_filtercategory ON Metrics (FilterCategory);

CREATE INDEX IF NOT EXISTS idx_metrics_name ON Metrics (Name);

CREATE INDEX IF NOT EXISTS idx_teamrelation_userid ON TeamRelation (UserId);

CREATE INDEX IF NOT EXISTS idx_teamrelation_projectid ON TeamRelation (ProjectId);

CREATE INDEX IF NOT EXISTS idx_blocks_userid_projectid ON Blocks (UserId, ProjectId);
