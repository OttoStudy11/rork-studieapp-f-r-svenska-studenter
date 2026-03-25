-- Add missing subject_area column to university_courses table
-- This column is required for filtering and organizing university courses by subject

-- Add subject_area column
ALTER TABLE university_courses 
ADD COLUMN IF NOT EXISTS subject_area TEXT NOT NULL DEFAULT 'General';

-- Update existing courses with appropriate subject areas based on course codes
-- Mathematics courses
UPDATE university_courses 
SET subject_area = 'Mathematics' 
WHERE course_code LIKE 'SF%' OR course_code LIKE 'MA%';

-- Engineering/Technology courses  
UPDATE university_courses
SET subject_area = 'Engineering'
WHERE course_code LIKE 'DD%' OR course_code LIKE 'TN%' OR course_code LIKE 'IE%';

-- Computer Science courses
UPDATE university_courses
SET subject_area = 'Computer Science'
WHERE course_code LIKE 'DT%' OR course_code LIKE 'DA%' OR course_code LIKE 'TDA%';

-- Physics courses
UPDATE university_courses
SET subject_area = 'Physics'
WHERE course_code LIKE 'FY%' OR course_code LIKE 'SI%';

-- Chemistry courses
UPDATE university_courses
SET subject_area = 'Chemistry'
WHERE course_code LIKE 'KE%' OR course_code LIKE 'TK%';

-- Economics/Business courses
UPDATE university_courses
SET subject_area = 'Economics'
WHERE course_code LIKE 'EC%' OR course_code LIKE 'FE%' OR course_code LIKE 'HA%';

-- Language courses
UPDATE university_courses
SET subject_area = 'Languages'
WHERE course_code LIKE 'EN%' OR course_code LIKE 'SV%' OR course_code LIKE 'SP%' OR course_code LIKE 'FR%' OR course_code LIKE 'TY%';

-- Social Sciences courses
UPDATE university_courses
SET subject_area = 'Social Sciences'
WHERE course_code LIKE 'SK%' OR course_code LIKE 'SO%' OR course_code LIKE 'PS%';

-- Medicine/Health courses
UPDATE university_courses
SET subject_area = 'Medicine'
WHERE course_code LIKE 'ME%' OR course_code LIKE 'VÅ%' OR course_code LIKE 'BI%';

-- Law courses
UPDATE university_courses
SET subject_area = 'Law'
WHERE course_code LIKE 'JU%' OR course_code LIKE 'RÄ%';

-- Arts/Humanities courses
UPDATE university_courses
SET subject_area = 'Arts & Humanities'
WHERE course_code LIKE 'KU%' OR course_code LIKE 'HI%' OR course_code LIKE 'FI%' OR course_code LIKE 'RE%';

-- Architecture/Design courses
UPDATE university_courses
SET subject_area = 'Architecture'
WHERE course_code LIKE 'AR%' OR course_code LIKE 'AF%';

-- Environmental Sciences courses
UPDATE university_courses
SET subject_area = 'Environmental Sciences'
WHERE course_code LIKE 'MI%' OR course_code LIKE 'MJ%';

-- Education courses
UPDATE university_courses
SET subject_area = 'Education'
WHERE course_code LIKE 'PE%' OR course_code LIKE 'UT%';

COMMENT ON COLUMN university_courses.subject_area IS 'Subject area classification for organizing and filtering courses';
