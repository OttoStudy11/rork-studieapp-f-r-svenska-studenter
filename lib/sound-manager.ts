import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type SoundType = 'start' | 'complete' | 'achievement' | 'reminder';

const SOUND_URLS = {
  start: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c3c6d6e4fa.mp3',
  complete: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
  achievement: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3',
  reminder: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c8e7dc40d6.mp3',
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
        false
      );

      this.sounds.set(type, sound);
      console.log(`Sound loaded: ${type}`);
    } catch {
      console.warn(`Failed to load sound ${type}, will retry on play`);
    }
  }

  async preloadAllSounds(): Promise<void> {
    await this.initialize();
    
    if (Platform.OS === 'web') return;

    const soundTypes: SoundType[] = ['start', 'complete', 'achievement', 'reminder'];
    await Promise.all(soundTypes.map(type => this.loadSound(type)));
  }

  async playSound(type: SoundType): Promise<void> {
    if (!this.isEnabled) return;

    if (Platform.OS === 'web') return;

    try {
      let sound = this.sounds.get(type);
      
      if (!sound) {
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: SOUND_URLS[type] },
            { shouldPlay: false, volume: 0.6 },
            null,
            false
          );
          sound = newSound;
          this.sounds.set(type, sound);
        } catch {
          console.warn(`Could not load sound ${type}, skipping playback`);
          return;
        }
      }

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch {
      console.warn(`Sound playback failed for ${type}, continuing without sound`);
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
