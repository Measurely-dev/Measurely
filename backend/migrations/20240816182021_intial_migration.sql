CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE Users (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Email TEXT NOT NULL UNIQUE,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    Password TEXT NOT NULL,
    Provider INT NOT NULL,
    stripeCustomerId TEXT NOT NULL UNIQUE,
    CurrentPlan TEXT NULL
);


CREATE INDEX idx__userid ON  Users (Id);

-- Create Applications table
CREATE TABLE Applications (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ApiKey TEXT NOT NULL UNIQUE,
    UserId UUID NOT NULL,
    Name TEXT NOT NULL,
    Description TEXT NULL,
    Image TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE INDEX idx_apikey_id ON applications (ApiKey);

-- Create Metric Group table
CREATE TABLE MetricGroups (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    AppId UUID NOT NULL,
    Type INT NOT NULL,
    Name TEXT NOT NULL UNIQUE,
    Enabled BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY (AppId) REFERENCES Applications(Id) ON DELETE CASCADE
);

-- Create Metrics table
CREATE TABLE Metrics(
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    GroupId UUID NOT NULL,
    Name TEXT NOT NULL,
    Total INT NOT NULL DEFAULT 0,
    FOREIGN KEY (GroupId) REFERENCES MetricGroups(Id) ON DELETE CASCADE
);

CREATE INDEX idx_metrics_app_id ON Metrics (GroupId, Id);

-- Create Metric events table
CREATE TABLE MetricEvents (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    MetricId UUID NOT NULL,
    Date TIMESTAMP NOT NULL,
    Type INT NOT NULL,
    Value INT NOT NULL,
    FOREIGN KEY (MetricId) REFERENCES Metrics(Id) ON DELETE CASCADE
);


CREATE INDEX idx_metrics_events_metricid_id ON MetricEvents (MetricId);


-- Create Account Recovery table
CREATE TABLE AccountRecovery (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Code TEXT NOT NULL UNIQUE,
    UserId UUID NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create Feedback table
CREATE TABLE Feedbacks (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Date TIMESTAMP NOT NULL,
    Email TEXT NOT NULL,
    Content TEXT NOT NULL
);

-- Create Plan table 
CREATE TABLE Plans (
    Identifier TEXT NOT NULL UNIQUE,
    Name TEXT NOT NULL,
    Price TEXT NOT NULL,
    AppLimit INT NOT NULL,
    MetricPerAppLimit INT NOT NULL,
    TimeFrames TEXT NOT NULL
);