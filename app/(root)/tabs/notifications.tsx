import React from "react";
import { View, Text, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/constants";
import { useTranslation } from "react-i18next";

const NotificationsScreen = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4">
        <Text className="text-2xl font-JakartaBold">{t("home.notifications") || "Thông báo"}</Text>
      </View>
      <View className="flex-1 justify-center items-center">
        <Image
          source={images.noResult}
          className="w-40 h-40"
          alt="No notifications"
          resizeMode="contain"
        />
        <Text className="text-base font-JakartaMedium text-gray-500 mt-4">
          {t("notifications.noNotifications") || "Bạn chưa có thông báo nào"}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
