import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DriverHome = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-JakartaBold">Trang chủ (Driver)</Text>
        <Text className="text-gray-500 mt-2">Dành cho tài xế</Text>
      </View>
    </SafeAreaView>
  );
};

export default DriverHome;
