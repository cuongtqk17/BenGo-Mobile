import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function Stats() {
  return (
    <View className="mb-4">
      <Text className="mb-4 text-xl text-neutral-200 font-JakartaBold">
        Thống kê
      </Text>
      <View className="p-4 rounded-xl shadow-sm bg-white/20">
        <View className="flex-row justify-around">
          <View className="items-center">
            <View className="mb-2">
              <AntDesign name="star" size={20} color="#0286FF" />
            </View>
            <Text className="text-2xl font-JakartaExtraBold text-primary-600">
              4.8
            </Text>
            <Text className="text-sm text-secondary-600">Đánh giá TB</Text>
          </View>
          <View className="w-px bg-secondary-200" />
          <View className="items-center">
            <View className="mb-2">
              <MaterialIcons name="schedule" size={20} color="#38A169" />
            </View>
            <Text className="text-2xl font-JakartaExtraBold text-success-500">
              99%
            </Text>
            <Text className="text-sm text-secondary-600">Đúng giờ</Text>
          </View>
          <View className="w-px bg-secondary-200" />
          <View className="items-center">
            <View className="mb-2">
              <Ionicons name="time" size={20} color="#EAB308" />
            </View>
            <Text className="text-2xl font-JakartaExtraBold text-warning-500">
              24/7
            </Text>
            <Text className="text-sm text-secondary-600">Hoạt động</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
