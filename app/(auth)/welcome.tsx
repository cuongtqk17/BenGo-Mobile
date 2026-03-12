import CustomButton from "@/components/Common/CustomButton";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SwiperFlatList from "react-native-swiper-flatlist";
import { onboarding } from "../../constants";
import { useTranslation } from "react-i18next";

const { width: screenWidth } = Dimensions.get("window");

const Onboarding = () => {
  const { t } = useTranslation();
  const swiperRef = useRef<SwiperFlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView className="flex justify-between items-center h-full bg-white">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        className="flex justify-end items-end p-4 w-full"
      >
        <Text className="text-black text-md font-JakartaBold">
          {t("common.cancel")}
        </Text>
      </TouchableOpacity>

      <SwiperFlatList
        ref={swiperRef}
        autoplay={false}
        autoplayDelay={2}
        index={activeIndex}
        showPagination={true}
        paginationStyle={{
          position: "absolute",
          bottom: 150,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
        paginationStyleItem={{
          width: 32,
          height: 4,
          marginHorizontal: 4,
          borderRadius: 2,
        }}
        paginationStyleItemActive={{
          backgroundColor: "#68D391",
        }}
        paginationStyleItemInactive={{
          backgroundColor: "#E2E8F0",
        }}
        onChangeIndex={({ index }) => setActiveIndex(index)}
        data={onboarding}
        renderItem={({ item, index }) => (
          <View
            key={item.id}
            className="flex justify-center items-center p-4"
            style={{ width: screenWidth }}
          >
            <Image
              source={item.image}
              style={{ width: screenWidth * 0.8, height: 300 }}
              resizeMode="contain"
            />
            <View className="flex flex-row justify-center items-center mt-10 w-full">
              <Text className="mx-10 text-3xl font-bold text-center text-black">
                {item.title}
              </Text>
            </View>
            <Text className="text-lg font-JakartaSemiBold text-center text-[#858585] mx-10 mt-4">
              {item.description}
            </Text>
          </View>
        )}
      />
      <View className="px-4 my-10 w-full">
        <CustomButton
          title={isLastSlide ? t("common.done") : t("common.next")}
          onPress={() =>
            isLastSlide
              ? router.replace("/(auth)/sign-up")
              : swiperRef.current?.scrollToIndex({ index: activeIndex + 1 })
          }
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
