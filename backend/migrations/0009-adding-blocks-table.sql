CREATE TABLE IF NOT EXISTS Blocks (
  TeamRelationId UUID,
  UserId UUID NOT NULL,
  ProjectId UUID NOT NULL,
  Layout JSONB NOT NULL,
  Labels JSONB NOT NULL,
  UNIQUE(UserId, TeamRelationId, ProjectId),
  FOREIGN KEY (TeamRelationId) REFERENCES TeamRelation(Id) ON DELETE CASCADE,
  FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
  FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blocks_userid_projectid ON Blocks(UserId, ProjectId);  
