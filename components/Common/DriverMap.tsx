import { icons } from "@/constants";
import { calculateRegion } from "@/lib/map";
import { useLocationStore } from "@/store";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useState } from "react";

interface DriverMapProps {
  rideOriginLatitude?: number;
  rideOriginLongitude?: number;
  rideDestinationLatitude?: number;
  rideDestinationLongitude?: number;
}

const DriverMap = ({
  rideOriginLatitude,
  rideOriginLongitude,
  rideDestinationLatitude,
  rideDestinationLongitude,
}: DriverMapProps) => {
  const { userLongitude: storeUserLongitude, userLatitude: storeUserLatitude } =
    useLocationStore();

  const [directionsReady, setDirectionsReady] = useState(false);

  const originLatitude = rideOriginLatitude || storeUserLatitude;
  const originLongitude = rideOriginLongitude || storeUserLongitude;
  const destinationLatitude = rideDestinationLatitude;
  const destinationLongitude = rideDestinationLongitude;

  const region = calculateRegion({
    userLatitude: originLatitude,
    userLongitude: originLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  if (!originLatitude || !originLongitude) {
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
        <Text className="mt-2 text-sm text-gray-600">Đang tải vị trí...</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ height: "100%", width: "100%" }}
      tintColor="black"
      mapType="standard"
      region={region}
      showsPointsOfInterest={false}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      <Marker
        key="origin"
        coordinate={{
          latitude: Number(originLatitude),
          longitude: Number(originLongitude),
        }}
        title="Điểm đón"
        image={icons.marker}
      />

      {destinationLatitude &&
        destinationLongitude &&
        originLatitude &&
        originLongitude && (
          <>
            <Marker
              key="destination"
              coordinate={{
                latitude: Number(destinationLatitude),
                longitude: Number(destinationLongitude),
              }}
              title="Điểm đến"
              image={icons.pin}
            />

            {/* Thử dùng MapViewDirections trước */}
            <MapViewDirections
              origin={{
                latitude: Number(originLatitude),
                longitude: Number(originLongitude),
              }}
              destination={{
                latitude: Number(destinationLatitude),
                longitude: Number(destinationLongitude),
              }}
              apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY!}
              strokeColor="#2F855A"
              strokeWidth={4}
              precision="high"
              onReady={(result) => {
                setDirectionsReady(true);
              }}
              onError={(errorMessage) => {
                console.warn("⚠️ MapViewDirections lỗi, dùng đường thẳng");
              }}
            />

            {/* Fallback: Hiển thị đường thẳng nếu MapViewDirections chưa ready */}
            {!directionsReady && (
              <Polyline
                coordinates={[
                  {
                    latitude: Number(originLatitude),
                    longitude: Number(originLongitude),
                  },
                  {
                    latitude: Number(destinationLatitude),
                    longitude: Number(destinationLongitude),
                  },
                ]}
                strokeColor="#2F855A"
                strokeWidth={4}
              />
            )}
          </>
        )}
    </MapView>
  );
};

export default DriverMap;
