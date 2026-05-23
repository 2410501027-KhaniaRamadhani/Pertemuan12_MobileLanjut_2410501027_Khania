import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';

export async function shareFile(uri, mimeType = 'image/jpeg') {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    console.warn('Sharing tidak tersedia di perangkat ini');
    return false;
  }
  await Sharing.shareAsync(uri, {
    mimeType: mimeType,
    dialogTitle: 'Bagikan foto via...',
  });
  return true;
}

export async function openLink(url) {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) await Linking.openURL(url);
}