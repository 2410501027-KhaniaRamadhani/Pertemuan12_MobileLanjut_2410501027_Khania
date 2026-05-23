import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export async function saveToGallery(photoUri) {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Izin galeri diperlukan untuk menyimpan foto');
    return null;
  }
  
  const asset = await MediaLibrary.saveToLibraryAsync(photoUri);
  
  let album = await MediaLibrary.getAlbumAsync('SocialApp');
  if (album) {
    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  } else {
    await MediaLibrary.createAlbumAsync('SocialApp', asset, false);
  }
  
  return asset;
}