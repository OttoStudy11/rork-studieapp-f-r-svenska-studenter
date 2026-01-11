import { supabase } from './supabase';
import { getCoursesForUniversityProgram } from '@/constants/university-program-courses';
import { getCoursesForProgramAndYear, type Course as GymnasiumCourse } from '@/constants/gymnasium-courses';

export interface CourseAssignmentData {
  userId: string;
  schoolId?: string;
  programId?: string;
  educationLevel: 'gymnasium' | 'hogskola' | 'bachelor' | 'master' | 'phd';
  educationYear: number;
  universityProgramId?: string;
  gymnasiumProgram?: string;
}

export interface AssignedCourse {
  courseId: string;
  title: string;
  subject: string;
  description: string;
  credits?: number;
}

export async function assignCoursesAfterOnboarding(
  data: CourseAssignmentData
): Promise<AssignedCourse[]> {
  try {
    console.log('🎓 Starting course assignment:', data);

    let coursesToAssign: AssignedCourse[] = [];

    // Handle university/högskola courses
    if (data.educationLevel === 'hogskola' || data.educationLevel === 'bachelor' || data.educationLevel === 'master') {
      if (data.universityProgramId) {
        console.log('📚 Assigning university courses for program:', data.universityProgramId);
        const universityCourses = getCoursesForUniversityProgram(
          data.universityProgramId,
          data.educationYear as 1 | 2 | 3 | 4 | 5
        );

        console.log(`✅ Found ${universityCourses.length} university courses for year ${data.educationYear}`);

        // Filter mandatory courses for the year
        const mandatoryCourses = universityCourses.filter(c => c.mandatory);
        console.log(`📋 ${mandatoryCourses.length} mandatory courses`);

        // Convert to AssignedCourse format
        coursesToAssign = mandatoryCourses.map(course => ({
          courseId: course.id,
          title: course.name,
          subject: course.field,
          description: `${course.name} - ${course.credits} hp`,
          credits: course.credits,
        }));
      }
    }
    // Handle gymnasium courses
    else if (data.educationLevel === 'gymnasium') {
      if (data.gymnasiumProgram) {
        console.log('📚 Assigning gymnasium courses for program:', data.gymnasiumProgram);
        const gymnasiumCourses = getCoursesForProgramAndYear(
          data.gymnasiumProgram,
          data.educationYear as 1 | 2 | 3
        );

        console.log(`✅ Found ${gymnasiumCourses.length} gymnasium courses for year ${data.educationYear}`);

        // Convert to AssignedCourse format
        coursesToAssign = gymnasiumCourses.map((course: GymnasiumCourse) => ({
          courseId: course.code,
          title: course.name,
          subject: extractSubjectFromCode(course.code),
          description: `${course.name} - ${course.points} poäng`,
          credits: course.points,
        }));
      }
    }

    if (coursesToAssign.length === 0) {
      console.warn('⚠️ No courses found for criteria:', data);
      return [];
    }

    console.log(`📝 Preparing to assign ${coursesToAssign.length} courses`);

    // Now create courses in database and assign to user
    const assignedCourses: AssignedCourse[] = [];

    for (const course of coursesToAssign) {
      // First, ensure course exists in courses table
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('id', course.courseId)
        .single();

      if (!existingCourse) {
        // Create course if it doesn't exist
        const { error: courseInsertError } = await supabase
          .from('courses')
          .insert({
            id: course.courseId,
            title: course.title,
            description: course.description,
            subject: course.subject,
            level: data.educationLevel === 'gymnasium' ? 'gymnasie' : 'hogskola',
            resources: ['Kursmaterial', 'Övningsuppgifter'],
            tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
            related_courses: [],
            progress: 0,
            course_status: 'active',
          });

        if (courseInsertError) {
          console.error(`❌ Error creating course ${course.title}:`, courseInsertError);
          continue;
        }
      }

      // Check if user is already enrolled
      const { data: existingEnrollment } = await supabase
        .from('user_courses')
        .select('id')
        .eq('user_id', data.userId)
        .eq('course_id', course.courseId)
        .maybeSingle();

      if (existingEnrollment) {
        console.log(`⏭️ Course ${course.title} already enrolled, skipping`);
        continue;
      }

      // Enroll user in course
      const { error: enrollError } = await supabase
        .from('user_courses')
        .insert({
          user_id: data.userId,
          course_id: course.courseId,
          progress: 0,
          is_active: true,
        });

      if (enrollError) {
        console.error(`❌ Error enrolling in course ${course.title}:`, enrollError);
        continue;
      }

      assignedCourses.push(course);
      console.log(`✅ Enrolled in: ${course.title}`);
    }

    console.log(`🎉 Successfully assigned ${assignedCourses.length} courses`);
    return assignedCourses;
  } catch (error) {
    console.error('❌ Error in course assignment:', error);
    throw error;
  }
}

// Helper function to extract subject from course code
function extractSubjectFromCode(courseCode: string): string {
  const subjectMappings: Record<string, string> = {
    'ENG': 'Engelska',
    'HIS': 'Historia',
    'IDR': 'Idrott och hälsa',
    'MAT': 'Matematik',
    'NAK': 'Naturkunskap',
    'REL': 'Religionskunskap',
    'SAM': 'Samhällskunskap',
    'SVE': 'Svenska',
    'BIO': 'Biologi',
    'FYS': 'Fysik',
    'KEM': 'Kemi',
    'MOD': 'Moderna språk',
    'TEK': 'Teknik',
    'FIL': 'Filosofi',
    'PSK': 'Psykologi',
    'FÖR': 'Företagsekonomi',
    'JUR': 'Juridik',
  };

  const match = courseCode.match(/^([A-Z]{3})/);
  const prefix = match ? match[1] : courseCode.substring(0, 3).toUpperCase();

  return subjectMappings[prefix] || 'Okänt ämne';
}

export async function getAssignableCoursesPreview(
  schoolId?: string,
  programId?: string,
  educationLevel?: string,
  educationYear?: number,
  universityProgramId?: string
): Promise<{ id: string; title: string; subject: string }[]> {
  try {
    // For university/högskola, get courses from constants
    if ((educationLevel === 'hogskola' || educationLevel === 'bachelor' || educationLevel === 'master') && universityProgramId) {
      const courses = getCoursesForUniversityProgram(
        universityProgramId,
        educationYear as 1 | 2 | 3 | 4 | 5
      );

      return courses
        .filter(c => c.mandatory)
        .slice(0, 10)
        .map(course => ({
          id: course.id,
          title: course.name,
          subject: course.field,
        }));
    }

    // For gymnasium or fallback to database
    let query = (supabase as any)
      .from('courses')
      .select('id, title, subject, emoji')
      .eq('course_status', 'active');

    if (schoolId && programId && educationLevel && educationYear) {
      query = query.or(
        `and(school_id.eq.${schoolId},program_id.eq.${programId},education_level.eq.${educationLevel},education_year.eq.${educationYear}),and(school_id.is.null,program_id.is.null,education_level.eq.${educationLevel})`
      );
    } else if (educationLevel) {
      query = query.eq('education_level', educationLevel);
    }

    const { data, error } = await query.limit(10);

    if (error) {
      console.error('Error fetching course preview:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in course preview:', error);
    return [];
  }
}
