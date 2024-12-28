DO $$
BEGIN
    -- Remove the default value for the "date" column in the "metricevents" table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'metricevents' 
               AND column_name = 'date' 
               AND column_default IS NOT NULL) THEN
        ALTER TABLE metricevents ALTER COLUMN date DROP DEFAULT;
    END IF;

    -- Add a unique constraint on the combination of "metricid" and "date" if it doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'unique_metricid_date' 
                   AND table_name = 'metricevents') THEN
        ALTER TABLE metricevents
        ADD CONSTRAINT unique_metricid_date UNIQUE (metricid, date);
    END IF;
END $$;

