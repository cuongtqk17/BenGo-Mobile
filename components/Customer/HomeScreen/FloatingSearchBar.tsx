import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
interface FloatingSearchBarProps {
  onPress: () => void;
}

const FloatingSearchBar = ({ onPress }: FloatingSearchBarProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="absolute top-14 left-5 right-5 z-50 flex-row items-center bg-white h-[50px] rounded-[25px] px-4 shadow-lg"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <Ionicons name="search" size={24} color="#6B7280" />
      <Text className="ml-3 text-gray-500 text-base font-JakartaMedium">
        Bạn muốn giao hàng đến đâu?
      </Text>
    </TouchableOpacity>
  );
};

export default FloatingSearchBar;
