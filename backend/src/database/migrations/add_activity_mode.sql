-- Migration: Add modo and preferencia columns to activities table
-- Date: 2025-12-29

-- Add modo column (individual, grupal, ambas)
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS modo VARCHAR(20) DEFAULT 'individual';

-- Add preferencia column (individual, grupal, null)
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS preferencia VARCHAR(20);

-- Update existing activities with default value
UPDATE activities SET modo = 'ambas' WHERE modo IS NULL;

-- Add check constraints
ALTER TABLE activities 
ADD CONSTRAINT check_modo 
CHECK (modo IN ('individual', 'grupal', 'ambas'));

ALTER TABLE activities 
ADD CONSTRAINT check_preferencia 
CHECK (preferencia IN ('individual', 'grupal') OR preferencia IS NULL);
