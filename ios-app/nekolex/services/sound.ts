import { Audio } from 'expo-av';

import { getSettings } from './storage';

const SOUND_FILES = {
  correct:  require('@/assets/sounds/correct.mp3'),
  wrong:    require('@/assets/sounds/wrong.mp3'),
  discover: require('@/assets/sounds/discover.mp3'),
  levelup:  require('@/assets/sounds/levelup.mp3'),
} as const;

// iOS でフォアグラウンド再生を有効化
Audio.setAudioModeAsync({
  playsInSilentModeIOS: false,
  staysActiveInBackground: false,
  shouldDuckAndroid: true,
}).catch(() => {});

async function play(key: keyof typeof SOUND_FILES): Promise<void> {
  try {
    const s = await getSettings();
    if (!s.sound_enabled) return;

    const { sound } = await Audio.Sound.createAsync(SOUND_FILES[key]);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    // 再生失敗は無視
  }
}

/** クイズ正解時 */
export const playCorrect  = () => play('correct');
/** クイズ不正解時 */
export const playWrong    = () => play('wrong');
/** 品種発見（初回）時 */
export const playDiscover = () => play('discover');
/** レベルアップ時 */
export const playLevelUp  = () => play('levelup');
