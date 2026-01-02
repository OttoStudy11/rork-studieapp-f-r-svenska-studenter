import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXAM_NOTIFICATIONS_KEY = '@exam_notifications';
const STUDY_REMINDER_NOTIFICATIONS_KEY = '@study_reminder_notifications';

export interface ExamNotificationConfig {
  examId: string;
  examTitle: string;
  examDate: Date;
  courseId?: string;
  notificationIds: string[];
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationManager {
  static async initialize(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Notifications not available on web');
      return;
    }

    try {
      await this.requestPermissions();
      await this.setupNotificationChannels();
      console.log('✅ Notification Manager initialized');
    } catch (error) {
      console.error('Failed to initialize notification manager:', error);
    }
  }

  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      console.log('✅ Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  static async setupNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      await Notifications.setNotificationChannelAsync('exam-reminders', {
        name: 'Provpåminnelser',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#40E0D0',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync('study-reminders', {
        name: 'Studiepåminnelser',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#40E0D0',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync('timer', {
        name: 'Timer',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#40E0D0',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      console.log('✅ Notification channels created');
    } catch (error) {
      console.error('Failed to setup notification channels:', error);
    }
  }

  static async scheduleExamNotifications(
    examId: string,
    examTitle: string,
    examDate: Date,
    courseTitle?: string
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await this.cancelExamNotifications(examId);

      const notificationIds: string[] = [];
      const now = new Date();
      const examTime = new Date(examDate);

      const courseName = courseTitle || 'ditt prov';

      const scheduleTimes = [
        { days: 7, title: '📚 En vecka kvar till prov!', body: `${examTitle} är om 7 dagar. Dags att börja förbereda dig för ${courseName}.` },
        { days: 3, title: '⚡ Tre dagar kvar!', body: `${examTitle} är om 3 dagar. Fortsätt plugga för ${courseName}!` },
        { days: 1, title: '🎯 Imorgon är det dags!', body: `${examTitle} är imorgon. Sista chansen att repetera ${courseName}!` },
        { hours: 3, title: '⏰ Om 3 timmar!', body: `${examTitle} börjar om 3 timmar. Lycka till!` },
        { hours: 1, title: '🚀 Om 1 timme!', body: `${examTitle} börjar snart. Du är redo för detta!` },
      ];

      for (const schedule of scheduleTimes) {
        let triggerDate = new Date(examTime);
        
        if ('days' in schedule && schedule.days) {
          triggerDate.setDate(triggerDate.getDate() - schedule.days);
        } else if ('hours' in schedule && schedule.hours) {
          triggerDate.setHours(triggerDate.getHours() - schedule.hours);
        }

        if (triggerDate > now) {
          const secondsUntilTrigger = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: schedule.title,
              body: schedule.body,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              badge: 1,
              data: {
                type: 'exam-reminder',
                examId,
                examTitle,
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondsUntilTrigger,
              channelId: 'exam-reminders',
            } as Notifications.TimeIntervalTriggerInput,
          });

          notificationIds.push(notificationId);
          console.log(`📅 Scheduled exam notification: ${schedule.title} in ${Math.floor(secondsUntilTrigger / 3600)} hours`);
        }
      }

      const config: ExamNotificationConfig = {
        examId,
        examTitle,
        examDate,
        courseId: courseTitle,
        notificationIds,
      };

      const stored = await AsyncStorage.getItem(EXAM_NOTIFICATIONS_KEY);
      const configs: ExamNotificationConfig[] = stored ? JSON.parse(stored) : [];
      configs.push(config);
      await AsyncStorage.setItem(EXAM_NOTIFICATIONS_KEY, JSON.stringify(configs));

      console.log(`✅ Scheduled ${notificationIds.length} exam notifications for: ${examTitle}`);
    } catch (error) {
      console.error('Failed to schedule exam notifications:', error);
    }
  }

  static async scheduleDailyStudyReminders(
    courseTitle?: string
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await this.cancelDailyStudyReminders();

      const notificationIds: string[] = [];
      const courseName = courseTitle || 'dina kurser';

      const reminderTimes = [
        { hour: 9, minute: 0, title: '☀️ God morgon!', body: `Dags att sätta igång med ${courseName}. Varje minut räknas!` },
        { hour: 14, minute: 0, title: '🎯 Eftermiddagssession', body: `Perfekt tid för en fokuserad studiesession med ${courseName}.` },
        { hour: 18, minute: 0, title: '🌙 Kvällspass', body: `Avsluta dagen med lite plugg på ${courseName}.` },
      ];

      for (const time of reminderTimes) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: time.title,
            body: time.body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.DEFAULT,
            badge: 1,
            data: {
              type: 'study-reminder',
              courseTitle,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: time.hour,
            minute: time.minute,
            channelId: 'study-reminders',
          } as Notifications.DailyTriggerInput,
        });

        notificationIds.push(notificationId);
        console.log(`📚 Scheduled daily study reminder at ${time.hour}:${time.minute.toString().padStart(2, '0')}`);
      }

      await AsyncStorage.setItem(STUDY_REMINDER_NOTIFICATIONS_KEY, JSON.stringify(notificationIds));
      console.log(`✅ Scheduled ${notificationIds.length} daily study reminders`);
    } catch (error) {
      console.error('Failed to schedule daily study reminders:', error);
    }
  }

  static async cancelExamNotifications(examId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const stored = await AsyncStorage.getItem(EXAM_NOTIFICATIONS_KEY);
      if (!stored) return;

      const configs: ExamNotificationConfig[] = JSON.parse(stored);
      const config = configs.find(c => c.examId === examId);

      if (config) {
        for (const notificationId of config.notificationIds) {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        }

        const updatedConfigs = configs.filter(c => c.examId !== examId);
        await AsyncStorage.setItem(EXAM_NOTIFICATIONS_KEY, JSON.stringify(updatedConfigs));
        console.log(`✅ Cancelled ${config.notificationIds.length} exam notifications for: ${config.examTitle}`);
      }
    } catch (error) {
      console.error('Failed to cancel exam notifications:', error);
    }
  }

  static async cancelDailyStudyReminders(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const stored = await AsyncStorage.getItem(STUDY_REMINDER_NOTIFICATIONS_KEY);
      if (!stored) return;

      const notificationIds: string[] = JSON.parse(stored);
      for (const notificationId of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }

      await AsyncStorage.removeItem(STUDY_REMINDER_NOTIFICATIONS_KEY);
      console.log(`✅ Cancelled ${notificationIds.length} daily study reminders`);
    } catch (error) {
      console.error('Failed to cancel daily study reminders:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(EXAM_NOTIFICATIONS_KEY);
      await AsyncStorage.removeItem(STUDY_REMINDER_NOTIFICATIONS_KEY);
      console.log('✅ Cancelled all notifications');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  static async scheduleTimerNotification(
    remainingSeconds: number,
    sessionType: 'focus' | 'break',
    courseName: string
  ): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: sessionType === 'focus' ? '🎯 Fokussession klar!' : '☕ Paus avslutad!',
          body: sessionType === 'focus' 
            ? `Bra jobbat med ${courseName}! Dags för en paus.`
            : 'Pausen är över. Redo för en ny session?',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          badge: 1,
          sticky: false,
          data: {
            type: 'timer-complete',
            sessionType,
            courseName,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: remainingSeconds,
          channelId: 'timer',
        } as Notifications.TimeIntervalTriggerInput,
      });

      console.log(`⏰ Timer notification scheduled for ${remainingSeconds}s`);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule timer notification:', error);
      return null;
    }
  }

  static async showTimerInProgress(
    remainingSeconds: number,
    sessionType: 'focus' | 'break',
    courseName: string
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;

      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: sessionType === 'focus' ? '🎯 Fokuserar...' : '☕ Paus...',
          body: `${timeString} kvar - ${courseName}`,
          sound: false,
          priority: Notifications.AndroidNotificationPriority.LOW,
          badge: 0,
          sticky: true,
          data: {
            type: 'timer-progress',
            sessionType,
            courseName,
            remainingSeconds,
          },
        },
        trigger: null,
      });

      console.log(`⏰ Timer progress notification shown: ${timeString}`);
    } catch (error) {
      console.error('Failed to show timer progress notification:', error);
    }
  }

  static async dismissTimerNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('✅ Dismissed all timer notifications');
    } catch (error) {
      console.error('Failed to dismiss timer notifications:', error);
    }
  }

  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    if (Platform.OS === 'web') return [];

    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`📋 ${notifications.length} scheduled notifications`);
      return notifications;
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }
}
