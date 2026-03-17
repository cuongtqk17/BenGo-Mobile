import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AddressShortcutsProps {
  onPress: (type: string) => void;
  savedAddresses?: Array<{ type: string; fullAddress: string; lat: number; lng: number }>;
}

const AddressShortcuts = ({ onPress, savedAddresses }: AddressShortcutsProps) => {
  const defaultShortcuts = [
    { id: "home", title: "Nhà", icon: "home" as const },
    { id: "work", title: "Công ty", icon: "briefcase" as const },
    { id: "recent", title: "Gần đây", icon: "time" as const },
  ];

  return (
    <View className="absolute top-[120px] left-0 right-0 z-50">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
      >
        {defaultShortcuts.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onPress(item.id)}
            className="flex-row items-center bg-white px-4 py-2 rounded-full mr-3 shadow-sm border border-gray-100"
            style={{ elevation: 2 }}
          >
            <Ionicons name={item.icon} size={18} color="black" />
            <Text className="ml-2 font-JakartaMedium text-black">{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default AddressShortcuts;
