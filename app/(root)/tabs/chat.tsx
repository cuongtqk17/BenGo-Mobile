import ChatHeader from "@/components/Chat/ChatHeader";
import ChatInterface from "@/components/Chat/ChatInterface";
import { icons } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import FlashMessage from "react-native-flash-message";
import { IMessage, User } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const AI_USER: User = {
  _id: "ai-assistant",
  name: "AI Assistant",
  avatar: icons.aichat,
};

const USER: User = {
  _id: "user",
  name: "user",
  avatar: icons.userchat,
};

export default function ChatScreen() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      addWelcomeMessage();
    }
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory();
    }
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem("chat_history");
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      }
    } catch (error) {}
  };

  const saveChatHistory = async () => {
    try {
      await AsyncStorage.setItem("chat_history", JSON.stringify(messages));
    } catch (error) {}
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: IMessage = {
      _id: "welcome",
      text: t("chat.welcomeMessage"),
      createdAt: new Date(),
      user: AI_USER,
    };
    setMessages([welcomeMessage]);
  };

  const handleBackPress = () => {
    Alert.alert(t("chat.notification"), t("chat.featureComingSoon"));
  };

  const handleClearHistory = async () => {
    await AsyncStorage.removeItem("chat_history");
    setMessages([]);
    addWelcomeMessage();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ChatHeader
        onBackPress={handleBackPress}
        onClearHistory={handleClearHistory}
      />
      <ChatInterface messages={messages} setMessages={setMessages} />
      <FlashMessage position="top" />
    </SafeAreaView>
  );
}
