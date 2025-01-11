/*
  # Add insert policy for profiles table

  1. Changes
    - Add insert policy to allow authenticated users to create their own profile
  
  2. Security
    - Users can only create a profile with their own user ID
*/

-- Add insert policy for profiles
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);