/*
  # Fix project members policy recursion

  1. Changes
    - Drop existing project members policies
    - Create new, simplified policies without recursion
  
  2. Security
    - Maintain same security model but with more efficient policies
    - Users can still only view and manage projects they have access to
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;

-- Create new, simplified policies
CREATE POLICY "Users can view project members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND (owner_id = auth.uid())
    )
    OR
    user_id = auth.uid()
  );

CREATE POLICY "Project owners can insert members"
  ON project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update members"
  ON project_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete members"
  ON project_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND owner_id = auth.uid()
    )
  );