import { supabase } from './supabase';

export interface CourseAssignmentData {
  userId: string;
  schoolId?: string;
  programId?: string;
  educationLevel: 'gymnasium' | 'bachelor' | 'master' | 'phd';
  educationYear: number;
}

export interface AssignedCourse {
  courseId: string;
  title: string;
  subject: string;
  description: string;
}

export async function assignCoursesAfterOnboarding(
  data: CourseAssignmentData
): Promise<AssignedCourse[]> {
  try {
    console.log('🎓 Starting course assignment:', data);

    const { data: courses, error: coursesError } = await (supabase as any)
      .from('courses')
      .select('*')
      .eq('course_status', 'active')
      .or(`and(school_id.eq.${data.schoolId},program_id.eq.${data.programId},education_level.eq.${data.educationLevel},education_year.eq.${data.educationYear}),and(school_id.is.null,program_id.is.null,education_level.eq.${data.educationLevel})`)
      .limit(20);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return [];
    }

    if (!courses || courses.length === 0) {
      console.warn('No courses found for criteria:', data);
      return [];
    }

    console.log(`✅ Found ${courses.length} courses matching criteria`);

    const assignedCourses: AssignedCourse[] = [];

    for (const course of courses) {
      const existingEnrollment = await (supabase as any)
        .from('user_courses')
        .select('id')
        .eq('user_id', data.userId)
        .eq('course_id', course.id)
        .maybeSingle();

      if (existingEnrollment.data) {
        console.log(`Course ${course.title} already enrolled, skipping`);
        continue;
      }

      const { error: enrollError } = await (supabase as any)
        .from('user_courses')
        .insert({
          user_id: data.userId,
          course_id: course.id,
          progress: 0,
          is_active: true,
        });

      if (enrollError) {
        console.error(`Error enrolling in course ${course.title}:`, enrollError);
        continue;
      }

      assignedCourses.push({
        courseId: course.id,
        title: course.title,
        subject: course.subject,
        description: course.description,
      });

      console.log(`✅ Enrolled in: ${course.title}`);
    }

    console.log(`🎉 Successfully assigned ${assignedCourses.length} courses`);
    return assignedCourses;
  } catch (error) {
    console.error('Error in course assignment:', error);
    throw error;
  }
}

export async function getAssignableCoursesPreview(
  schoolId?: string,
  programId?: string,
  educationLevel?: string,
  educationYear?: number
): Promise<{ id: string; title: string; subject: string }[]> {
  try {
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
