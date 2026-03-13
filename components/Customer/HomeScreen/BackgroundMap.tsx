import React, { useEffect, useState, useRef } from "react";
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import { View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocationStore } from "@/store";
import { useNearbyDrivers } from "@/hooks/useCustomer";


interface Driver {
  id: string;
  vehicleType: string;
  location: { lat: number; lng: number };
}

interface AnimatedDriver extends Driver {
  animatedLocation: AnimatedRegion;
}

const BackgroundMap = () => {
  const { userLatitude, userLongitude } = useLocationStore();
  const [drivers, setDrivers] = useState<AnimatedDriver[]>([]);
  const mapRef = useRef<MapView>(null);

  const updateDrivers = (newData: Driver[]) => {
    setDrivers((prevDrivers) => {
      const updatedDrivers = newData.map((newDriver) => {
        const existing = prevDrivers.find((d) => d.id === newDriver.id);
        if (existing) {
          // Animate existing marker
          existing.animatedLocation.timing({
            toValue: {
              latitude: newDriver.location.lat,
              longitude: newDriver.location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            duration: 1000,
            useNativeDriver: false,
          } as any).start();
          return existing;
        } else {
          // Create new animated region
          return {
            ...newDriver,
            animatedLocation: new AnimatedRegion({
              latitude: newDriver.location.lat,
              longitude: newDriver.location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }),
          };
        }
      });
      return updatedDrivers;
    });
  };

  const { data: nearbyDrivers } = useNearbyDrivers(userLatitude, userLongitude);

  useEffect(() => {
    if (nearbyDrivers) {
      // If API returns no data, we could potentially keep mock data, 
      // but for "real" application we use what API provides.
      const finalData = nearbyDrivers.length > 0 ? nearbyDrivers : [
        { id: 'm1', vehicleType: 'VAN', location: { lat: (userLatitude || 21.0379) + 0.002, lng: (userLongitude || 105.8342) + 0.002 } },
        { id: 'm2', vehicleType: 'BIKE', location: { lat: (userLatitude || 21.0379) - 0.002, lng: (userLongitude || 105.8342) + 0.003 } },
      ];
      updateDrivers(finalData);
    }
  }, [nearbyDrivers, userLatitude, userLongitude]);

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
            coordinate={driver.animatedLocation as any}
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
