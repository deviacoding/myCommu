import { ImageSourcePropType } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

// Le plan gratuit de Firebase n'offre pas de stockage de fichiers : les photos (rabbin, logo)
// sont réduites puis enregistrées dans Firestore sous forme de data URL (≈ 40 à 80 Ko).
const MAX_SIDE = 512;

export async function toStoredImage(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri;
  try {
    const r = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: MAX_SIDE } }], { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG, base64: true });
    if (r.base64) return `data:image/jpeg;base64,${r.base64}`;
  } catch {
    // on garde l'URI d'origine (utile sur le web où elle est déjà locale)
  }
  return uri;
}

export function imageSource(uri?: string | null): ImageSourcePropType | undefined {
  return uri ? { uri } : undefined;
}
