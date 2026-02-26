import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';
import { NekoLexColors, Typography } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import { prepareImageForApi, saveBreedPhoto } from '@/services/image-processor';
import { identifyBreed, IdentificationError } from '@/services/gemini-api';
import { playDiscover } from '@/services/sound';
import { LevelUpAnimation, DiscoveryAnimation } from '@/components/animations';
import { XP_REWARDS } from '@/utils/xp-calculator';
import breedsData from '@/data/breeds.json';
import type { Breed, IdentificationResult } from '@/types';

const breedMap = new Map((breedsData.breeds as Breed[]).map((b) => [b.id, b]));

type ScreenState = 'select' | 'loading' | 'result' | 'error';

export default function CameraScreen() {
  const router = useRouter();
  const { discoverBreed, discoveredBreeds, pendingLevelUp, clearPendingLevelUp } = useUser();

  const [state, setState] = useState<ScreenState>('select');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);
  const [showDiscoveryAnimation, setShowDiscoveryAnimation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const pickImage = async (fromCamera: boolean) => {
    const permissionResult = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'アクセス許可が必要です',
        fromCamera
          ? 'カメラへのアクセスを許可してください。'
          : '写真ライブラリへのアクセスを許可してください。',
      );
      return;
    }

    const pickerResult = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });

    if (pickerResult.canceled || !pickerResult.assets[0]) return;

    const uri = pickerResult.assets[0].uri;
    setImageUri(uri);
    await processImage(uri);
  };

  const processImage = async (uri: string) => {
    setState('loading');
    setResult(null);
    setIsNewDiscovery(false);

    try {
      const { base64 } = await prepareImageForApi(uri);
      const identification = await identifyBreed(base64);
      setResult(identification);

      // Check if new discovery
      const alreadyDiscovered = identification.breed_id in discoveredBreeds;
      if (!alreadyDiscovered) {
        const savedPhoto = saveBreedPhoto(uri, identification.breed_id);
        await discoverBreed(identification.breed_id, savedPhoto);
        setIsNewDiscovery(true);
        setShowDiscoveryAnimation(true);
        playDiscover();
      }

      setState('result');
    } catch (error) {
      if (error instanceof IdentificationError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('予期しないエラーが発生しました。再試行してください。');
      }
      setState('error');
    }
  };

  const reset = () => {
    setState('select');
    setImageUri(null);
    setResult(null);
    setIsNewDiscovery(false);
    setShowDiscoveryAnimation(false);
    setErrorMessage('');
  };

  const breed = result ? breedMap.get(result.breed_id) : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Image Preview */}
      {imageUri && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
        </View>
      )}

      {/* Select State */}
      {state === 'select' && (
        <View style={styles.selectContainer}>
          <Text style={styles.title}>猫の品種を調べよう</Text>
          <Text style={styles.subtitle}>写真を撮るか、ギャラリーから選んでください</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => pickImage(true)}>
              <View style={styles.buttonContent}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>写真を撮る</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => pickImage(false)}>
              <View style={styles.buttonContent}>
                <Ionicons name="images-outline" size={20} color={NekoLexColors.primary} />
                <Text style={styles.secondaryButtonText}>ギャラリー</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Loading State */}
      {state === 'loading' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={NekoLexColors.primary} />
          <Text style={styles.loadingText}>識別中...</Text>
        </View>
      )}

      {/* Result State */}
      {state === 'result' && result && breed && (
        <View style={styles.resultContainer}>
              <Text style={styles.resultName}>{breed.name_ja}</Text>
          <Text style={styles.resultNameEn}>{breed.name_en}</Text>

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>信頼度</Text>
            <Text style={styles.confidenceValue}>
              {Math.round(result.confidence * 100)}%
            </Text>
          </View>

          {result.characteristics.length > 0 && (
            <View style={styles.characteristicsSection}>
              <Text style={styles.characteristicsTitle}>識別した特徴</Text>
              {result.characteristics.map((c, i) => (
                <Text key={i} style={styles.characteristicItem}>
                  • {c}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push(`/breed/${result.breed_id}`)}>
              <Text style={styles.buttonText}>図鑑で見る</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
              <Text style={styles.secondaryButtonText}>もう一度撮る</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Error State */}
      {state === 'error' && (
        <View style={styles.errorContainer}>
          <Ionicons name="sad-outline" size={48} color={NekoLexColors.textLight} />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={reset}>
            <Text style={styles.buttonText}>もう一度試す</Text>
          </TouchableOpacity>
        </View>
      )}
      {showDiscoveryAnimation && result && breedMap.get(result.breed_id) && (
        <DiscoveryAnimation
          breedName={breedMap.get(result.breed_id)!.name_ja}
          xp={XP_REWARDS.DISCOVER_BREED}
          onComplete={() => setShowDiscoveryAnimation(false)}
        />
      )}
      {pendingLevelUp !== null && (
        <LevelUpAnimation newLevel={pendingLevelUp} onComplete={clearPendingLevelUp} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NekoLexColors.background,
  },
  imagePreview: {
    height: 250,
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  selectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: Typography.heading.fontSize, fontWeight: '800' as const, letterSpacing: -0.5,
    color: NekoLexColors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: NekoLexColors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: NekoLexColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: Typography.bodyLg.fontSize, fontWeight: '800' as const, letterSpacing: 0.2,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: NekoLexColors.surface,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NekoLexColors.primary,
  },
  secondaryButtonText: {
    fontSize: Typography.bodyLg.fontSize, fontWeight: '800' as const, letterSpacing: 0.2,
    color: NekoLexColors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    ...Typography.body,
    color: NekoLexColors.textLight,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  resultName: {
    fontSize: Typography.heading.fontSize, fontWeight: '800' as const, letterSpacing: -0.5,
    color: NekoLexColors.text,
  },
  resultNameEn: {
    ...Typography.body,
    color: NekoLexColors.textLight,
    marginBottom: 16,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: NekoLexColors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  confidenceLabel: {
    ...Typography.body,
    color: NekoLexColors.textLight,
  },
  confidenceValue: {
    fontSize: Typography.subheading.fontSize, fontWeight: '700' as const,
    color: NekoLexColors.secondary,
  },
  characteristicsSection: {
    marginBottom: 20,
  },
  characteristicsTitle: {
    fontSize: Typography.subheading.fontSize, fontWeight: '700' as const,
    color: NekoLexColors.text,
    marginBottom: 8,
  },
  characteristicItem: {
    ...Typography.body,
    color: NekoLexColors.text,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    ...Typography.body,
    color: NekoLexColors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
});
