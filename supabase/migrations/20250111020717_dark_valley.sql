/*
  # Fix Project Policies

  1. Changes
    - Simplify project member policies to prevent recursion
    - Optimize policy performance
    - Maintain security constraints
  
  2. Security
    - Ensure proper access control
    - Prevent infinite recursion in policies
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project owners can insert members" ON project_members;
DROP POLICY IF EXISTS "Project owners can update members" ON project_members;
DROP POLICY IF EXISTS "Project owners can delete members" ON project_members;

-- Create new, optimized policies
CREATE POLICY "Users can view project members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can insert members"
  ON project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update members"
  ON project_members
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete members"
  ON project_members
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid()
    )
  );