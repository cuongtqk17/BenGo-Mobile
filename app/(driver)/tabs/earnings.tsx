import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useDriverStats, useDriverOrders } from '@/hooks/useDriver';

const SCREEN_WIDTH = Dimensions.get('window').width;

const TIME_FILTERS = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Tuần này', value: 'week' },
  { label: 'Tháng này', value: 'month' },
];

// Mock data for the chart - in a real app, this would come from an API
const MOCK_CHART_DATA = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [
    {
      data: [450, 320, 580, 410, 690, 850, 720],
    },
  ],
};

const EarningsScreen = () => {
  const [activeFilter, setActiveFilter] = useState('week');

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    const to = new Date().toISOString().split('T')[0];
    let fromDate = new Date();
    if (activeFilter === 'today') {
      fromDate = new Date();
    } else if (activeFilter === 'week') {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (activeFilter === 'month') {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }
    const from = fromDate.toISOString().split('T')[0];
    return { from, to };
  }, [activeFilter]);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDriverStats(dateRange.from, dateRange.to);
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useDriverOrders({
    limit: 10,
    status: 'DELIVERED',
    time: activeFilter
  });

  const transactions = ordersData?.data?.data || [];

  const onRefresh = () => {
    refetchStats();
    refetchOrders();
  };

  const formatCurrency = (amount: number = 0) => {
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  const renderTransactionItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center py-4 border-b border-gray-100">
      <View className="bg-green-50 w-12 h-12 rounded-2xl items-center justify-center mr-3">
        <Ionicons name="add-circle" size={24} color="#10B981" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-JakartaBold text-base">Thu nhập đơn #{item.id.slice(-6).toUpperCase()}</Text>
        <Text className="text-gray-500 font-Jakarta text-sm">
          {format(new Date(item.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}
        </Text>
      </View>
      <Text className="text-green-600 font-JakartaBold text-base">
        +{formatCurrency(item.totalPrice * 0.85)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={statsLoading || ordersLoading} onRefresh={onRefresh} colors={['#10B981']} />
        }
      >
        <View className="px-4 py-4">
          <Text className="text-2xl font-JakartaBold text-gray-900 mb-6">Thu nhập</Text>

          {/* W1: Wallet Balance Header */}
          <LinearGradient
            colors={["#059669", "#10B981"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-6 mb-6 shadow-lg overflow-hidden"
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-white/80 font-JakartaMedium text-sm mb-1">Số dư ví BenGo</Text>
                <Text className="text-white font-JakartaBold text-3xl">
                  {formatCurrency(stats?.totalEarnings || 0)}
                </Text>
              </View>
              <View className="bg-white/20 p-3 rounded-2xl">
                <Ionicons name="wallet-outline" size={28} color="white" />
              </View>
            </View>

            <View className="mt-6 flex-row items-center">
              <View className="flex-1">
                <Text className="text-white/80 font-JakartaMedium text-sm uppercase">Tổng chuyến đi</Text>
                <Text className="text-white font-JakartaBold text-lg">{stats?.totalTrips || 0}</Text>
              </View>
              <View className="w-[1px] h-8 bg-white/20 mx-4" />
              <View className="flex-1">
                <Text className="text-white/80 font-JakartaMedium text-sm uppercase">Đánh giá trung bình</Text>
                <View className="flex-row items-center">
                  <Text className="text-white font-JakartaBold text-lg mr-1">{stats?.rating || 5.0}</Text>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* W3: Quick Time Filter */}
          <View className="flex-row mb-4">
            {TIME_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                onPress={() => setActiveFilter(f.value)}
                className={`mr-2 px-6 py-2 rounded-full border ${activeFilter === f.value ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 shadow-sm'}`}
              >
                <Text className={`font-JakartaBold text-sm ${activeFilter === f.value ? 'text-green-600' : 'text-gray-500'}`}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* W2: Weekly Revenue Chart */}
          <View className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-JakartaBold text-lg">
                Thống kê doanh thu
              </Text>
              <Text className="text-gray-500 font-Jakarta text-sm">
                (nghìn VND)
              </Text>
            </View>

            <View className="relative">
              {/* Manual Solid Axes */}
              {/* Oy Axis */}
              <View
                className="absolute bg-emerald-600 z-10"
                style={{
                  left: 0,
                  top: 10,
                  bottom: 38,
                  width: 2,
                }}
              />
              {/* Ox Axis */}
              <View
                className="absolute bg-emerald-600 z-10"
                style={{
                  left: 0,
                  right: 0,
                  bottom: 38,
                  height: 2,
                }}
              />

              <BarChart
                data={MOCK_CHART_DATA}
                width={SCREEN_WIDTH - 64}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                  barPercentage: 0.6,
                  propsForBackgroundLines: {
                    stroke: "#E5E7EB",
                    strokeWidth: 1,
                    strokeDasharray: "4", // Dashed grid lines
                  },
                }}
                verticalLabelRotation={0}
                showValuesOnTopOfBars
                fromZero={true}
                withInnerLines={true}
                segments={4}
                flatColor={true}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  paddingRight: 0,
                }}
              />
            </View>
          </View>

          {/* W4: Transaction History List */}
          <View className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm h-fit">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-900 font-JakartaBold text-lg">Lịch sử giao dịch</Text>
              <TouchableOpacity>
                <Text className="text-green-600 font-JakartaBold text-base">Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {ordersLoading ? (
              <ActivityIndicator size="large" color="#10B981" className="mt-10" />
            ) : transactions.length > 0 ? (
              <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={renderTransactionItem}
                scrollEnabled={false}
                ListFooterComponent={<View className="h-4" />}
                contentContainerStyle={{ flexGrow: 1 }}
              />
            ) : (
              <View className="items-center justify-center py-20">
                <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
                <Text className="text-gray-500 font-JakartaMedium text-sm mt-4">Không có giao dịch nào trong khoảng thời gian này</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EarningsScreen;
