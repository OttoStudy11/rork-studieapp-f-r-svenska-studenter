import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

export type SoundType = 'start' | 'complete' | 'achievement' | 'reminder';

const SOUND_URLS = {
  start: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c3c6d6e4fa.mp3',
  complete: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
  achievement: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3',
  reminder: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c8e7dc40d6.mp3',
};

class SoundManager {
  private sounds: Map<SoundType, AudioPlayer> = new Map();
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
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'doNotMix',
        interruptionModeAndroid: 'duckOthers',
        shouldRouteThroughEarpiece: false,
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
      const player = createAudioPlayer({ uri: SOUND_URLS[type] });
      player.volume = 0.6;
      this.sounds.set(type, player);
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
      let player = this.sounds.get(type);

      if (!player) {
        try {
          player = createAudioPlayer({ uri: SOUND_URLS[type] });
          player.volume = 0.6;
          this.sounds.set(type, player);
        } catch {
          console.warn(`Could not load sound ${type}, skipping playback`);
          return;
        }
      }

      if (player.isLoaded) {
        await player.seekTo(0);
        player.play();
      }
    } catch {
      console.warn(`Sound playback failed for ${type}, continuing without sound`);
    }
  }

  async stopAllSounds(): Promise<void> {
    if (Platform.OS === 'web') return;

    for (const [type, player] of this.sounds.entries()) {
      try {
        player.pause();
        console.log(`Stopped sound: ${type}`);
      } catch (error) {
        console.error(`Failed to stop sound ${type}:`, error);
      }
    }
  }

  async unloadAllSounds(): Promise<void> {
    if (Platform.OS === 'web') return;

    for (const [type, player] of this.sounds.entries()) {
      try {
        player.release();
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
