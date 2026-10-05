import { ImageSourcePropType } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { getDownloadURL, ref, uploadBytes, uploadString } from 'firebase/storage';
import { getStorageBucket } from '../firebase/app';

// Les photos (rabbin, logo) sont réduites en JPEG (≈ 40 à 80 Ko) avant d'être envoyées
// dans Cloud Storage ; à défaut, la data URL est conservée telle quelle dans Firestore.
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

// Réduit l'image puis l'envoie dans Cloud Storage à l'emplacement donné (ex. congregations/{id}/logo.jpg)
// et renvoie son URL publique. En cas d'échec (hors ligne, règles, Storage non configuré), on renvoie
// la data URL réduite : l'application continue de fonctionner, la photo reste simplement dans Firestore.
export async function uploadImage(path: string, uri: string): Promise<string> {
  const dataUrl = await toStoredImage(uri);
  if (!dataUrl.startsWith('data:')) return dataUrl;
  try {
    const fileRef = ref(getStorageBucket(), path);
    await uploadString(fileRef, dataUrl, 'data_url', { contentType: 'image/jpeg' });
    return await getDownloadURL(fileRef);
  } catch (e) {
    console.warn('[storage] envoi impossible, photo conservée en data URL :', path, (e as Error)?.message ?? e);
    return dataUrl;
  }
}

// Envoie un fichier (audio, vidéo) vers Storage et renvoie son URL ; à défaut, l'URI locale (démo, hors ligne).
export async function uploadFile(path: string, uri: string, contentType: string): Promise<string> {
  try {
    const blob = await (await fetch(uri)).blob();
    const fileRef = ref(getStorageBucket(), path);
    await uploadBytes(fileRef, blob, { contentType });
    return await getDownloadURL(fileRef);
  } catch (e) {
    console.warn('[storage] envoi impossible :', path, (e as Error)?.message ?? e);
    return uri;
  }
}

export function imageSource(uri?: string | null): ImageSourcePropType | undefined {
  return uri ? { uri } : undefined;
}
