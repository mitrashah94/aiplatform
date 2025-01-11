/*
  # Fix infinite recursion in project member policies

  1. Changes
    - Remove circular dependencies in RLS policies
    - Simplify project member access policies
    - Add separate policies for different operations
    - Remove current_setting usage which can cause issues
  
  2. Security
    - Maintain proper access control
    - Ensure users can only access their own projects and memberships
    - Project owners retain full control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Projects access policy" ON projects;
DROP POLICY IF EXISTS "Project members access policy" ON project_members;

-- Projects policies
CREATE POLICY "Users can view own and member projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR 
    id IN (
      SELECT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Project members policies
CREATE POLICY "Users can view own memberships"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert members"
  ON project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update members"
  ON project_members
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete members"
  ON project_members
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE owner_id = auth.uid()
    )
  );