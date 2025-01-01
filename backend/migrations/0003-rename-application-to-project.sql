-- Ensure the Applications table exists before renaming it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications') THEN
        ALTER TABLE Applications RENAME TO Projects;
    END IF;
END $$;

-- Ensure the Metrics table exists and has the AppId column before renaming it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metrics') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'metrics' AND column_name = 'appid') THEN
        ALTER TABLE Metrics RENAME COLUMN AppId TO ProjectId;
    END IF;
END $$;

-- Update foreign key constraint only if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'metrics_appid_fkey'
    ) THEN
        ALTER TABLE Metrics DROP CONSTRAINT metrics_appid_fkey;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'metrics' AND column_name = 'projectid'
    ) THEN
        ALTER TABLE Metrics ADD CONSTRAINT metrics_projectid_fkey FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE;
    END IF;
END $$;

-- Drop and recreate indexes only if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_metrics_appid'
    ) THEN
        DROP INDEX idx_metrics_appid;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'metrics' AND column_name = 'projectid'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_metrics_projectid ON Metrics(ProjectId);
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_applications_userid'
    ) THEN
        DROP INDEX idx_applications_userid;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'projects' AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'userid')
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_projects_userid ON Projects(UserId);
    END IF;
END $$;
