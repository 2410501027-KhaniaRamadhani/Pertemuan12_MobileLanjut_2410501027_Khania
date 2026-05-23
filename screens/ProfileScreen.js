import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { scheduleLocalNotification, registerForPushNotifications } from '../utils/notifications';
import { shareFile } from '../utils/sharing';
import { saveToGallery } from '../utils/calendarAndMedia';
import * as FileSystem from 'expo-file-system';

export default function ProfileScreen() {
  const [profileImage, setProfileImage] = useState(null);
  const [uploadedPosts, setUploadedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await registerForPushNotifications();
      if (token) setPushToken(token);
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin diperlukan', 'App membutuhkan akses galeri untuk memilih foto');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setLoading(true);
      try {

        const resized = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
        );
        setProfileImage(resized.uri);
        
        const newPost = {
          id: Date.now().toString(),
          uri: resized.uri,
          timestamp: new Date().toLocaleString(),
        };
        setUploadedPosts(prev => [newPost, ...prev]);
        
        const DATA_URI = FileSystem.documentDirectory + 'user_posts.json';
        const existingData = await FileSystem.readAsStringAsync(DATA_URI, { encoding: FileSystem.EncodingType.UTF8 }).catch(() => '[]');
        const postsArray = JSON.parse(existingData);
        postsArray.unshift(newPost);
        await FileSystem.writeAsStringAsync(DATA_URI, JSON.stringify(postsArray), { encoding: FileSystem.EncodingType.UTF8 });
        
        Alert.alert('Berhasil', 'Foto berhasil diupload dan disimpan');
      } catch (error) {
        console.log('Error resize:', error);
        Alert.alert('Error', 'Gagal memproses gambar');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveToGallery = async (uri) => {
    const asset = await saveToGallery(uri);
    if (asset) {
      Alert.alert('Tersimpan', 'Foto berhasil disimpan ke galeri di album SocialApp');
    }
  };

  const handleShare = async (uri) => {
    await shareFile(uri);
  };

  const sendNotification = async () => {
    await scheduleLocalNotification(
      'Upload Sukses! 🎉',
      'Foto profil Anda telah diperbarui',
      2
    );
    Alert.alert('Notifikasi', 'Notifikasi akan muncul dalam 2 detik');
  };

  useEffect(() => {
    const loadPosts = async () => {
      const DATA_URI = FileSystem.documentDirectory + 'user_posts.json';
      const info = await FileSystem.getInfoAsync(DATA_URI);
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(DATA_URI);
        const posts = JSON.parse(content);
        setUploadedPosts(posts);
      }
    };
    loadPosts();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>📷</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editButton} onPress={pickImage}>
            <Text style={styles.editButtonText}>Pilih Foto Profil</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>Khania Ramadhani F</Text>
        <Text style={styles.userBio}>2410501027 | Kelas A</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{uploadedPosts.length}</Text>
          <Text style={styles.statLabel}>Postingan</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>726</Text>
          <Text style={styles.statLabel}>Pengikut</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>144</Text>
          <Text style={styles.statLabel}>Mengikuti</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={sendNotification}>
          <Text style={styles.actionBtnText}>🔔 Kirim Notifikasi Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
          <Text style={styles.actionBtnText}>➕ Upload Postingan Baru</Text>
        </TouchableOpacity>
      </View>

      {pushToken && (
        <View style={styles.tokenCard}>
          <Text style={styles.tokenLabel}>Push Token (untuk server):</Text>
          <Text style={styles.tokenValue} numberOfLines={1}>{pushToken}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>📸 Postingan Saya</Text>
      {loading && <ActivityIndicator size="large" color="#ff5a5f" style={{ margin: 20 }} />}
      
      <View style={styles.gallery}>
        {uploadedPosts.map((post) => (
          <View key={post.id} style={styles.postItem}>
            <Image source={{ uri: post.uri }} style={styles.postImageSmall} />
            <View style={styles.postActionsSmall}>
              <TouchableOpacity onPress={() => handleSaveToGallery(post.uri)}>
                <Text style={styles.actionIcon}>💾 Simpan</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleShare(post.uri)}>
                <Text style={styles.actionIcon}>📤 Bagikan</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.postTimestamp}>{post.timestamp}</Text>
          </View>
        ))}
      </View>
      
      {uploadedPosts.length === 0 && !loading && (
        <Text style={styles.emptyText}>Belum ada postingan. Klik "Upload Postingan Baru"</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', paddingTop: 40, paddingBottom: 20, alignItems: 'center', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  avatarContainer: { alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  avatarPlaceholder: { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40 },
  editButton: { backgroundColor: '#ff5a5f', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, marginTop: 5 },
  editButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  userBio: { fontSize: 14, color: '#666', marginTop: 4 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', marginTop: 15, marginHorizontal: 15, paddingVertical: 15, borderRadius: 15 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#ff5a5f' },
  statLabel: { fontSize: 12, color: '#666' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 15, marginHorizontal: 15 },
  actionBtn: { backgroundColor: '#ff5a5f', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 25, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  tokenCard: { backgroundColor: '#fff', margin: 15, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ff5a5f' },
  tokenLabel: { fontWeight: 'bold', fontSize: 12, marginBottom: 4 },
  tokenValue: { fontSize: 10, color: '#555' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, marginTop: 20, marginBottom: 10 },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10 },
  postItem: { width: '48%', backgroundColor: '#fff', marginBottom: 15, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  postImageSmall: { width: '100%', height: 150, resizeMode: 'cover' },
  postActionsSmall: { flexDirection: 'row', justifyContent: 'space-around', padding: 8 },
  actionIcon: { fontSize: 12, color: '#ff5a5f', fontWeight: 'bold' },
  postTimestamp: { fontSize: 10, color: '#999', textAlign: 'center', marginBottom: 8 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 30, marginBottom: 50 },
});