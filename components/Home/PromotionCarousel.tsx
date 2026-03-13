import React from "react";
import { View, Image, Dimensions, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useTranslation } from "react-i18next";

interface PromotionCarouselProps {
  data: any[];
  onPress: (item: any) => void;
}

const PromotionCarousel = ({ data, onPress }: PromotionCarouselProps) => {
  const width = Dimensions.get("window").width;
  
  // fallback data if empty
  const displayData = data && data.length > 0 ? data : [
    { id: '1', image: 'https://img.freepik.com/free-vector/delivery-service-with-mask-concept_23-2148505116.jpg' },
    { id: '2', image: 'https://img.freepik.com/free-vector/flat-design-food-delivery-concept_23-2148465495.jpg' },
  ];

  return (
    <View className="absolute bottom-10 left-0 right-0 z-50 items-center">
      <Carousel
        loop
        width={width * 0.9}
        height={width * 0.45} // 2:1 ratio
        autoPlay={true}
        autoPlayInterval={3000}
        data={displayData}
        scrollAnimationDuration={1000}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => onPress(item)}
            className="flex-1 justify-center items-center px-2"
          >
            <Image
              source={{ uri: item.image || item.banner_url || 'https://via.placeholder.com/600x300' }}
              style={{ width: '100%', height: '100%', borderRadius: 10 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default PromotionCarousel;
