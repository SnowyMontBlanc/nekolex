import { File, Directory, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const BREEDS_DIR_NAME = 'breeds';
const DEFAULT_MAX_WIDTH = 800;
const DEFAULT_COMPRESS = 0.8;

function getBreedsDirectory(): Directory {
  return new Directory(Paths.document, BREEDS_DIR_NAME);
}

export function ensureBreedsDirectory(): void {
  const dir = getBreedsDirectory();
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
}

export async function resizeImage(
  imageUri: string,
  maxWidth: number = DEFAULT_MAX_WIDTH,
): Promise<string> {
  const result = await manipulateAsync(
    imageUri,
    [{ resize: { width: maxWidth } }],
    { compress: DEFAULT_COMPRESS, format: SaveFormat.JPEG },
  );
  return result.uri;
}

export async function imageToBase64(imageUri: string): Promise<string> {
  const file = new File(imageUri);
  return await file.base64();
}

export async function prepareImageForApi(
  imageUri: string,
): Promise<{ base64: string; mediaType: string }> {
  const resizedUri = await resizeImage(imageUri);
  const base64 = await imageToBase64(resizedUri);
  return { base64, mediaType: 'image/jpeg' };
}

export function saveBreedPhoto(
  imageUri: string,
  breedId: string,
): string {
  try {
    ensureBreedsDirectory();
    const fileName = `${breedId}_${Date.now()}.jpg`;
    const sourceFile = new File(imageUri);
    const destFile = new File(getBreedsDirectory(), fileName);
    sourceFile.copy(destFile);
    return destFile.uri;
  } catch (error) {
    console.error('Failed to save breed photo:', error);
    return imageUri; // Fallback to original URI
  }
}

export function deleteBreedPhoto(photoPath: string): void {
  try {
    const file = new File(photoPath);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.error('Failed to delete breed photo:', error);
  }
}
