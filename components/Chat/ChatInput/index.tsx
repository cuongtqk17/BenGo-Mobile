import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform } from "react-native";
import { Composer, InputToolbar, Send } from "react-native-gifted-chat";
import { useTranslation } from "react-i18next";

export const renderInputToolbar = (props: any) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={{
        paddingHorizontal: 10,
        paddingVertical: Platform.OS === "ios" ? 8 : 5,
        paddingBottom: Platform.OS === "ios" ? 20 : 5,
        elevation: 0,
        shadowOpacity: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
        ...(Platform.OS === "ios" && {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }),
      }}
      primaryStyle={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        minHeight: Platform.OS === "ios" ? 44 : 40,
      }}
    />
  );
};

// Convert to a proper React component to use hooks
const CustomComposer = (props: any) => {
  const { t } = useTranslation();

  return (
    <Composer
      {...props}
      textInputStyle={{
        color: "#333333",
        fontFamily: Platform.OS === "ios" ? "System" : "Jakarta",
        fontSize: 16,
        lineHeight: Platform.OS === "ios" ? 20 : 20,
        marginHorizontal: 10,
        marginVertical: 5,
        paddingVertical: Platform.OS === "ios" ? 8 : 5,
        paddingHorizontal: Platform.OS === "ios" ? 12 : 10,
        backgroundColor: "transparent",
        borderWidth: 0,
        textAlignVertical: "center",
      }}
      placeholder={t("chat.placeholder")}
      placeholderTextColor="#999999"
      multiline={true}
      textInputProps={{
        autoCorrect: true,
        autoCapitalize: "sentences",
        returnKeyType: "default",
        blurOnSubmit: false,
        ...(Platform.OS === "ios" && {
          clearButtonMode: "while-editing",
        }),
      }}
    />
  );
};

export const renderComposer = (props: any) => <CustomComposer {...props} />;

export const renderSend = (props: any) => {
  return (
    <Send
      {...props}
      containerStyle={{
        backgroundColor: "#38A169",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
      }}
    >
      <Ionicons name="send" size={20} color="white" />
    </Send>
  );
};

const ChatInput = {
  renderInputToolbar,
  renderComposer,
  renderSend,
};

export default ChatInput;
