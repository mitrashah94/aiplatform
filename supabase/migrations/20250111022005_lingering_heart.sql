/*
  # Update organization policies
  
  1. Changes
    - Drop all existing organization policies
    - Recreate policies with proper naming
    - Fix policy conflicts
*/

-- Drop existing policies explicitly
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;
DROP POLICY IF EXISTS "organizations_update" ON organizations;
DROP POLICY IF EXISTS "organizations_delete" ON organizations;
DROP POLICY IF EXISTS "view_organizations" ON organizations;
DROP POLICY IF EXISTS "manage_organizations" ON organizations;

-- Create new policies with unique names
CREATE POLICY "organizations_select"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM organization_members 
      WHERE organization_members.organization_id = id 
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "organizations_insert"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "organizations_update"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "organizations_delete"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());