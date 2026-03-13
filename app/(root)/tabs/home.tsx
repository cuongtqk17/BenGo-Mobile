import React, { useEffect, useState, useCallback } from "react";
import { View, Alert, Dimensions } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useLocationStore } from "@/store";
import { customerService } from "@/lib/customer";
import { router } from "expo-router";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import BackgroundMap from "@/components/Customer/HomeScreen/BackgroundMap";
import FloatingSearchBar from "@/components/Customer/HomeScreen/FloatingSearchBar";
import AddressShortcuts from "@/components/Customer/HomeScreen/AddressShortcuts";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleSearchPress = () => {
    router.push("/(root)/search-destination");
  };

  const handleShortcutPress = (type: string) => {
    if (userData?.savedAddresses) {
      const address = userData.savedAddresses.find((a: any) => a.type === type);
      if (address) {
        setDestinationLocation({
          latitude: address.lat,
          longitude: address.lng,
          address: address.fullAddress,
        });
        router.push("/(root)/confirm-ride");
        return;
      }
    }
    Alert.alert("Thông báo", "Địa chỉ này chưa được thiết lập trong hồ sơ.");
  };



  const fetchInitialData = async () => {
    if (!user?.id) return;
    try {
      // API A3: GET /auth/profile
      const userData = await customerService.getProfile(user.id);
      if (userData) {
        setUserData(userData);
      }


    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let location = await Location.getCurrentPositionAsync();
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const addressString = address && address[0]
        ? `${address[0].name || ""}, ${address[0].region || ""}`.replace(/^, |, $/, "")
        : "Vị trí của bạn";

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: addressString,
      });
    } catch (error) {
      console.error("Location error:", error);
    }
  };

  useEffect(() => {
    requestLocation();
    fetchInitialData();
  }, [user]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
        <BackgroundMap />
        <FloatingSearchBar onPress={handleSearchPress} />
        <AddressShortcuts
          onPress={handleShortcutPress}
          savedAddresses={userData?.savedAddresses}
        />
      </View>
    </GestureHandlerRootView>
  );
}
