DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'plans' AND column_name = 'metricperapplimit'
    ) THEN
        ALTER TABLE Plans RENAME COLUMN MetricPerAppLimit TO MetricPerProjectLimit;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'plans' AND column_name = 'applimit'
    ) THEN
        ALTER TABLE Plans RENAME COLUMN AppLimit TO ProjectLimit;
    END IF;
END $$;

