import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function QuickActions() {
  const { t } = useTranslation();

  return (
    <View className="mb-4">
      <Text className="mb-4 text-xl text-neutral-200 font-JakartaBold">
        {t("home.quickServices")}
      </Text>
      <View className="flex-row justify-between">
        <TouchableOpacity
          className="relative flex-1 p-4 mr-2 min-h-[100px] overflow-hidden rounded-xl shadow-sm bg-white/20"
          onPress={() => router.push("/(root)/promos")}
        >
          <Image
            source={require("@/assets/images/rent-car.png")}
            className="absolute bottom-0 top-2/3 -translate-y-1/2 h-[150px] -translate-x-1/4 w-[150px]"
            resizeMode="contain"
          />
          <Text className="absolute top-3 right-3 text-lg font-bold text-center text-neutral-200 font-JakartaMedium">
            {t("promo.availablePromoCodes")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="overflow-hidden relative flex-1 p-4 ml-2 rounded-xl shadow-sm bg-white/20"
          onPress={() => router.push("/(root)/tabs/rides")}
        >
          <Image
            source={require("@/assets/images/history.png")}
            className="absolute bottom-0 top-2/3 -translate-y-1/2 h-[150px] -translate-x-1/4 w-[150px]"
            resizeMode="contain"
          />
          <Text className="absolute top-3 right-3 text-lg font-bold text-center text-neutral-200 font-JakartaMedium">
            {t("home.history")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
