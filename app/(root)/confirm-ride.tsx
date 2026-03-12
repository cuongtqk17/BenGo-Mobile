import CustomButton from "@/components/Common/CustomButton";
import DriverCard from "@/components/Common/DriverCard";
import PageHeader from "@/components/Common/PageHeader";
import RideLayout from "@/components/Ride/RideLayout";
import { useDriverStore } from "@/store";
import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";

const ITEMS_PER_PAGE = 5;

const ConfirmRide = () => {
  const { t } = useTranslation();
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();

  const approvedDrivers = useMemo(() => {
    return (drivers || []).filter(
      (driver) => driver.approval_status === "approved"
    );
  }, [drivers]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((approvedDrivers?.length || 0) / ITEMS_PER_PAGE);

  const currentDrivers = approvedDrivers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const snapPoints = useMemo(() => ["85%"], []);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500" edges={["top"]}>
      <PageHeader title={t("booking.selectDriver")} />
      <RideLayout snapPoints={snapPoints} scrollable={false}>
        <BottomSheetFlatList
          data={currentDrivers}
          keyExtractor={(item: any, index: number) =>
            item.id?.toString() || index.toString()
          }
          renderItem={({ item }: { item: any }) => (
            <DriverCard
              item={item}
              selected={selectedDriver!}
              setSelected={() => setSelectedDriver(item.id!)}
            />
          )}
          ListFooterComponent={() => (
            <View className="mx-4 mt-4 mb-20">
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <View className="flex-row justify-between items-center mb-4 px-2">
                  <TouchableOpacity
                    onPress={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 h-9 w-9 rounded-full ${currentPage === 1 ? "opacity-30" : "bg-neutral-100"}`}
                  >
                    <Ionicons name="chevron-back" size={18} color="black" />
                  </TouchableOpacity>

                  <Text className="font-JakartaMedium text-neutral-600">
                    {t("common.page")} {currentPage} / {totalPages}
                  </Text>

                  <TouchableOpacity
                    onPress={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 h-9 w-9 rounded-full ${currentPage === totalPages ? "opacity-30" : "bg-neutral-100"}`}
                  >
                    <Ionicons name="chevron-forward" size={18} color="black" />
                  </TouchableOpacity>
                </View>
              )}

              <CustomButton
                title={t("booking.bookRide")}
                onPress={() => router.push("/(root)/book-ride")}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </RideLayout>
    </SafeAreaView>
  );
};

export default ConfirmRide;
