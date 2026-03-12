import { Image, View, ActivityIndicator } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY!;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <View
      className={`flex relative z-50 flex-row justify-center items-center rounded-xl border-0 bg-neutral-100 ${containerStyle}`}
    >
      <GooglePlacesAutocomplete
        fetchDetails={true}
        placeholder={t("home.whereTo")}
        enablePoweredByContainer={false}
        debounce={400}
        minLength={1}
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: 10,
            backgroundColor: "transparent",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            height: 40,
          },
          textInput: {
            backgroundColor: textInputBackgroundColor
              ? textInputBackgroundColor
              : "transparent",
            fontSize: 16,
            fontWeight: "600",
            height: 40,
            width: "100%",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            paddingTop: 0,
            paddingBottom: 0,
            marginTop: -1,
          },
          listView: {
            backgroundColor: textInputBackgroundColor
              ? textInputBackgroundColor
              : "transparent",
            position: "relative",
            top: 0,
            width: "100%",
            shadowColor: "transparent",
            zIndex: 100,
          },
        }}
        onPress={(data, details = null) => {
          setIsLoading(true);
          try {
            handlePress({
              latitude: details?.geometry.location.lat!,
              longitude: details?.geometry.location.lng!,
              address: data.description,
            });
          } finally {
            setIsLoading(false);
          }
        }}
        query={{
          key: googlePlacesApiKey,
          language: "vi",
          components: "country:vn",
          types: "geocode",
        }}
        GooglePlacesDetailsQuery={{
          fields: "geometry,formatted_address",
        }}
        nearbyPlacesAPI="GooglePlacesSearch"
        onFail={(error) => {
          console.error("❌ GooglePlacesAutocomplete onFail:", error);
        }}
        renderLeftButton={() => (
          <View className="justify-center items-center w-6 h-6">
            {isLoading ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <Image
                source={icon ? icon : icons.search}
                className="w-6 h-6"
                resizeMode="contain"
              />
            )}
          </View>
        )}
        textInputProps={{
          placeholderTextColor: "gray",
          placeholder: initialLocation ?? t("home.whereTo"),
          numberOfLines: 1,
          editable: !isLoading,
          scrollEnabled: false,
        }}
      />
    </View>
  );
};

export default GoogleTextInput;
