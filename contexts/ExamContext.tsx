import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { NotificationManager } from '@/lib/notification-manager';

export interface Exam {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  description?: string;
  examDate: Date;
  durationMinutes?: number;
  location?: string;
  examType: 'written' | 'oral' | 'practical' | 'online' | 'other';
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  grade?: string;
  notes?: string;
  notificationEnabled: boolean;
  notificationTimeBeforeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ExamStatistics {
  totalExams: number;
  completedExams: number;
  upcomingExams: number;
  thisWeekExams: number;
  thisMonthExams: number;
  passRate: number;
  averageGrade: string;
}

interface ExamContextType {
  exams: Exam[];
  isLoading: boolean;
  addExam: (exam: Omit<Exam, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExam: (id: string, updates: Partial<Omit<Exam, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  refreshExams: () => Promise<void>;
  upcomingExams: Exam[];
  completedExams: Exam[];
  getExamsForCourse: (courseId: string) => Exam[];
  getUpcomingExamsForCourse: (courseId: string) => Exam[];
  statistics: ExamStatistics;
  getExamById: (id: string) => Exam | undefined;
  urgentExams: Exam[];
}

const dbExamToExam = (dbExam: any): Exam => ({
  id: dbExam.id,
  userId: dbExam.user_id,
  courseId: dbExam.course_id || undefined,
  title: dbExam.title,
  description: dbExam.description || undefined,
  examDate: new Date(dbExam.exam_date),
  durationMinutes: dbExam.duration_minutes || undefined,
  location: dbExam.location || undefined,
  examType: dbExam.exam_type || 'written',
  status: dbExam.status || 'scheduled',
  grade: dbExam.grade || undefined,
  notes: dbExam.notes || undefined,
  notificationEnabled: dbExam.notification_enabled ?? true,
  notificationTimeBeforeMinutes: dbExam.notification_time_before_minutes || 1440,
  createdAt: new Date(dbExam.created_at),
  updatedAt: new Date(dbExam.updated_at)
});

export const [ExamProvider, useExams] = createContextHook((): ExamContextType => {
  const { user, isAuthenticated } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadExams = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setExams([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading exams for user:', user.id);

      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('user_id', user.id)
        .order('exam_date', { ascending: true });

      if (error) {
        console.error('Error loading exams:', error);
        setExams([]);
        return;
      }

      if (data) {
        const examsList = data.map(dbExamToExam);
        setExams(examsList);
        console.log('Loaded exams:', examsList.length);
      }
    } catch (error) {
      console.error('Exception loading exams:', error);
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const addExam = useCallback(async (exam: Omit<Exam, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      console.error('Cannot add exam: No authenticated user');
      return;
    }

    try {
      console.log('Adding exam:', exam.title);

      const { data, error } = await supabase
        .from('exams')
        .insert({
          user_id: user.id,
          course_id: exam.courseId || null,
          title: exam.title,
          description: exam.description || null,
          exam_date: exam.examDate.toISOString(),
          duration_minutes: exam.durationMinutes || null,
          location: exam.location || null,
          exam_type: exam.examType,
          status: exam.status,
          grade: exam.grade || null,
          notes: exam.notes || null,
          notification_enabled: exam.notificationEnabled,
          notification_time_before_minutes: exam.notificationTimeBeforeMinutes
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding exam:', error);
        throw error;
      }

      if (data) {
        const newExam = dbExamToExam(data);
        setExams(prev => [...prev, newExam].sort((a, b) => a.examDate.getTime() - b.examDate.getTime()));
        console.log('Exam added successfully');
        
        // Schedule notifications for the exam
        if (exam.notificationEnabled) {
          await NotificationManager.scheduleExamNotifications(
            data.id,
            exam.title,
            exam.examDate,
            exam.courseId
          );
        }
      }
    } catch (error) {
      console.error('Exception adding exam:', error);
      throw error;
    }
  }, [user]);

  const updateExam = useCallback(async (id: string, updates: Partial<Omit<Exam, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) {
      console.error('Cannot update exam: No authenticated user');
      return;
    }

    try {
      console.log('Updating exam:', id);

      const updateData: any = {};
      if (updates.courseId !== undefined) updateData.course_id = updates.courseId || null;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.examDate !== undefined) updateData.exam_date = updates.examDate.toISOString();
      if (updates.durationMinutes !== undefined) updateData.duration_minutes = updates.durationMinutes || null;
      if (updates.location !== undefined) updateData.location = updates.location || null;
      if (updates.examType !== undefined) updateData.exam_type = updates.examType;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.grade !== undefined) updateData.grade = updates.grade || null;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.notificationEnabled !== undefined) updateData.notification_enabled = updates.notificationEnabled;
      if (updates.notificationTimeBeforeMinutes !== undefined) updateData.notification_time_before_minutes = updates.notificationTimeBeforeMinutes;

      const { data, error } = await supabase
        .from('exams')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating exam:', error);
        throw error;
      }

      if (data) {
        const updatedExam = dbExamToExam(data);
        setExams(prev => prev.map(exam => exam.id === id ? updatedExam : exam).sort((a, b) => a.examDate.getTime() - b.examDate.getTime()));
        console.log('Exam updated successfully');
        
        // Reschedule notifications if notification settings changed
        if (updates.notificationEnabled !== undefined || updates.examDate !== undefined) {
          await NotificationManager.cancelExamNotifications(id);
          if (updatedExam.notificationEnabled) {
            await NotificationManager.scheduleExamNotifications(
              id,
              updatedExam.title,
              updatedExam.examDate,
              updatedExam.courseId
            );
          }
        }
      }
    } catch (error) {
      console.error('Exception updating exam:', error);
      throw error;
    }
  }, [user]);

