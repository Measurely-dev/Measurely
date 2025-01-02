-- Rename indexes from 'metriquevents' to 'metricevents'

-- Drop old index for MetricEvents(MetricId) if it exists
DROP INDEX IF EXISTS idx_metriquevents_metricid;

-- Create new index for MetricEvents(MetricId)
CREATE INDEX IF NOT EXISTS idx_metricevents_metricid ON MetricEvents(MetricId);

-- Drop old index for MetricEvents(Date) if it exists
DROP INDEX IF EXISTS idx_metriquevents_date;

-- Create new index for MetricEvents(Date)
CREATE INDEX IF NOT EXISTS idx_metricevents_date ON MetricEvents(Date);

