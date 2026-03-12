import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function AdditionalServices() {
  const { t } = useTranslation();

  return (
    <View className="mb-4">
      <Text className="mb-4 text-xl text-neutral-200 font-JakartaBold">
        {t("home.otherServices")}
      </Text>
      <View className="flex-row justify-between">
        <TouchableOpacity className="flex-1 p-4 mr-2 rounded-xl shadow-sm bg-white/20">
          <View className="items-center">
            <FontAwesome5 name="motorcycle" size={32} color="#052e16" />
            <Text className="text-sm font-bold text-center text-neutral-200 font-JakartaMedium">
              {t("home.motorcycle")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 p-4 mx-1 rounded-xl shadow-sm bg-white/20">
          <View className="items-center">
            <Ionicons name="car-sport" size={32} color="#052e16" />
            <Text className="text-sm font-bold text-center text-neutral-200 font-JakartaMedium">
              {t("home.premiumCar")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 p-4 ml-2 rounded-xl shadow-sm bg-white/20">
          <View className="items-center">
            <MaterialIcons name="local-shipping" size={32} color="#052e16" />
            <Text className="text-sm font-bold text-center text-neutral-200 font-JakartaMedium">
              {t("home.delivery")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
