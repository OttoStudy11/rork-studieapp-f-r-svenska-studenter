-- Allow authenticated users to insert into university_courses
-- This is needed when courses from constants don't exist in the DB yet

DROP POLICY IF EXISTS "Authenticated users can insert university courses" ON university_courses;
CREATE POLICY "Authenticated users can insert university courses"
  ON university_courses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow upsert (needed for conflict resolution)
DROP POLICY IF EXISTS "Authenticated users can update university courses" ON university_courses;
CREATE POLICY "Authenticated users can update university courses"
  ON university_courses FOR UPDATE
  TO authenticated
  USING (true);
