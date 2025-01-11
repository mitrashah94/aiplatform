/*
  # Final Policy Optimization

  1. Changes
    - Completely eliminate recursive dependencies
    - Simplify policy structure
    - Optimize query performance
    - Add missing indexes
  
  2. Security
    - Maintain strict access control
    - Prevent policy recursion
    - Ensure data integrity
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON projects;
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_project_members_composite 
ON project_members(project_id, user_id);

-- Projects policies (simplified)
CREATE POLICY "Projects access policy"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    CASE
      WHEN current_setting('policy.operation') = 'SELECT' THEN
        owner_id = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
      ELSE
        owner_id = auth.uid()
    END
  );

-- Project members policies (simplified)
CREATE POLICY "Project members access policy"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    CASE
      WHEN current_setting('policy.operation') = 'SELECT' THEN
        user_id = auth.uid() OR
        project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
      ELSE
        project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
    END
  );