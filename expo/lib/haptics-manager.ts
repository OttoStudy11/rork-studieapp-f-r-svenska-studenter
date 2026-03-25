import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

class HapticsManager {
  private isEnabled: boolean = true;

  async triggerHaptic(type: HapticType): Promise<void> {
    if (!this.isEnabled) {
      console.log('Haptics disabled, skipping feedback');
      return;
    }

    if (Platform.OS === 'web') {
      console.log('Haptics not supported on web');
      return;
    }

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
      console.log(`Haptic feedback triggered: ${type}`);
    } catch (error) {
      console.error(`Failed to trigger haptic feedback ${type}:`, error);
    }
  }

  async selectionChanged(): Promise<void> {
    if (!this.isEnabled || Platform.OS === 'web') return;

    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.error('Failed to trigger selection haptic:', error);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`Haptics ${enabled ? 'enabled' : 'disabled'}`);
  }

  isEnabledState(): boolean {
    return this.isEnabled;
  }
}

export const hapticsManager = new HapticsManager();
