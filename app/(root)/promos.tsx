import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import PageHeader from "@/components/Common/PageHeader";
import PromoCard from "@/components/Promo/PromoCard";
import { fetchAPI } from "@/lib/fetch";
import { useLocalSearchParams } from "expo-router";

export default function PromoList() {
  const { t } = useTranslation();
  const { mode } = useLocalSearchParams();
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI("/(api)/promo/active", {
        method: "GET",
      });

      if (response.success) {
        setPromoCodes(response.data);
      }
    } catch (error) {
      console.error("Error loading promo codes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <PageHeader title={t("promo.availablePromoCodes")} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        <FlatList
          data={promoCodes}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="mb-4 px-4 rounded-xl overflow-hidden">
              <PromoCard
                promo={item}
                mode={(mode as "view" | "select") || "view"}
              />
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-10">
              <Text className="text-neutral-200 text-lg font-JakartaMedium">
                {t("promo.notFound")}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
