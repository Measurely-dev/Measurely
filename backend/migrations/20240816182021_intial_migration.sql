CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE Users (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
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
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE INDEX idx_apikey_id ON applications (ApiKey);

-- Create Metrics table
CREATE TABLE Metrics(
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    AppId UUID NOT NULL,
    Name TEXT NOT NULL,
    Identifier TEXT NOT NULL,
    Enabled BOOLEAN NOT NULL, 
    FOREIGN KEY (AppId) REFERENCES Applications(Id) ON DELETE CASCADE
);

CREATE INDEX idx_logs_app_id_created_at ON logs (AppId, Time);

-- Create Metric events table
CREATE TABLE MetricEvents (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    MetricId UUID NOT NULL,
    Date TIMESTAMP NOT NULL,
    Type INT NOT NULL,
    Columns TEXT NULL, 
    Value INT NOT NULL,
    FOREIGN KEY (MetricId) REFERENCES Metrics(Id) ON DELETE CASCADE
);


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
    Content TEXT NOT NULL,
    FOREIGN KEY (Date) REFERENCES Analytics(Date) ON DELETE CASCADE
)