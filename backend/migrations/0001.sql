CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET TIME ZONE 'UTC';

-- Create Plans table
CREATE TABLE IF NOT EXISTS Plans (
    Identifier TEXT NOT NULL UNIQUE,
    Name VARCHAR(50) NOT NULL,
    Price TEXT NOT NULL,  
    AppLimit INT NOT NULL,
    MetricPerAppLimit INT NOT NULL,
    RequestLimit INT NOT NULL,
    MonthlyEventLimit BIGINT NOT NULL,
    Range INT NOT NULL
);

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Email VARCHAR(255) NOT NULL UNIQUE,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Password TEXT NOT NULL,
    stripeCustomerId TEXT NOT NULL UNIQUE,
    CurrentPlan TEXT NOT NULL,
    Image TEXT NOT NULL DEFAULT '',
    MonthlyEventCount BIGINT NOT NULL DEFAULT 0,
    StartCountDate TIMESTAMP NOT NULL DEFAULT timezone('UTC', CURRENT_TIMESTAMP),
    FOREIGN KEY (CurrentPlan) REFERENCES Plans(Identifier)
);

-- Create Providers table 
CREATE TABLE IF NOT EXISTS Providers (
  Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  UserId UUID NOT NULL,
  Type SMALLINT NOT NULL,
  ProviderUserId TEXT NOT NULL,
  UNIQUE(Type, ProviderUserId),
  UNIQUE(Type, UserId),
  FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create Applications table
CREATE TABLE IF NOT EXISTS Applications (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ApiKey TEXT NOT NULL UNIQUE,
    UserId UUID NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Image TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
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
    Created TIMESTAMP NOT NULL DEFAULT timezone('UTC', CURRENT_TIMESTAMP),
    UNIQUE(Name, AppId),
    FOREIGN KEY (AppId) REFERENCES Applications(Id) ON DELETE CASCADE
);

-- Create Metric events table
CREATE TABLE IF NOT EXISTS MetricEvents (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    MetricId UUID NOT NULL,
    ValuePos INT NOT NULL,
    ValueNeg INT NOT NULL,
    RelativeTotalPos BIGINT NOT NULL,
    RelativeTotalNeg BIGINT NOT NULL,
    Date TIMESTAMP NOT NULL,
    UNIQUE (MetricId, Date),
    FOREIGN KEY (MetricId) REFERENCES Metrics(Id) ON DELETE CASCADE
);

-- Create Account Recovery table
CREATE TABLE IF NOT EXISTS AccountRecovery (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    UserId UUID NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create Email Change table
CREATE TABLE IF NOT EXISTS EmailChange (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    UserId UUID NOT NULL,
    NewEmail VARCHAR(255) NOT NULL,  
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create Feedback table
CREATE TABLE IF NOT EXISTS Feedbacks (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Email VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON Users(Email);
CREATE INDEX IF NOT EXISTS idx_emailchange_userid ON EmailChange(UserId);  
CREATE INDEX IF NOT EXISTS idx_accountrecovery_userid ON AccountRecovery(UserId);  
CREATE INDEX IF NOT EXISTS idx_metriquevents_metricid ON MetricEvents(MetricId);
CREATE INDEX IF NOT EXISTS idx_metriquevents_date ON MetricEvents(Date);
CREATE INDEX IF NOT EXISTS idx_metrics_appid ON Metrics(AppId);
CREATE INDEX IF NOT EXISTS idx_applications_userid ON Applications(UserId);
CREATE INDEX IF NOT EXISTS idx_providers_userid_type ON Providers(UserId, Type); 
