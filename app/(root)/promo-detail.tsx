import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import PageHeader from "@/components/Common/PageHeader";
import PromoCard from "@/components/Promo/PromoCard";
import { fetchAPI } from "@/lib/fetch";
import CustomButton from "@/components/Common/CustomButton";

export default function PromoDetailScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams();
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromoDetail();
  }, [id]);

  const loadPromoDetail = async () => {
    try {
      const response = await fetchAPI("/(api)/promo/active", {
        method: "GET",
      });

      if (response.success) {
        const promoData = response.data.find(
          (p: any) => p.id === parseInt(id as string)
        );
        setPromo(promoData);
      }
    } catch (error) {
      console.error("Error loading promo:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (promo?.code) {
      await Clipboard.setStringAsync(promo.code);
      Alert.alert(t("common.success"), t("promo.codeCopied"));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 items-center justify-center">
        <Text className="text-gray-500 font-JakartaMedium">
          {t("common.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  if (!promo) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 items-center justify-center">
        <Text className="text-gray-500 font-JakartaMedium">
          {t("promo.notFound")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <PageHeader title={t("promo.promoDetail")} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Promo Card */}
        <View className="mx-4 mt-4">
          <PromoCard promo={promo} />
        </View>

        {/* Promo Details */}
        <View className="mx-4 mt-4 bg-white rounded-3xl shadow-sm shadow-neutral-300 p-4">
          <Text className="text-xl font-JakartaBold mb-4">
            {t("promo.details")}
          </Text>

          {[
            {
              icon: "gift-outline",
              label: t("promo.discountType"),
              value:
                promo.discount_type === "percentage"
                  ? t("promo.percentage")
                  : promo.discount_type === "fixed_amount"
                    ? t("promo.fixedAmount")
                    : t("promo.freeRide"),
            },
            promo.min_order_amount && {
              icon: "cash-outline",
              label: t("promo.minOrderAmount"),
              value: `${promo.min_order_amount.toLocaleString()}₫`,
            },
            promo.max_discount_amount && {
              icon: "trending-down-outline",
              label: t("promo.maxDiscount"),
              value: `${promo.max_discount_amount.toLocaleString()}₫`,
            },
            {
              icon: "calendar-outline",
              label: t("promo.validPeriod"),
              value: `${formatDate(promo.start_date)}${promo.end_date ? ` - ${formatDate(promo.end_date)}` : ""
                }`,
            },
            promo.usage_limit && {
              icon: "people-outline",
              label: t("promo.usage"),
              value: `${promo.used_count} / ${promo.usage_limit}`,
            },
          ]
            .filter(Boolean)
            .map((item: any, index, array) => (
              <View
                key={index}
                className={`flex-row items-center py-3 ${index < array.length - 1 ? "border-b border-gray-100" : ""
                  }`}
              >
                <View className="w-12 h-12 items-center justify-center bg-green-50 rounded-full">
                  <Ionicons name={item.icon} size={20} color="#10B981" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-sm text-gray-500 font-JakartaMedium">
                    {item.label}
                  </Text>
                  <Text className="text-base font-JakartaBold text-gray-900">
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
        </View>

        {/* Copy Button */}
        <View className="mx-4 mt-4">
          <CustomButton
            title={t("promo.copyCode")}
            onPress={copyToClipboard}
            IconRight={() => (
              <Ionicons
                name="copy-outline"
                size={20}
                color="white"
                style={{ marginLeft: 8 }}
              />
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
