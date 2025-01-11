/*
  # Projects Schema Update

  1. Changes
    - Add indexes to improve query performance
    - Add cascade delete triggers
    - Add validation checks
  
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with constraints
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS projects_owner_id_idx ON projects(owner_id);
CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON project_members(project_id);
CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON project_members(user_id);

-- Add check constraints
ALTER TABLE projects 
  ADD CONSTRAINT projects_name_length_check 
  CHECK (char_length(name) >= 1 AND char_length(name) <= 100);

-- Add cascade delete trigger for project cleanup
CREATE OR REPLACE FUNCTION cleanup_project()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up any related data when a project is deleted
  DELETE FROM project_members WHERE project_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER project_cleanup
  BEFORE DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_project();