CREATE TABLE IF NOT EXISTS Blocks (
  TeamUserId UUID,
  UserId UUID,
  ProjectId UUID NOT NULL,
  Layout JSONB NOT NULL,
  Labels JSONB NOT NULL,
  UNIQUE(UserId, TeamUserId, ProjectId),
  FOREIGN KEY (TeamUserId, ProjectId) REFERENCES TeamRelation(UserId, ProjectId) ON DELETE CASCADE,
  FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
  FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blocks_userid_projectid ON Blocks(UserId, TeamUserId, ProjectId);  
