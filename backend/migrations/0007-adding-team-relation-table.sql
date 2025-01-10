CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS TeamRelation (
  Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  UserId UUID NOT NULL,
  ProjectId UUID NOT NULL,
  Role SMALLINT NOT NULL,
  UNIQUE (UserId, ProjectId),
  FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
  FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_teamrelation_userid ON TeamRelation(UserId);  
CREATE INDEX IF NOT EXISTS idx_teamrelation_projectid ON TeamRelation(ProjectId);  
