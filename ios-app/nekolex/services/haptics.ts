import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { getSettings } from './storage';

async function isEnabled(): Promise<boolean> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;
  const s = await getSettings();
  return s.haptic_enabled;
}

/** クイズ正解・発見成功など、ポジティブな通知 */
export async function hapticSuccess(): Promise<void> {
  if (!(await isEnabled())) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** クイズ不正解など、エラー通知 */
export async function hapticError(): Promise<void> {
  if (!(await isEnabled())) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/** タブタップ・ボタンタップなど、軽い操作フィードバック */
export async function hapticLight(): Promise<void> {
  if (!(await isEnabled())) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** 品種発見（初回）・レベルアップなど、重要イベント */
export async function hapticHeavy(): Promise<void> {
  if (!(await isEnabled())) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}
