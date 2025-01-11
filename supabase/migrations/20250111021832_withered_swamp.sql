/*
  # Fix organization and project policies

  1. Changes
    - Drop and recreate policies to prevent recursion
    - Update existing policies with better security rules
    - Add organization context to project policies
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "view_org_members" ON organization_members;
DROP POLICY IF EXISTS "manage_org_members" ON organization_members;
DROP POLICY IF EXISTS "view_organizations" ON organizations;
DROP POLICY IF EXISTS "manage_organizations" ON organizations;
DROP POLICY IF EXISTS "view_projects" ON projects;
DROP POLICY IF EXISTS "create_projects" ON projects;
DROP POLICY IF EXISTS "update_projects" ON projects;
DROP POLICY IF EXISTS "delete_projects" ON projects;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_user ON organization_members(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);

-- Organization members policies (simplified to prevent recursion)
CREATE POLICY "view_org_members"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM organizations 
      WHERE organizations.id = organization_id 
      AND organizations.owner_id = auth.uid()
    )
  );

CREATE POLICY "manage_org_members"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM organizations 
      WHERE organizations.id = organization_id 
      AND organizations.owner_id = auth.uid()
    )
  );

-- Organization policies (simplified)
CREATE POLICY "view_organizations"
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

CREATE POLICY "manage_organizations"
  ON organizations
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Project policies with organization context
CREATE POLICY "view_projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM organization_members 
      WHERE organization_members.organization_id = projects.organization_id 
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "create_projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() AND
    (
      organization_id IS NULL OR
      EXISTS (
        SELECT 1 
        FROM organizations 
        WHERE organizations.id = organization_id 
        AND organizations.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "update_projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    (
      organization_id IS NOT NULL AND
      EXISTS (
        SELECT 1 
        FROM organizations 
        WHERE organizations.id = organization_id 
        AND organizations.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "delete_projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    (
      organization_id IS NOT NULL AND
      EXISTS (
        SELECT 1 
        FROM organizations 
        WHERE organizations.id = organization_id 
        AND organizations.owner_id = auth.uid()
      )
    )
  );

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();