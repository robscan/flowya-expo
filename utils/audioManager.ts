/**
 * Audio Manager - Gestión de reproducción de audio
 * Scope 6: Sistema de Narration - Audio Manager
 * 
 * Funcionalidades:
 * - Reproducción de audio pre-grabado (expo-av)
 * - Text-to-Speech (expo-speech)
 * - Control de volumen, pausa, stop
 * - Manejo de errores
 */

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export type AudioSource = {
  type: 'url' | 'tts';
  source: string; // URL para audio pre-grabado, texto para TTS
  language?: string; // Idioma para TTS (opcional, default: 'es')
  rate?: number; // Velocidad de TTS (0.5 - 2.0, default: 1.0)
  pitch?: number; // Tono de TTS (0.5 - 2.0, default: 1.0)
};

export type AudioManagerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';

export interface AudioManagerCallbacks {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
}

class AudioManager {
  private sound: Audio.Sound | null = null;
  private status: AudioManagerStatus = 'idle';
  private currentSource: AudioSource | null = null;
  private callbacks: AudioManagerCallbacks = {};
  private isMuted: boolean = false;

  constructor() {
    // Configurar modo de audio para interrupciones
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch((error) => {
      console.warn('Error configuring audio mode:', error);
    });
  }

  /**
   * Configurar callbacks
   */
  setCallbacks(callbacks: AudioManagerCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Reproducir audio (pre-grabado o TTS)
   */
  async play(source: AudioSource): Promise<void> {
    try {
      // Detener cualquier reproducción anterior
      await this.stop();

      this.currentSource = source;
      this.status = 'loading';

      if (source.type === 'tts') {
        // Text-to-Speech
        await this.playTTS(source);
      } else {
        // Audio pre-grabado
        await this.playAudio(source);
      }
    } catch (error) {
      this.status = 'error';
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.callbacks.onError?.(errorObj);
      throw errorObj;
    }
  }

  /**
   * Reproducir audio pre-grabado usando expo-av
   */
  private async playAudio(source: AudioSource): Promise<void> {
    const { sound } = await Audio.Sound.createAsync(
      { uri: source.source },
      { shouldPlay: !this.isMuted },
      (status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            this.status = 'stopped';
            this.callbacks.onFinish?.();
          }
        }
      }
    );

    this.sound = sound;
    this.status = 'playing';
    this.callbacks.onPlay?.();
  }

  /**
   * Reproducir Text-to-Speech usando expo-speech
   */
  private async playTTS(source: AudioSource): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: Speech.SpeechOptions = {
        language: source.language || 'es',
        pitch: source.pitch || 1.0,
        rate: source.rate || 1.0,
        onStart: () => {
          this.status = 'playing';
          this.callbacks.onPlay?.();
        },
        onDone: () => {
          this.status = 'stopped';
          this.callbacks.onFinish?.();
          resolve();
        },
        onStopped: () => {
          this.status = 'stopped';
          this.callbacks.onStop?.();
        },
        onError: (error) => {
          this.status = 'error';
          const errorObj = new Error(`TTS Error: ${error.message}`);
          this.callbacks.onError?.(errorObj);
          reject(errorObj);
        },
      };

      if (this.isMuted) {
        // Si está silenciado, marcar como completado inmediatamente
        this.status = 'stopped';
        this.callbacks.onFinish?.();
        resolve();
        return;
      }

      Speech.speak(source.source, options);
      resolve();
    });
  }

  /**
   * Pausar reproducción
   */
  async pause(): Promise<void> {
    if (this.status === 'playing') {
      if (this.currentSource?.type === 'tts') {
        Speech.stop();
        this.status = 'paused';
        this.callbacks.onPause?.();
      } else if (this.sound) {
        await this.sound.pauseAsync();
        this.status = 'paused';
        this.callbacks.onPause?.();
      }
    }
  }

  /**
   * Reanudar reproducción
   */
  async resume(): Promise<void> {
    if (this.status === 'paused') {
      if (this.currentSource?.type === 'tts') {
        // TTS no se puede reanudar, reproducir desde el inicio
        if (this.currentSource) {
          await this.play(this.currentSource);
        }
      } else if (this.sound) {
        if (!this.isMuted) {
          await this.sound.playAsync();
        }
        this.status = 'playing';
        this.callbacks.onPlay?.();
      }
    }
  }

  /**
   * Detener reproducción
   */
  async stop(): Promise<void> {
    if (this.status === 'playing' || this.status === 'paused') {
      if (this.currentSource?.type === 'tts') {
        Speech.stop();
      } else if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }

      this.status = 'stopped';
      this.currentSource = null;
      this.callbacks.onStop?.();
    }
  }

  /**
   * Silenciar/activar sonido
   */
  async setMuted(muted: boolean): Promise<void> {
    this.isMuted = muted;

    if (this.status === 'playing') {
      if (this.currentSource?.type === 'tts') {
        if (muted) {
          Speech.stop();
        } else {
          // Reanudar TTS no es posible, se mantiene silenciado
        }
      } else if (this.sound) {
        if (muted) {
          await this.sound.setVolumeAsync(0);
        } else {
          await this.sound.setVolumeAsync(1.0);
        }
      }
    }
  }

  /**
   * Obtener estado actual
   */
  getStatus(): AudioManagerStatus {
    return this.status;
  }

  /**
   * Obtener estado de muted
   */
  getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Limpiar recursos
   */
  async cleanup(): Promise<void> {
    await this.stop();
    this.callbacks = {};
  }
}

// Singleton instance
export const audioManager = new AudioManager();

