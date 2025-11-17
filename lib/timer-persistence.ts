import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
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

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: sessionType === 'focus' ? '🎯 Focus Session Complete!' : '☕ Break Complete!',
          body: sessionType === 'focus' 
            ? `Great work on ${courseName}! Time for a break.`
            : 'Break is over. Ready for another session?',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: {
          seconds: remainingSeconds,
        },
      });

      await AsyncStorage.setItem(TIMER_NOTIFICATION_ID_KEY, notificationId);
      console.log('Completion notification scheduled for', remainingSeconds, 'seconds');
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
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💪 Keep Going!',
          body: `You've been focused on ${courseName} for ${delaySeconds / 60} minutes!`,
          sound: false,
          priority: Notifications.AndroidNotificationPriority.LOW,
        },
        trigger: {
          seconds: delaySeconds,
        },
      });

      console.log('Progress notification scheduled for', delaySeconds, 'seconds');
    } catch (error) {
      console.error('Failed to schedule progress notification:', error);
    }
  }

  static async cancelNotification(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const storedId = await AsyncStorage.getItem(TIMER_NOTIFICATION_ID_KEY);
      if (storedId) {
        await Notifications.cancelScheduledNotificationAsync(storedId);
        await AsyncStorage.removeItem(TIMER_NOTIFICATION_ID_KEY);
        console.log('Cancelled scheduled notification');
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
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
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to show immediate notification:', error);
    }
  }

  static async requestNotificationPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }
}
