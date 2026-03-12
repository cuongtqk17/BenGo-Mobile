import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { formatTime } from "@/lib/utils";
import { DriverCardProps } from "@/types/type";

const DriverCard = ({ item, selected, setSelected }: DriverCardProps) => {
  return (
    <TouchableOpacity
      onPress={setSelected}
      className={`${
        selected === item.id ? "bg-general-600" : "bg-white"
      } flex flex-row items-center justify-between p-4 rounded-xl`}
    >
      <Image
        source={{ uri: item.profile_image_url }}
        className="w-14 h-14 rounded-full"
      />

      <View className="flex flex-col flex-1 justify-center items-start mx-4">
        <View className="flex flex-row justify-start items-center mb-1">
          <Text className="text-lg font-JakartaRegular">{item.title}</Text>

          <View className="flex flex-row items-center ml-2 space-x-1">
            <Image source={icons.star} className="w-3.5 h-3.5" />
            <Text className="text-sm font-JakartaRegular">4</Text>
          </View>
        </View>

        <View className="flex flex-row justify-start items-center">
          <View className="flex flex-row items-center">
            <Text className="ml-1 text-sm font-JakartaRegular">
              {Number(item.price).toLocaleString("vi-VN")} VNĐ
            </Text>
          </View>

          <Text className="mx-1 text-sm font-JakartaRegular text-general-800">
            |
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800">
            {formatTime(parseInt(`${item.time}`) || 5)}
          </Text>

          <Text className="mx-1 text-sm font-JakartaRegular text-general-800">
            |
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800">
            {item.car_seats} chỗ
          </Text>
        </View>
      </View>

      <Image
        source={{ uri: item.car_image_url }}
        className="w-14 h-14"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default DriverCard;
