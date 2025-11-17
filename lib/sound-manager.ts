import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type SoundType = 'start' | 'complete' | 'achievement' | 'reminder';

const SOUND_URLS = {
  start: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  complete: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  achievement: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  reminder: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
};

class SoundManager {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (Platform.OS === 'web') {
      console.log('Sound manager initialized (web mode - limited support)');
      this.isInitialized = true;
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      console.log('Sound manager initialized');
    } catch (error) {
      console.error('Failed to initialize sound manager:', error);
    }
  }

  async loadSound(type: SoundType): Promise<void> {
    if (Platform.OS === 'web') return;
    
    if (this.sounds.has(type)) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUND_URLS[type] },
        { shouldPlay: false, volume: 0.6 },
        null,
        true
      );

      this.sounds.set(type, sound);
      console.log(`Sound loaded: ${type}`);
    } catch (error) {
      console.error(`Failed to load sound ${type}:`, error);
    }
  }

  async preloadAllSounds(): Promise<void> {
    await this.initialize();
    
    if (Platform.OS === 'web') return;

    const soundTypes: SoundType[] = ['start', 'complete', 'achievement', 'reminder'];
    await Promise.all(soundTypes.map(type => this.loadSound(type)));
  }

  async playSound(type: SoundType): Promise<void> {
    if (!this.isEnabled) {
      console.log('Sound disabled, skipping playback');
      return;
    }

    if (Platform.OS === 'web') {
      console.log(`Sound playback not supported on web: ${type}`);
      return;
    }

    try {
      await this.loadSound(type);
      
      const sound = this.sounds.get(type);
      if (!sound) {
        console.warn(`Sound not found: ${type}`);
        return;
      }

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
        console.log(`Playing sound: ${type}`);
      }
    } catch (error) {
      console.error(`Failed to play sound ${type}:`, error);
    }
  }

  async stopAllSounds(): Promise<void> {
    if (Platform.OS === 'web') return;

    for (const [type, sound] of this.sounds.entries()) {
      try {
        await sound.stopAsync();
        console.log(`Stopped sound: ${type}`);
      } catch (error) {
        console.error(`Failed to stop sound ${type}:`, error);
      }
    }
  }

  async unloadAllSounds(): Promise<void> {
    if (Platform.OS === 'web') return;

    for (const [type, sound] of this.sounds.entries()) {
      try {
        await sound.unloadAsync();
        console.log(`Unloaded sound: ${type}`);
      } catch (error) {
        console.error(`Failed to unload sound ${type}:`, error);
      }
    }
    
    this.sounds.clear();
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`Sound ${enabled ? 'enabled' : 'disabled'}`);
  }

  isEnabledState(): boolean {
    return this.isEnabled;
  }
}

export const soundManager = new SoundManager();
