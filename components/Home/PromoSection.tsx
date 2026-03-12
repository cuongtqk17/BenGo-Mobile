import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import PromoCard from "@/components/Promo/PromoCard";
import { fetchAPI } from "@/lib/fetch";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40; // Width of the card container

export default function PromoSection() {
  const { t } = useTranslation();
  const [promoCodes, setPromoCodes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      const response = await fetchAPI("/(api)/promo/active", {
        method: "GET",
      });

      if (response.success) {
        setPromoCodes(response.data);
      }
    } catch (error) {
      console.error("Error loading promo codes:", error);
    }
  };

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < promoCodes.length) {
      setCurrentIndex(index);

      try {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
        });
      } catch (error) {
        console.error("[PromoSection] scrollToIndex Error:", error);
      }
    } else {
      console.warn(
        `[PromoSection] scrollToIndex: Invalid index ${index}. Total items: ${promoCodes.length}`
      );
    }
  };

  const handleNext = () => {
    if (promoCodes.length === 0) return;
    const nextIndex = (currentIndex + 1) % promoCodes.length;
    scrollToIndex(nextIndex);
  };

  const handlePrev = () => {
    if (promoCodes.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = promoCodes.length - 1;
    scrollToIndex(prevIndex);
  };

  // Called when manual scroll manually updates
  const onMomentumScrollEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
    setCurrentIndex(newIndex);
  };

  if (promoCodes.length === 0) {
    return null;
  }

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-3 pr-2">
        <Text className="text-lg font-JakartaBold text-neutral-200">
          {t("promo.availablePromoCodes")}
        </Text>

        {/* Navigation Buttons (Top Right) */}
        {promoCodes.length > 1 && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handlePrev}
              className="w-8 h-8 rounded-full bg-white/20 items-center justify-center active:bg-white/30"
            >
              <Ionicons name="chevron-back" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              className="w-8 h-8 rounded-full bg-white/20 items-center justify-center active:bg-white/30"
            >
              <Ionicons name="chevron-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="h-[160px]">
        <FlatList
          ref={flatListRef}
          data={promoCodes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
              <PromoCard promo={item} />
            </View>
          )}
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={(data, index) => ({
            length: CARD_WIDTH,
            offset: CARD_WIDTH * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            console.warn("[PromoSection] Scroll to index failed:", info);
            // Fallback: wait a bit and retry
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            });
          }}
        />

        {/* Pagination Dots */}
        <View className="absolute bottom-0 w-full flex-row justify-center pb-2 pointer-events-none">
          {promoCodes.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${index === currentIndex ? "bg-white w-4" : "bg-white/30"
                }`}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
