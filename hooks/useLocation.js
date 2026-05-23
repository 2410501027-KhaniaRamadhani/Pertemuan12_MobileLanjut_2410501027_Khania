import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription = null;
    
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Izin lokasi ditolak. Aktifkan di pengaturan.');
        return;
      }
      
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
        (newLoc) => {
          setLocation({
            latitude: newLoc.coords.latitude,
            longitude: newLoc.coords.longitude,
          });
        }
      );
    })();
    
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);
  
  return { location, error };
}