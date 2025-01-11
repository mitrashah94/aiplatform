/*
  # Add organizations and fix recursion issues

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `owner_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `organization_members`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `user_id` (uuid, references auth.users)
      - `role` (text)
      - `created_at` (timestamptz)

  2. Changes
    - Add organization_id to projects table
    - Update project policies to check organization membership
    - Fix recursion issues in policies
  
  3. Security
    - Enable RLS on new tables
    - Add appropriate policies for organizations and members
*/

-- Create organizations table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create organization_members table
CREATE TABLE organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Add organization_id to projects
ALTER TABLE projects 
ADD COLUMN organization_id uuid REFERENCES organizations ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organization_members_org_user ON organization_members(organization_id, user_id);
CREATE INDEX idx_projects_organization_id ON projects(organization_id);

-- Organization policies
CREATE POLICY "view_organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR 
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "create_organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "update_organizations"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "delete_organizations"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Organization members policies
CREATE POLICY "view_org_members"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT id 
      FROM organizations 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "manage_org_members"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT id 
      FROM organizations 
      WHERE owner_id = auth.uid()
    )
  );

-- Update project policies to include organization context
DROP POLICY IF EXISTS "view_projects" ON projects;
DROP POLICY IF EXISTS "create_projects" ON projects;
DROP POLICY IF EXISTS "update_projects" ON projects;
DROP POLICY IF EXISTS "delete_projects" ON projects;

CREATE POLICY "view_projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
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
      organization_id IN (
        SELECT id 
        FROM organizations 
        WHERE owner_id = auth.uid()
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
      organization_id IN (
        SELECT id 
        FROM organizations 
        WHERE owner_id = auth.uid()
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
      organization_id IN (
        SELECT id 
        FROM organizations 
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Update project members policies to include organization context
DROP POLICY IF EXISTS "view_members" ON project_members;
DROP POLICY IF EXISTS "manage_members" ON project_members;

CREATE POLICY "view_members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE owner_id = auth.uid() OR
      organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "manage_members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE owner_id = auth.uid() OR
      organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Add trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();