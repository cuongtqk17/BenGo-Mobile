import React from 'react';
import { View, Text, Image } from 'react-native';
import { Switch } from 'react-native-switch';
import { icons } from '@/constants';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  isOnline: boolean;
  onToggleStatus: () => void;
  userName?: string;
  avatarUrl?: string;
  disabled?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  isOnline,
  onToggleStatus,
  userName,
  avatarUrl,
  disabled = false,
}) => {
  return (
    <View
      className="flex-row items-center justify-between px-4 py-3 bg-white"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 items-center justify-center bg-green-50 rounded-full overflow-hidden">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-full h-full" />
          ) : (
            <Ionicons name="person" size={24} color="#10B981" />
          )}
        </View>
        <View className="ml-3">
          <Text className="text-gray-700 text-base font-JakartaBold leading-tight">{userName || 'Tài xế'}</Text>
          <Text className={`text-sm font-JakartaMedium ${isOnline ? 'text-green-500' : 'text-gray-500'}`}>
            {isOnline ? '● Đang trực tuyến' : '○ Ngoại tuyến'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        <Switch
          value={isOnline}
          onValueChange={onToggleStatus}
          disabled={disabled}
          activeText={""}
          inActiveText={""}
          circleSize={20}
          barHeight={24}
          circleBorderWidth={0}
          backgroundActive={"#16A34A"}
          backgroundInactive={"#E5E5E5"}
          circleActiveColor={"#ffffff"}
          circleInActiveColor={"#f4f3f4"}
          changeValueImmediately={true}
          renderActiveText={false}
          renderInActiveText={false}
          switchLeftPx={2}
          switchRightPx={2}
          switchWidthMultiplier={2.2}
          switchBorderRadius={12}
        />
      </View>
    </View>
  );
};

export default Header;
