-- Add is_suspended column to users table
-- This column was already added manually in the live database
-- but is missing from initial schema.sql — this migration ensures
-- a fresh database setup isn't missing it.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;