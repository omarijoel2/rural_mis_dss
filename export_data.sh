#!/bin/bash
psql "$DATABASE_URL" << SQL
-- Export aquifers table
\copy (SELECT * FROM aquifers ORDER BY id) TO STDOUT WITH (FORMAT json) > aquifers_data.json

-- Export drought_events table  
\copy (SELECT * FROM drought_events ORDER BY id) TO STDOUT WITH (FORMAT json) > drought_events_data.json

-- Export competency_assessments table
\copy (SELECT * FROM competency_assessments ORDER BY id) TO STDOUT WITH (FORMAT json) > competency_assessments_data.json

-- Export gender_equity_tracking table
\copy (SELECT * FROM gender_equity_tracking ORDER BY id) TO STDOUT WITH (FORMAT json) > gender_equity_tracking_data.json

-- Export groundwater_monitoring table
\copy (SELECT * FROM groundwater_monitoring ORDER BY id) TO STDOUT WITH (FORMAT json) > groundwater_monitoring_data.json

-- Export vulnerable_groups table
\copy (SELECT * FROM vulnerable_groups ORDER BY id) TO STDOUT WITH (FORMAT json) > vulnerable_groups_data.json
SQL
