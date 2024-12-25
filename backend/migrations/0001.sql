CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET timezone = 'UTC';

-- Create Plans table first since it is referenced by Users
CREATE TABLE IF NOT EXISTS Plans (
    Identifier TEXT NOT NULL UNIQUE,
    Name VARCHAR(50) NOT NULL,
    Price TEXT NOT NULL,  -- Use DECIMAL for price to handle calculations
    AppLimit INT NOT NULL,
    MetricPerAppLimit INT NOT NULL,
    RequestLimit INT NOT NULL,
    RANGE INT NOT NULL
);

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Email VARCHAR(255) NOT NULL UNIQUE,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Password TEXT NOT NULL,
    stripeCustomerId TEXT NOT NULL UNIQUE,
    CurrentPlan TEXT NULL,
    Image TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (CurrentPlan) REFERENCES Plans(Identifier),
    INDEX idx_users_email (Email)  -- Index for performance
);

-- Create Providers table (added Provider column definition)
CREATE TABLE IF NOT EXISTS Providers (
  Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  UserId UUID NOT NULL,
  Type SMALLINT NOT NULL,
  ProviderUserId TEXT NOT NULL,
  UNIQUE(Type, ProviderUserId),
  UNIQUE(Type, UserId),
  FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
  INDEX idx_providers_userid_type (UserId, Type)  -- Composite index
);

-- Create Applications table
CREATE TABLE IF NOT EXISTS Applications (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ApiKey TEXT NOT NULL UNIQUE,
    UserId UUID NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Image TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_applications_userid (UserId)  -- Index for UserId
);

-- Create Metrics table
CREATE TABLE IF NOT EXISTS Metrics (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    AppId UUID NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Type SMALLINT NOT NULL,
    TotalPos BIGINT NOT NULL DEFAULT 0,
    TotalNeg BIGINT NOT NULL DEFAULT 0,
    NamePos VARCHAR(50) NOT NULL,
    NameNeg VARCHAR(50) NOT NULL,
    Created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AppId) REFERENCES Applications(Id) ON DELETE CASCADE,
    INDEX idx_metrics_appid (AppId)  
);

-- Create Metric events table
CREATE TABLE IF NOT EXISTS MetricEvents (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    MetricId UUID NOT NULL,
    Value INT NOT NULL,
    RelativeTotalPos BIGINT NOT NULL,
    RelativeTotalNeg BIGINT NOT NULL,
    Date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MetricId) REFERENCES Metrics(Id) ON DELETE CASCADE,
    INDEX idx_metriquevents_metricid (MetricId),  
    INDEX idx_metriquevents_date (Date)
);

-- Create Metric daily summary table
CREATE TABLE IF NOT EXISTS MetricDailySummary (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    MetricId UUID NOT NULL,
    ValuePos INT NOT NULL,
    ValueNeg INT NOT NULL,
    RelativeTotalPos BIGINT NOT NULL,
    RelativeTotalNeg BIGINT NOT NULL,
    Date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(MetricId, Date),
    FOREIGN KEY (MetricId) REFERENCES Metrics(Id) ON DELETE CASCADE,
    INDEX idx_metricdailysummary_metricid_date (MetricId, Date)
);

-- Create Account Recovery table
CREATE TABLE IF NOT EXISTS AccountRecovery (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    UserId UUID NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_accountrecovery_userid (UserId)  
);

-- Create Email Change table
CREATE TABLE IF NOT EXISTS EmailChange (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    UserId UUID NOT NULL,
    NewEmail VARCHAR(255) NOT NULL,  
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_emailchange_userid (UserId)  
);

-- Create Feedback table
CREATE TABLE IF NOT EXISTS Feedbacks (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Email VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL
);
