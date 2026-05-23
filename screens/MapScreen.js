import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';

export default function MapScreen() {
  const { location, error } = useLocation();
  
  const nearbyUsers = [
    { id: '1', lat: -6.2095, lng: 106.8450, name: 'Budi', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', lat: -6.2075, lng: 106.8475, name: 'Siti', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: '3', lat: -6.2105, lng: 106.8440, name: 'Agus', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: '4', lat: -6.2060, lng: 106.8465, name: 'Dewi', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
  ];
  
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff5a5f" />
        <Text>Mengambil lokasi...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker
          coordinate={location}
          title="Posisi Saya"
          description="Anda berada di sini"
          pinColor="#ff5a5f"
        />
        
        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.lat, longitude: user.lng }}
            title={user.name}
            description="Pengguna aktif"
            image={{ uri: user.avatar }}
          />
        ))}
        
        <Circle
          center={location}
          radius={200}
          fillColor="rgba(255,90,95,0.15)"
          strokeColor="#ff5a5f"
          strokeWidth={2}
        />
      </MapView>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>📍 {nearbyUsers.length} pengguna di sekitar (radius 200m)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', padding: 20 },
  infoCard: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 25, alignItems: 'center' },
  infoText: { color: '#fff', fontWeight: 'bold' },
});