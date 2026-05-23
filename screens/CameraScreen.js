import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [countdown, setCountdown] = useState(0);
  const cameraRef = useRef(null);
  let countdownInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  const startCountdown = () => {
    if (countdown > 0) return; 
    setCountdown(3);
    Vibration.vibrate(50);
    
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          takePicture();
          return 0;
        }
        Vibration.vibrate(50);
        return prev - 1;
      });
    }, 1000);
  };

  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.8 });

      const resized = await ImageManipulator.manipulateAsync(
        pic.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhoto(resized.uri);
      console.log('Foto tersimpan:', resized.uri);
    } catch (error) {
      console.log('Error ambil foto:', error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(prev => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(prev => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  const savePhoto = () => {
    Alert.alert('Sukses', 'Foto akan disimpan ke galeri dari halaman Profile');

    setPhoto(null);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Akses camera diperlukan untuk fitur story</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: photo }} style={styles.previewImage} />
        <View style={styles.previewButtons}>
          <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
            <Text style={styles.buttonText}>📷 Ambil Ulang</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={savePhoto}>
            <Text style={styles.buttonText}>✅ Gunakan Foto</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={() => setCameraReady(true)}
      >
        {countdown > 0 && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
        
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Text style={styles.controlText}>{flash === 'off' ? '⚡ Off' : flash === 'on' ? '⚡ On' : '⚡ Auto'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.captureButton} onPress={startCountdown}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Text style={styles.controlText}>🔄 Flip</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  permissionText: { fontSize: 16, marginBottom: 20, textAlign: 'center', paddingHorizontal: 40 },
  permissionButton: { backgroundColor: '#ff5a5f', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  permissionButtonText: { color: '#fff', fontWeight: 'bold' },
  controls: { position: 'absolute', bottom: 30, flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', alignItems: 'center' },
  controlButton: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 30, minWidth: 70, alignItems: 'center' },
  controlText: { color: '#fff', fontWeight: 'bold' },
  captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  countdownOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  countdownText: { fontSize: 80, fontWeight: 'bold', color: '#fff', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5 },
  previewContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: '80%', resizeMode: 'contain' },
  previewButtons: { flexDirection: 'row', marginTop: 20, gap: 20 },
  retakeButton: { backgroundColor: '#555', padding: 15, borderRadius: 30, paddingHorizontal: 25 },
  saveButton: { backgroundColor: '#ff5a5f', padding: 15, borderRadius: 30, paddingHorizontal: 25 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});