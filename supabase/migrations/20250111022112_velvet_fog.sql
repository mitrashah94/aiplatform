/*
  # Fix recursive policies
  
  1. Changes
    - Drop all existing policies
    - Create simplified non-recursive policies
    - Fix infinite recursion issues
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;
DROP POLICY IF EXISTS "organizations_update" ON organizations;
DROP POLICY IF EXISTS "organizations_delete" ON organizations;
DROP POLICY IF EXISTS "view_organizations" ON organizations;
DROP POLICY IF EXISTS "manage_organizations" ON organizations;
DROP POLICY IF EXISTS "view_org_members" ON organization_members;
DROP POLICY IF EXISTS "manage_org_members" ON organization_members;

-- Organization policies (non-recursive)
CREATE POLICY "organizations_select"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

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

-- Organization members policies (non-recursive)
CREATE POLICY "org_members_select"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "org_members_insert"
  ON organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM organizations 
      WHERE id = organization_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "org_members_update"
  ON organization_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM organizations 
      WHERE id = organization_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "org_members_delete"
  ON organization_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM organizations 
      WHERE id = organization_id 
      AND owner_id = auth.uid()
    )
  );