  const deleteExam = useCallback(async (id: string) => {
    if (!user) {
      console.error('Cannot delete exam: No authenticated user');
      return;
    }

    try {
      console.log('Deleting exam:', id);

      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting exam:', error);
        throw error;
      }

      setExams(prev => prev.filter(exam => exam.id !== id));
      console.log('Exam deleted successfully');
      
      // Cancel notifications for the deleted exam
      await NotificationManager.cancelExamNotifications(id);
    } catch (error) {
      console.error('Exception deleting exam:', error);
      throw error;
    }
  }, [user]);

  const refreshExams = useCallback(async () => {
    await loadExams();
  }, [loadExams]);

  const upcomingExams = exams.filter(exam => {
    const now = new Date();
    return exam.status === 'scheduled' && exam.examDate >= now;
  });

  const completedExams = exams.filter(exam => {
    return exam.status === 'completed' || exam.status === 'missed';
  });

  const getExamsForCourse = useCallback((courseId: string) => {
    return exams.filter(exam => exam.courseId === courseId);
  }, [exams]);

  const getUpcomingExamsForCourse = useCallback((courseId: string) => {
    const now = new Date();
    return exams.filter(exam => {
      return exam.courseId === courseId && 
             exam.status === 'scheduled' && 
             exam.examDate >= now;
    }).sort((a, b) => a.examDate.getTime() - b.examDate.getTime());
  }, [exams]);

  const getExamById = useCallback((id: string) => {
    return exams.find(exam => exam.id === id);
  }, [exams]);

  const urgentExams = exams.filter(exam => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return exam.status === 'scheduled' && exam.examDate >= now && exam.examDate <= threeDaysFromNow;
  });

  const statistics: ExamStatistics = (() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const completed = exams.filter(e => e.status === 'completed' || e.status === 'missed');
    const upcoming = exams.filter(e => e.status === 'scheduled' && e.examDate >= now);
    const thisWeek = upcoming.filter(e => e.examDate <= weekFromNow);
    const thisMonth = upcoming.filter(e => e.examDate <= monthFromNow);
    
    const passed = completed.filter(e => e.grade && !['F', 'IG'].includes(e.grade.toUpperCase()));
    const passRate = completed.length > 0 ? Math.round((passed.length / completed.length) * 100) : 0;
    
    const gradesWithValue = completed.filter(e => e.grade);
    const averageGrade = gradesWithValue.length > 0 ? gradesWithValue[0]?.grade || '-' : '-';
    
    return {
      totalExams: exams.length,
      completedExams: completed.length,
      upcomingExams: upcoming.length,
      thisWeekExams: thisWeek.length,
      thisMonthExams: thisMonth.length,
      passRate,
      averageGrade,
    };
  })();

  return {
    exams,
    isLoading,
    addExam,
    updateExam,
    deleteExam,
    refreshExams,
    upcomingExams,
    completedExams,
    getExamsForCourse,
    getUpcomingExamsForCourse,
    statistics,
    getExamById,
    urgentExams
  };
});
