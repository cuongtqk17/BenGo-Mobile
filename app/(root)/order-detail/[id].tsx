import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Linking, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { useOrderDetails, useCancelOrder } from "@/hooks/useOrders";
import VehicleBadge from "@/components/Common/VehicleBadge";
import { formatCurrency } from "@/lib/utils"; // Assuming a helper exists or I'll use toLocaleString

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    PENDING: { label: "Chờ xác nhận", color: "#D97706", bgColor: "#FEF3C7", icon: "time-outline" },
    ACCEPTED: { label: "Đã nhận đơn", color: "#2563EB", bgColor: "#DBEAFE", icon: "checkmark-circle-outline" },
    PICKED_UP: { label: "Đang giao hàng", color: "#4F46E5", bgColor: "#E0E7FF", icon: "car-outline" },
    DELIVERED: { label: "Đã hoàn thành", color: "#16A34A", bgColor: "#DCFCE7", icon: "checkbox-outline" },
    CANCELLED: { label: "Đã hủy", color: "#DC2626", bgColor: "#FEE2E2", icon: "close-circle-outline" },
};

const CustomerOrderDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: order, isLoading } = useOrderDetails(id);
    const { mutateAsync: cancelOrder, isPending: isCancelling } = useCancelOrder();

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    if (!order) {
        return (
            <View className="flex-1 justify-center items-center bg-white p-6">
                <Text className="text-lg font-JakartaBold text-neutral-800">Không tìm thấy đơn hàng</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-green-600 px-6 py-3 rounded-full">
                    <Text className="text-white font-JakartaBold">Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentStatus = statusConfig[order.status] || statusConfig.PENDING;

    const handleCancel = () => {
        Alert.alert(
            "Xác nhận hủy đơn",
            "Bạn có chắc chắn muốn hủy đơn hàng này không?",
            [
                { text: "Bỏ qua", style: "cancel" },
                { 
                    text: "Đồng ý", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await cancelOrder({ orderId: id, reason: "Người dùng yêu cầu hủy" });
                            Alert.alert("Thành công", "Đơn hàng của bạn đã được hủy.");
                            router.back();
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể hủy đơn hàng lúc này.");
                        }
                    }
                }
            ]
        );
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleChat = (driverId: string) => {
        // router.push(`/(root)/chat/${driverId}`);
        Alert.alert("Thông báo", "Tính năng Chat đang được phát triển.");
    };

    const handleReorder = () => {
        // Logic copy data to booking setup
        router.push("/(root)/booking-setup");
    };

    const handleRate = () => {
        router.push(`/(root)/payment/${id}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* CD1: Header */}
            <View className="flex-row items-center px-6 py-4 border-b border-neutral-50">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-lg font-JakartaBold text-neutral-800">Chi tiết đơn hàng</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* CD2: Status Banner */}
                <View className="px-6 py-4" style={{ backgroundColor: currentStatus.bgColor }}>
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Ionicons name={currentStatus.icon} size={24} color={currentStatus.color} />
                            <Text className="ml-2 text-base font-JakartaBold" style={{ color: currentStatus.color }}>
                                {currentStatus.label}
                            </Text>
                        </View>
                        <Text className="text-sm font-JakartaMedium text-neutral-500">
                            #{id.slice(-8).toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* CD3: Route Map Summary */}
                <View className="h-48 w-full">
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        className="w-full h-full"
                        initialRegion={{
                            latitude: (order.pickup.lat + order.dropoff.lat) / 2,
                            longitude: (order.pickup.lng + order.dropoff.lng) / 2,
                            latitudeDelta: Math.abs(order.pickup.lat - order.dropoff.lat) * 1.5,
                            longitudeDelta: Math.abs(order.pickup.lng - order.dropoff.lng) * 1.5,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    >
                        <Marker coordinate={{ latitude: order.pickup.lat, longitude: order.pickup.lng }}>
                            <Ionicons name="radio-button-on" size={24} color="#3B82F6" />
                        </Marker>
                        <Marker coordinate={{ latitude: order.dropoff.lat, longitude: order.dropoff.lng }}>
                            <Ionicons name="location" size={24} color="#EF4444" />
                        </Marker>
                        <Polyline
                            coordinates={[
                                { latitude: order.pickup.lat, longitude: order.pickup.lng },
                                { latitude: order.dropoff.lat, longitude: order.dropoff.lng }
                            ]}
                            strokeColor="#16A34A"
                            strokeWidth={3}
                        />
                    </MapView>
                </View>

                {/* CD4: Address Info Card */}
                <View className="mx-6 mt-6 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="radio-button-on" size={20} color="#3B82F6" />
                        <View className="ml-3 flex-1">
                            <Text className="text-sm text-neutral-400 font-JakartaMedium">Điểm lấy hàng</Text>
                            <Text className="text-sm font-JakartaSemiBold text-neutral-800">{order.pickup.address}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name="location" size={20} color="#EF4444" />
                        <View className="ml-3 flex-1">
                            <Text className="text-sm text-neutral-400 font-JakartaMedium">Điểm giao hàng</Text>
                            <Text className="text-sm font-JakartaSemiBold text-neutral-800">{order.dropoff.address}</Text>
                        </View>
                    </View>
                </View>

                {/* CD5: Goods Section */}
                <View className="mx-6 mt-6">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="cube-outline" size={20} color="#16A34A" />
                        <Text className="ml-2 text-base font-JakartaBold text-neutral-800">Thông tin hàng hóa</Text>
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {order.goodsImages?.map((img, index) => (
                            <Image 
                                key={index} 
                                source={{ uri: img }} 
                                className="w-24 h-24 rounded-xl mr-3 bg-neutral-100" 
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    <View className="p-4 bg-neutral-50 rounded-xl">
                        <Text className="text-sm text-neutral-500 font-JakartaBold mb-1">Ghi chú:</Text>
                        <Text className="text-sm text-neutral-700 font-JakartaMedium">
                            {order.specialNote || "Không có ghi chú"}
                        </Text>
                        <View className="mt-3">
                            <VehicleBadge type={order.vehicleType} />
                        </View>
                    </View>
                </View>

                {/* CD6: Driver Info Card */}
                {(order.driver || order.driverId) && (
                    <View className="mx-6 mt-6 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                        <Text className="text-base font-JakartaBold text-neutral-800 mb-4">Tài xế nhận đơn</Text>
                        <View className="flex-row items-center">
                            <Image 
                                source={{ uri: order.driver?.avatar || order.driverId?.avatar || "https://avatar.iran.liara.run/public/boy" }} 
                                className="w-14 h-14 rounded-full bg-neutral-100" 
                            />
                            <View className="ml-4 flex-1">
                                <Text className="text-base font-JakartaBold text-neutral-800">
                                    {order.driver?.name || order.driverId?.name}
                                </Text>
                                <Text className="text-sm font-JakartaMedium text-neutral-500">
                                    {order.driver?.licensePlate || order.driverId?.licensePlate}
                                </Text>
                            </View>
                            <View className="flex-row">
                                <TouchableOpacity 
                                    onPress={() => handleChat((order.driver?._id || order.driverId?._id)!)}
                                    className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-2"
                                >
                                    <Ionicons name="chatbubble-ellipses" size={20} color="#16A34A" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => handleCall((order.driver?.phone || order.driverId?.phone)!)}
                                    className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="call" size={20} color="#2563EB" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* CD7: Payment Summary */}
                <View className="mx-6 mt-6 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="receipt-outline" size={20} color="#16A34A" />
                        <Text className="ml-2 text-base font-JakartaBold text-neutral-800">Chi tiết thanh toán</Text>
                    </View>
                    
                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-sm font-JakartaMedium text-neutral-500">Giá cước ({order.distanceKm}km)</Text>
                            <Text className="text-sm font-JakartaSemiBold text-neutral-800">{order.totalPrice.toLocaleString("vi-VN")}đ</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-sm font-JakartaMedium text-neutral-500">Giảm giá</Text>
                            <Text className="text-sm font-JakartaSemiBold text-green-600">-0đ</Text>
                        </View>
                        <View className="h-[1px] bg-neutral-50 my-2" />
                        <View className="flex-row justify-between items-center">
                            <Text className="text-base font-JakartaBold text-neutral-800">Tổng cộng</Text>
                            <Text className="text-xl font-JakartaExtraBold text-green-600">
                                {order.totalPrice.toLocaleString("vi-VN")}đ
                            </Text>
                        </View>
                        <View className="mt-2 flex-row items-center">
                            <Ionicons 
                                name={order.paymentMethod === "CASH" ? "cash-outline" : "wallet-outline"} 
                                size={16} 
                                color="#6B7280" 
                            />
                            <Text className="ml-2 text-sm font-JakartaMedium text-neutral-500">
                                Thanh toán bằng {order.paymentMethod === "CASH" ? "Tiền mặt" : "Ví BenGo"}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* CD8: Action Button Group */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-neutral-50 flex-row gap-3">
                {(order.status === "PENDING" || order.status === "ACCEPTED") && (
                    <TouchableOpacity 
                        onPress={handleCancel}
                        disabled={isCancelling}
                        className="flex-1 py-4 rounded-2xl border border-red-500 items-center justify-center"
                    >
                        {isCancelling ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <Text className="text-red-500 font-JakartaBold text-sm">Hủy đơn</Text>
                        )}
                    </TouchableOpacity>
                )}

                {order.status === "DELIVERED" && (
                    <TouchableOpacity 
                        onPress={handleRate}
                        className="flex-1 py-4 rounded-2xl bg-amber-500 items-center justify-center"
                    >
                        <Text className="text-white font-JakartaBold text-sm">Đánh giá tài xế</Text>
                    </TouchableOpacity>
                )}

                {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
                    <TouchableOpacity 
                        onPress={handleReorder}
                        className="flex-1 py-4 rounded-2xl bg-green-600 items-center justify-center"
                    >
                        <Text className="text-white font-JakartaBold text-sm">Đặt lại chuyến</Text>
                    </TouchableOpacity>
                )}
                
                {order.status === "PICKED_UP" && (
                    <TouchableOpacity 
                        onPress={() => router.push(`/(root)/track-order/${id}`)}
                        className="flex-1 py-4 rounded-2xl bg-blue-600 items-center justify-center"
                    >
                        <Text className="text-white font-JakartaBold text-sm">Theo dõi lộ trình</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

export default CustomerOrderDetailScreen;
