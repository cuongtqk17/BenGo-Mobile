import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

interface ChatHeaderProps {
  onBackPress: () => void;
  onClearHistory: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onBackPress,
  onClearHistory,
}) => {
  const { t } = useTranslation();

  const handleClearHistory = () => {
    Alert.alert(t("chat.clearHistory"), t("chat.confirmClear"), [
      {
        text: t("common.cancel") || "Hủy",
        style: "cancel",
      },
      {
        text: t("common.confirm") || "Xác nhận",
        onPress: onClearHistory,
        style: "destructive",
      },
    ]);
  };

  return (
    <LinearGradient
      colors={["#38A169", "#2F855A", "#38A169"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      locations={[0, 0.5, 1]}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 16,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#38A169",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minHeight: 120,
      }}
    >
      <View
        style={{
          flex: 1,
          height: 40,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "JakartaBold",
            color: "white",
            fontWeight: "600",
          }}
        >
          {t("chat.title")}
        </Text>
      </View>
    </LinearGradient>
  );
};

export default ChatHeader;
