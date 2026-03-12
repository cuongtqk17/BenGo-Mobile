import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { usePromoStore } from "@/store";

interface PromoCardProps {
  promo: {
    id: number;
    code: string;
    description: string;
    discount_type: string;
    discount_value: number;
    max_discount_amount?: number;
    min_order_amount?: number;
    end_date?: string;
  };
  mode?: "view" | "select"; // 'view' for detail, 'select' for applying
}

export default function PromoCard({ promo, mode = "view" }: PromoCardProps) {
  const { t, i18n } = useTranslation();
  const { setSelectedPromo } = usePromoStore();

  const getGradientColors = (index: number): readonly [string, string] => {
    const gradients: readonly [string, string][] = [
      ["#396f04", "#059669"], // Green1
      ["#7dbd07", "#396f04"], // Green2
      ["#0a2004", "#589507"], // Green3
    ];
    return gradients[index % gradients.length];
  };

  const formatDiscount = () => {
    if (promo.discount_type === "percentage") {
      return `-${promo.discount_value}%`;
    } else if (promo.discount_type === "fixed_amount") {
      return `-${promo.discount_value.toLocaleString()}₫`;
    } else {
      return t("promo.freeRide");
    }
  };

  const formatEndDate = () => {
    if (!promo.end_date) return "";
    const date = new Date(promo.end_date);
    return date.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US");
  };

  const handlePress = () => {
    if (mode === "select") {
      // Save to store and go back
      setSelectedPromo({
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        max_discount_amount: promo.max_discount_amount,
        min_order_amount: promo.min_order_amount,
      });
      router.back();
    } else {
      // Navigate to detail
      router.push(`/(root)/promo-detail?id=${promo.id}`);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      className="w-full px-1"
    >
      <LinearGradient
        colors={
          getGradientColors(promo.id) as readonly [string, string, ...string[]]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-full min-h-[140px] h-fit rounded-xl shadow-lg shadow-black/20"
        style={{ borderRadius: 16, padding: 16 }}
      >
        {/* Icon & Discount */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center shrink-0">
              <Ionicons name="pricetag" size={20} color="white" />
            </View>
            <Text
              className="ml-3 text-3xl font-JakartaBold text-neutral-200 flex-1"
              numberOfLines={1}
            >
              {formatDiscount()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </View>

        {/* Code */}
        <View className="bg-white/20 px-3 py-1.5 rounded-full self-start mb-2">
          <Text className="text-neutral-200 font-JakartaBold text-sm tracking-wider">
            {promo.code}
          </Text>
        </View>

        {/* Description */}
        <Text
          className="text-neutral-200/90 font-JakartaMedium text-base"
          numberOfLines={1}
        >
          {promo.description}
        </Text>

        {/* Footer */}
        {promo.end_date && (
          <View className="flex-row items-center justify-end mt-2">
            <Ionicons name="time-outline" size={12} color="white" />
            <Text className="ml-1 text-neutral-200/80 font-Jakarta text-sm">
              {t("promo.until")} {formatEndDate()}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
