import React, { useEffect, useState, useRef } from "react";
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import { View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocationStore } from "@/store";
import { customerService } from "@/lib/customer";


interface Driver {
  id: string;
  vehicleType: string;
  location: { lat: number; lng: number };
}

const BackgroundMap = () => {
  const { userLatitude, userLongitude } = useLocationStore();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const mapRef = useRef<MapView>(null);

  const fetchNearbyDrivers = async () => {
    if (!userLatitude || !userLongitude) return;
    try {
      const data = await customerService.getNearbyDrivers(userLatitude, userLongitude);
      if (data) {
        setDrivers(data);
      }
    } catch (error) {
      console.error("Error fetching nearby drivers:", error);
    }
  };

  useEffect(() => {
    fetchNearbyDrivers();
    const interval = setInterval(fetchNearbyDrivers, 10000); // 10-15s polling
    return () => clearInterval(interval);
  }, [userLatitude, userLongitude]);

  const region = {
    latitude: userLatitude || 21.0379,
    longitude: userLongitude || 105.8342,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {drivers.map((driver) => (
          <Marker.Animated
            key={driver.id}
            coordinate={{
              latitude: driver.location.lat,
              longitude: driver.location.lng,
            }}
          >
            <View className="bg-white p-1 rounded-full shadow-md border border-gray-200">
              <Ionicons
                name={driver.vehicleType === "VAN" || driver.vehicleType === "CAR" ? "car" : "bicycle"}
                size={24}
                color="#16a34a"
              />
            </View>
          </Marker.Animated>
        ))}
      </MapView>
    </View>
  );
};

export default BackgroundMap;
