-- Enable Supabase Realtime for kanmani_donations so the live stats
-- subscription in KanmaniStats fires when donations are captured.
alter publication supabase_realtime add table kanmani_donations;
