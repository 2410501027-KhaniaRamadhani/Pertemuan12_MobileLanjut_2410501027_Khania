// screens/HomeScreen.js
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { scheduleLocalNotification, cancelAllNotifications } from '../utils/notifications';

export default function HomeScreen() {
  const [posts, setPosts] = useState([
    { id: '1', username: 'john_doe', image: 'https://picsum.photos/200/150?random=1', caption: 'Selamat pagi semuanya! 🌞' },
    { id: '2', username: 'jane_smith', image: 'https://picsum.photos/200/150?random=2', caption: 'Liburan seru di pantai 🏖️' },
    { id: '3', username: 'alex_j', image: 'https://picsum.photos/200/150?random=3', caption: 'Kopi pagi ☕' },
  ]);

  const [notifStatus, setNotifStatus] = useState('Belum dikirim');

  const sendTestNotification = async () => {
    await scheduleLocalNotification(
      'Pesan Baru 📩',
      'Anda menerima pesan dari teman!',
      3 // muncul setelah 3 detik
    );
    setNotifStatus('✅ Notifikasi dikirim! Cek notifikasi di HP Anda');
    setTimeout(() => setNotifStatus(''), 3000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.storyContainer}>
        <Text style={styles.sectionTitle}>Stories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3, 4, 5].map((item) => (
            <TouchableOpacity key={item} style={styles.storyItem}>
              <View style={styles.storyRing}>
                <Image source={{ uri: `https://randomuser.me/api/portraits/women/${item}.jpg` }} style={styles.storyImage} />
              </View>
              <Text style={styles.storyName}>User {item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.notifCard}>
        <Text style={styles.sectionTitle}>Test Notifikasi</Text>
        <TouchableOpacity style={styles.notifButton} onPress={sendTestNotification}>
          <Text style={styles.notifButtonText}>📢 Kirim Test Notifikasi (3 detik)</Text>
        </TouchableOpacity>
        {notifStatus !== '' && <Text style={styles.notifStatus}>{notifStatus}</Text>}
      </View>

      <Text style={styles.sectionTitle}>Feed Postingan</Text>
      {posts.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image source={{ uri: `https://randomuser.me/api/portraits/thumb/men/${post.id}.jpg` }} style={styles.avatar} />
            <Text style={styles.username}>{post.username}</Text>
          </View>
          <Image source={{ uri: post.image }} style={styles.postImage} />
          <Text style={styles.caption}>{post.caption}</Text>
          <View style={styles.postActions}>
            <TouchableOpacity><Text style={styles.actionText}>❤️ 12 Suka</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.actionText}>💬 3 Komentar</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, marginTop: 15, marginBottom: 10 },
  storyContainer: { backgroundColor: '#fff', paddingVertical: 10 },
  storyItem: { alignItems: 'center', marginHorizontal: 8 },
  storyRing: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#ff5a5f', justifyContent: 'center', alignItems: 'center' },
  storyImage: { width: 64, height: 64, borderRadius: 32 },
  storyName: { fontSize: 11, marginTop: 5, color: '#333' },
  notifCard: { backgroundColor: '#fff', marginHorizontal: 15, marginVertical: 10, padding: 15, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  notifButton: { backgroundColor: '#ff5a5f', padding: 12, borderRadius: 25, alignItems: 'center' },
  notifButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  notifStatus: { textAlign: 'center', marginTop: 8, color: 'green', fontWeight: 'bold' },
  postCard: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 16 },
  postImage: { width: '100%', height: 250 },
  caption: { padding: 10, fontSize: 14 },
  postActions: { flexDirection: 'row', paddingHorizontal: 10, paddingBottom: 10, gap: 15 },
  actionText: { fontSize: 14, color: '#555' },
});