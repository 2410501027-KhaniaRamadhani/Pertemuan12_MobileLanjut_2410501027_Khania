import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.warn('Push notif hanya jalan di device nyata!');
    return null;
  }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('Permission notifikasi ditolak');
    return null;
  }
  
  const token = await Notifications.getExpoPushTokenAsync();
  console.log('Push Token:', token.data);
  return token.data;
}

export async function scheduleLocalNotification(title, body, seconds = 1) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: { screen: 'Profile' },
      sound: true,
    },
    trigger: { seconds: seconds },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}