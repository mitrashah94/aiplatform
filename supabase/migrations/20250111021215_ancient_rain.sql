/*
  # Fix infinite recursion and optimize policies

  1. Changes
    - Remove current_setting usage that causes recursion
    - Optimize policies for better performance
    - Simplify policy logic
  
  2. Security
    - Maintain proper access control
    - Ensure users can only access their own projects and memberships
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own and member projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Owners can update projects" ON projects;
DROP POLICY IF EXISTS "Owners can delete projects" ON projects;
DROP POLICY IF EXISTS "Users can view own memberships" ON project_members;
DROP POLICY IF EXISTS "Owners can insert members" ON project_members;
DROP POLICY IF EXISTS "Owners can update members" ON project_members;
DROP POLICY IF EXISTS "Owners can delete members" ON project_members;

-- Projects policies
CREATE POLICY "view_projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 
      FROM project_members 
      WHERE project_members.project_id = id 
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "create_projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "update_projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "delete_projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Project members policies
CREATE POLICY "view_members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM projects 
      WHERE projects.id = project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "manage_members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM projects 
      WHERE projects.id = project_id 
      AND projects.owner_id = auth.uid()
    )
  );