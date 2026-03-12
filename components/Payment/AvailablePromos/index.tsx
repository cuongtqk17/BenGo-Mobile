import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { fetchAPI } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import { PromoCode } from "@/types/type";
import { useTranslation } from "react-i18next";

interface AvailablePromosProps {
  userId: string;
  onSelectPromo: (code: string) => void;
}

const AvailablePromos = ({ userId, onSelectPromo }: AvailablePromosProps) => {
  const { t } = useTranslation();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailablePromos();
  }, [userId]);

  const fetchAvailablePromos = async () => {
    try {
      const response = await fetchAPI(
        `/(api)/promo/user-available?user_id=${userId}`,
        { method: "GET" }
      );

      if (response.success) {
        setPromos(response.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="mb-4 py-3">
        <ActivityIndicator size="small" color="#0286FF" />
      </View>
    );
  }

  if (promos.length === 0) {
    return null;
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-base font-JakartaSemiBold text-gray-800">
        {t("promo.available")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {promos.map((promo) => (
          <TouchableOpacity
            key={promo.id}
            className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 mr-3 w-64 shadow-md"
            style={{
              backgroundColor: "#0286FF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => onSelectPromo(promo.code)}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-neutral-200 font-JakartaBold text-xs">
                  {promo.discount_type === "percentage"
                    ? `${promo.discount_value}% OFF`
                    : promo.discount_type === "fixed_amount"
                      ? `${promo.discount_value.toLocaleString("vi-VN")} VNĐ`
                      : t("promo.free").toUpperCase()}
                </Text>
              </View>
              <Ionicons name="pricetag" size={20} color="white" />
            </View>

            {/* Code */}
            <Text className="text-neutral-200 font-JakartaBold text-lg mb-1">
              {promo.code}
            </Text>

            {/* Description */}
            <Text
              className="text-neutral-200/90 text-sm font-JakartaMedium mb-3"
              numberOfLines={2}
            >
              {promo.description}
            </Text>

            {/* Footer */}
            <View className="flex-row justify-between items-center border-t border-white/20 pt-2">
              <View>
                {promo.min_ride_amount > 0 && (
                  <Text className="text-neutral-200/80 text-xs font-JakartaMedium">
                    {t("promo.minOrderAmount")}:{" "}
                    {promo.min_ride_amount.toLocaleString("vi-VN")} VNĐ
                  </Text>
                )}
              </View>
              {promo.valid_until && (
                <Text className="text-neutral-200/80 text-xs font-JakartaMedium">
                  {t("promo.until")}: {formatDate(promo.valid_until)}
                </Text>
              )}
            </View>

            {/* Usage info */}
            {promo.max_uses_per_user > 1 && (
              <View className="mt-2 bg-white/10 rounded px-2 py-1">
                <Text className="text-neutral-200 text-xs font-JakartaMedium">
                  {t("promo.usage")}: {(promo as any).remaining_uses || 0}/
                  {promo.max_uses_per_user}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default AvailablePromos;
