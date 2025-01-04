DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'metrics' AND column_name = 'eventcount'
    ) THEN
        ALTER TABLE Metrics
        ADD COLUMN EventCount BIGINT NOT NULL DEFAULT 0;
    END IF;

-- Add RelativeEventCount column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'metricevents' AND column_name = 'relativeeventcount'
    ) THEN
        ALTER TABLE MetricEvents
        ADD COLUMN RelativeEventCount BIGINT NOT NULL DEFAULT 0;
    END IF;

    -- Add EventCount column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'metricevents' AND column_name = 'eventcount'
    ) THEN
        ALTER TABLE MetricEvents
        ADD COLUMN EventCount INT NOT NULL DEFAULT 1;
    END IF;

END $$;

