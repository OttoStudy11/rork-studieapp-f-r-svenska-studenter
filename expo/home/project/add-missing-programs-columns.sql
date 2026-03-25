-- Add missing columns to programs table
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS gymnasium TEXT NOT NULL DEFAULT '';

-- Update the gymnasium column to be NOT NULL after adding default values
UPDATE programs SET gymnasium = 'Unknown' WHERE gymnasium IS NULL OR gymnasium = '';