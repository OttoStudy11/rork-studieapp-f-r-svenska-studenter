import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationManager } from '@/lib/notification-manager';
import { Platform } from 'react-native';

const TIMER_STATE_KEY = '@timer_state';
const TIMER_NOTIFICATION_ID_KEY = '@timer_notification_id';

export type TimerSessionType = 'focus' | 'break';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  status: TimerStatus;
  sessionType: TimerSessionType;
  totalDuration: number;
  remainingTime: number;
  startTimestamp: number;
  pausedAt?: number;
  courseId?: string;
  courseName: string;
}

export class TimerPersistence {
  static async saveTimerState(state: TimerState): Promise<void> {
    try {
      await AsyncStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
      console.log('Timer state saved:', state.status, state.remainingTime);
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  }

  static async loadTimerState(): Promise<TimerState | null> {
    try {
      const stored = await AsyncStorage.getItem(TIMER_STATE_KEY);
      if (!stored) return null;

      const state: TimerState = JSON.parse(stored);
      
      if (state.status === 'running') {
        const now = Date.now();
        const elapsed = Math.floor((now - state.startTimestamp) / 1000);
        state.remainingTime = Math.max(0, state.remainingTime - elapsed);
        
        if (state.remainingTime <= 0) {
          state.status = 'idle';
        } else {
          state.startTimestamp = now;
        }
      }

      console.log('Timer state loaded:', state.status, state.remainingTime);
      return state;
    } catch (error) {
      console.error('Failed to load timer state:', error);
      return null;
    }
  }

  static async clearTimerState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TIMER_STATE_KEY);
      await this.cancelNotification();
      console.log('Timer state cleared');
    } catch (error) {
      console.error('Failed to clear timer state:', error);
    }
  }

  static async scheduleCompletionNotification(
    remainingSeconds: number,
    sessionType: TimerSessionType,
    courseName: string
  ): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return;
    }

    try {
      await this.cancelNotification();

      const notificationId = await NotificationManager.scheduleTimerNotification(
        remainingSeconds,
        sessionType,
        courseName
      );

      if (notificationId) {
        await AsyncStorage.setItem(TIMER_NOTIFICATION_ID_KEY, notificationId);
        console.log('⏰ Timer completion notification scheduled');
      }
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  static async scheduleProgressNotification(
    delaySeconds: number,
    sessionType: TimerSessionType,
    courseName: string
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const remainingSeconds = delaySeconds;
      await NotificationManager.showTimerInProgress(
        remainingSeconds,
        sessionType,
        courseName
      );
      console.log('⏰ Progress notification shown');
    } catch (error) {
      console.error('Failed to schedule progress notification:', error);
    }
  }

  static async cancelNotification(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const storedId = await AsyncStorage.getItem(TIMER_NOTIFICATION_ID_KEY);
      if (storedId) {
        await AsyncStorage.removeItem(TIMER_NOTIFICATION_ID_KEY);
        console.log('✅ Cancelled timer notification');
      }

      await NotificationManager.dismissTimerNotifications();
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  static async showImmediateNotification(
    title: string,
    body: string
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await NotificationManager.scheduleTimerNotification(
        0,
        'focus',
        body
      );
    } catch (error) {
      console.error('Failed to show immediate notification:', error);
    }
  }

  static async requestNotificationPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      return await NotificationManager.requestPermissions();
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  static async updateBackgroundNotification(
    remainingSeconds: number,
    sessionType: TimerSessionType,
    courseName: string
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await NotificationManager.showTimerInProgress(
        remainingSeconds,
        sessionType,
        courseName
      );
    } catch (error) {
      console.error('Failed to update background notification:', error);
    }
  }
}
