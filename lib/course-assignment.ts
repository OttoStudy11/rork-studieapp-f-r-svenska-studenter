import { supabase } from './supabase';
import { getCoursesForUniversityProgram, getMandatoryCoursesForYear, type UniversityCourse } from '@/constants/university-program-courses';
import { getCoursesForProgramAndYear, type Course as GymnasiumCourse } from '@/constants/gymnasium-courses';
import { UNIVERSITY_PROGRAMS } from '@/constants/universities';

// Maximum number of courses a user can have
export const MAX_COURSES = 15;

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
        
        // Convert term to year: term 1-2 = year 1, term 3-4 = year 2, etc.
        const term = data.educationYear;
        const year = Math.ceil(term / 2) as 1 | 2 | 3 | 4 | 5;
        console.log(`📅 Term ${term} maps to year ${year}`);
        
        // Get mandatory courses for the year directly
        const mandatoryCourses = getMandatoryCoursesForYear(
          data.universityProgramId,
          year
        );

        console.log(`✅ Found ${mandatoryCourses.length} mandatory university courses for year ${year}`);

        // Convert to AssignedCourse format, limited to MAX_COURSES
        coursesToAssign = mandatoryCourses.slice(0, MAX_COURSES).map(course => ({
          courseId: course.id,
          title: course.name,
          subject: course.field,
          description: `${course.name} - ${course.credits} hp`,
          credits: course.credits,
        }));
        
        console.log(`📋 Assigning ${coursesToAssign.length} courses (max ${MAX_COURSES})`);
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

    // Limit to MAX_COURSES
    const limitedCourses = coursesToAssign.slice(0, MAX_COURSES);
    console.log(`📝 Preparing to assign ${limitedCourses.length} courses (max ${MAX_COURSES})`);

    // Now create courses in database and assign to user
    const assignedCourses: AssignedCourse[] = [];

    for (const course of limitedCourses) {
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
          });

        if (courseInsertError) {
          console.error(`❌ Error creating course ${course.title}:`, courseInsertError.message || JSON.stringify(courseInsertError));
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
        assignedCourses.push(course); // Still count as assigned
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

// Generate default courses for programs without defined courses
function getDefaultCoursesForProgram(programId: string, year: 1 | 2 | 3 | 4 | 5): UniversityCourse[] {
  const program = UNIVERSITY_PROGRAMS.find(p => p.id === programId);
  if (!program) {
    console.warn(`Program not found: ${programId}`);
    return [];
  }

  const field = program.field || 'Allmänt';
  const degreeType = program.degreeType;
  
  // Generate generic courses based on program type and year
  const defaultCourses: UniversityCourse[] = [];
  
  // Generate cleaner course IDs
  const programPrefix = programId.replace(/programmet$/, '').substring(0, 20).replace(/[^a-z0-9_]/g, '_');
  
  if (degreeType === 'civilingenjör' || degreeType === 'högskoleingenjör') {
    // Technical programs
    if (year === 1) {
      defaultCourses.push(
        { id: `${programPrefix}_mat1_y1`, code: `${programPrefix.toUpperCase()}-MAT1`, name: 'Matematik I', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
        { id: `${programPrefix}_mat2_y1`, code: `${programPrefix.toUpperCase()}-MAT2`, name: 'Matematik II', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
        { id: `${programPrefix}_prog1_y1`, code: `${programPrefix.toUpperCase()}-PROG1`, name: 'Programmering I', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Datateknik' },
        { id: `${programPrefix}_intro_y1`, code: `${programPrefix.toUpperCase()}-INTRO`, name: `Introduktion till ${field}`, credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field }
      );
    } else if (year === 2) {
      defaultCourses.push(
        { id: `${programPrefix}_mat3_y2`, code: `${programPrefix.toUpperCase()}-MAT3`, name: 'Matematik III', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Matematik' },
        { id: `${programPrefix}_stat_y2`, code: `${programPrefix.toUpperCase()}-STAT`, name: 'Sannolikhetsteori och statistik', credits: 7.5, year: 2, mandatory: true, category: 'grundkurs', field: 'Matematik' },
        { id: `${programPrefix}_spec1_y2`, code: `${programPrefix.toUpperCase()}-SPEC1`, name: `${field} - Grundkurs`, credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field }
      );
    } else if (year === 3) {
      defaultCourses.push(
        { id: `${programPrefix}_adv1_y3`, code: `${programPrefix.toUpperCase()}-ADV1`, name: `Avancerad ${field}`, credits: 7.5, year: 3, mandatory: true, category: 'fördjupningskurs', field },
        { id: `${programPrefix}_proj_y3`, code: `${programPrefix.toUpperCase()}-PROJ`, name: 'Projektarbete', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field }
      );
    }
  } else if (degreeType === 'professionsprogram') {
    // Professional programs (medicine, law, etc.)
    if (year === 1) {
      defaultCourses.push(
        { id: `${programPrefix}_grund1_y1`, code: `${programPrefix.toUpperCase()}-GRUND1`, name: `${field} - Grunder`, credits: 15, year: 1, mandatory: true, category: 'professionskurs', field },
        { id: `${programPrefix}_grund2_y1`, code: `${programPrefix.toUpperCase()}-GRUND2`, name: `${field} - Introduktion`, credits: 15, year: 1, mandatory: true, category: 'professionskurs', field },
        { id: `${programPrefix}_vfu1_y1`, code: `${programPrefix.toUpperCase()}-VFU1`, name: 'Verksamhetsförlagd utbildning I', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field }
      );
    } else if (year === 2) {
      defaultCourses.push(
        { id: `${programPrefix}_ford1_y2`, code: `${programPrefix.toUpperCase()}-FORD1`, name: `${field} - Fördjupning`, credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field },
        { id: `${programPrefix}_vfu2_y2`, code: `${programPrefix.toUpperCase()}-VFU2`, name: 'Verksamhetsförlagd utbildning II', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field }
      );
    } else if (year === 3) {
      defaultCourses.push(
        { id: `${programPrefix}_ex_y3`, code: `${programPrefix.toUpperCase()}-EX`, name: 'Examensarbete', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field },
        { id: `${programPrefix}_vfu3_y3`, code: `${programPrefix.toUpperCase()}-VFU3`, name: 'Verksamhetsförlagd utbildning III', credits: 15, year: 3, mandatory: true, category: 'professionskurs', field }
      );
    }
  } else {
    // Bachelor/Master programs
    if (year === 1) {
      defaultCourses.push(
        { id: `${programPrefix}_intro_y1`, code: `${programPrefix.toUpperCase()}-INTRO`, name: `Introduktion till ${field}`, credits: 15, year: 1, mandatory: true, category: 'grundkurs', field },
        { id: `${programPrefix}_grund1_y1`, code: `${programPrefix.toUpperCase()}-GRUND1`, name: `${field} - Grundkurs I`, credits: 15, year: 1, mandatory: true, category: 'grundkurs', field },
        { id: `${programPrefix}_met_y1`, code: `${programPrefix.toUpperCase()}-MET`, name: 'Vetenskaplig metod', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Metod' }
      );
    } else if (year === 2) {
      defaultCourses.push(
        { id: `${programPrefix}_ford1_y2`, code: `${programPrefix.toUpperCase()}-FORD1`, name: `${field} - Fördjupning I`, credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field },
        { id: `${programPrefix}_ford2_y2`, code: `${programPrefix.toUpperCase()}-FORD2`, name: `${field} - Fördjupning II`, credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field }
      );
    } else if (year === 3) {
      defaultCourses.push(
        { id: `${programPrefix}_kand_y3`, code: `${programPrefix.toUpperCase()}-KAND`, name: 'Kandidatuppsats', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field },
        { id: `${programPrefix}_val_y3`, code: `${programPrefix.toUpperCase()}-VAL`, name: `Valbara kurser i ${field}`, credits: 15, year: 3, mandatory: false, category: 'valbara', field }
      );
    }
  }
  
  return defaultCourses;
}

// Assign university courses using the dedicated university_courses table
export async function assignUniversityCoursesToUser(
  userId: string,
  programId: string,
  term: number
): Promise<AssignedCourse[]> {
  try {
    console.log('🎓 Assigning university courses:', { userId, programId, term });
    
    // Convert term to semester (term 1 = semester 1, term 2 = semester 2, etc.)
    const semester = term;
    const year = Math.ceil(term / 2) as 1 | 2 | 3 | 4 | 5;
    console.log(`📅 Term ${term} = semester ${semester}, year ${year}`);
    
    let coursesToAssign: AssignedCourse[] = [];
    let dbCourses: any[] | null = null;
    
    // First, try to get courses from the database using proper table joins
    try {
      // Query university_program_courses joined with university_courses
      const { data, error } = await supabase
        .from('university_program_courses')
        .select(`
          id,
          semester,
          is_mandatory,
          course:university_courses (
            id,
            course_code,
            title,
            description,
            credits,
            level,
            subject_area
          )
        `)
        .eq('program_id', programId)
        .lte('semester', semester + 1) // Get courses for current and previous semesters
        .gte('semester', semester)
        .eq('is_mandatory', true)
        .limit(MAX_COURSES);
      
      if (error) {
        console.log('📚 DB query error:', error.message);
      } else if (data && data.length > 0) {
        dbCourses = data;
        console.log(`✅ Found ${dbCourses.length} courses in database`);
      }
    } catch (queryError: any) {
      console.warn('⚠️ Database query failed:', queryError?.message);
    }
    
    if (dbCourses && dbCourses.length > 0) {
      // Map database courses to AssignedCourse format
      coursesToAssign = dbCourses
        .filter((pc: any) => pc.course) // Filter out null courses
        .slice(0, MAX_COURSES)
        .map((pc: any) => ({
          courseId: pc.course.id,
          title: pc.course.title,
          subject: pc.course.subject_area || 'Allmänt',
          description: pc.course.description || `${pc.course.title} - ${pc.course.credits} hp`,
          credits: pc.course.credits,
        }));
    }
    
    // Fall back to constants if no courses from database
    if (coursesToAssign.length === 0) {
      console.log('📚 No courses in DB, falling back to constants');
      
      // Fall back to constants - get mandatory courses directly
      let mandatoryCourses = getMandatoryCoursesForYear(programId, year);
      
      // If no courses in constants, generate default courses
      if (mandatoryCourses.length === 0) {
        console.log(`📚 No courses in constants for ${programId}, generating defaults`);
        mandatoryCourses = getDefaultCoursesForProgram(programId, year);
      }
      
      console.log(`📚 Found ${mandatoryCourses.length} courses from constants for ${programId} year ${year}`);
      
      coursesToAssign = mandatoryCourses.slice(0, MAX_COURSES).map(course => ({
        courseId: course.id,
        title: course.name,
        subject: course.field,
        description: `${course.name} - ${course.credits} hp`,
        credits: course.credits,
      }));
    }
    
    if (coursesToAssign.length === 0) {
      console.warn('⚠️ No courses found for program:', programId, 'semester:', semester);
      return [];
    }
    
    console.log(`📝 Enrolling user in ${coursesToAssign.length} university courses (max ${MAX_COURSES})`);
    
    const assignedCourses: AssignedCourse[] = [];
    
    for (const course of coursesToAssign) {
      // First ensure course exists in university_courses table
      const { data: existingUniCourse } = await supabase
        .from('university_courses')
        .select('id')
        .eq('id', course.courseId)
        .maybeSingle();
      
      if (!existingUniCourse) {
        console.log(`📚 Creating university course in database: ${course.courseId}`);
        const { error: insertError } = await supabase.from('university_courses').insert({
          id: course.courseId,
          course_code: course.courseId.toUpperCase(),
          title: course.title,
          description: course.description,
          credits: course.credits || 7.5,
          level: 'grundnivå',
          subject_area: course.subject,
        });
        
        if (insertError) {
          console.error(`❌ Could not create university course ${course.title}:`, insertError);
          // Don't continue to enrollment if course creation failed
          continue;
        } else {
          console.log(`✅ Created university course: ${course.title}`);
        }
      }
      
      // Enroll in user_university_courses (the correct table for university students)
      const { error: enrollError } = await supabase.from('user_university_courses').upsert({
        user_id: userId,
        course_id: course.courseId,
        program_id: programId,
        progress: 0,
        is_active: true,
      }, { onConflict: 'user_id,course_id' });
      
      if (enrollError) {
        console.error(`❌ Could not enroll in university course ${course.title}:`, enrollError);
        continue;
      }
      
      console.log(`✅ Enrolled in: ${course.title}`);
      assignedCourses.push(course);
    }
    
    console.log(`🎉 Successfully assigned ${assignedCourses.length} university courses`);
    return assignedCourses;
  } catch (error) {
    console.error('❌ Error assigning university courses:', error);
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
      .select('id, title, subject');

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
