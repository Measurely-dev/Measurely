-- Begin the transaction
BEGIN;

-- Add the FilterCategory column to the Metrics table with a default value
ALTER TABLE Metrics
ADD COLUMN IF NOT EXISTS FilterCategory TEXT NOT NULL DEFAULT '';

-- Add the ParentMetricId column to the Metrics table
ALTER TABLE Metrics
ADD COLUMN IF NOT EXISTS ParentMetricId UUID;

-- Update unique constraint for the Metrics table
DO $$
BEGIN
    -- Check if the unique constraint exists and drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'metrics' AND constraint_name = 'metrics_name_appid_key'
    ) THEN
        ALTER TABLE Metrics DROP CONSTRAINT metrics_name_appid_key;
    END IF;

    -- Add the new unique constraint
    ALTER TABLE Metrics
    ADD CONSTRAINT metrics_parentmetricid_name_filtercategory_key UNIQUE (ParentMetricId, Name, FilterCategory);
END $$;

-- Add a foreign key constraint for ParentMetricId referencing Metrics.Id
ALTER TABLE Metrics
ADD CONSTRAINT fk_metrics_parentmetricid
FOREIGN KEY (ParentMetricId) REFERENCES Metrics(Id) ON DELETE CASCADE;

-- Add an index on ParentMetricId for faster lookup
CREATE INDEX IF NOT EXISTS idx_metrics_parentmetricid ON Metrics(ParentMetricId);

-- Add an index on FilterCategory for faster filtering by category
CREATE INDEX IF NOT EXISTS idx_metrics_filtercategory ON Metrics(FilterCategory);

-- Add an index on Name for faster lookup by name
CREATE INDEX IF NOT EXISTS idx_metrics_name ON Metrics(Name);

-- Update default values for NamePos and NameNeg columns
ALTER TABLE Metrics
ALTER COLUMN NamePos SET DEFAULT '',
ALTER COLUMN NameNeg SET DEFAULT '';

-- Commit the transaction
COMMIT;

