import {
  cleanTextForSpeech,
  generateAIResponse,
} from "@/components/Chat/AIAssistant";
import ChatBubble from "@/components/Chat/ChatBubble";
import ChatInput from "@/components/Chat/ChatInput";
import QuickReplies from "@/components/Chat/QuickReplies";
import { icons } from "@/constants";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  Text,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { useTranslation } from "react-i18next";

const AI_USER: User = {
  _id: "ai-assistant",
  name: "AI Assistant",
  avatar: icons.aichat,
};

const getUserObject = (t: any): User => ({
  _id: "user",
  name: t("chat.you"),
  avatar: icons.userchat,
});

interface ChatInterfaceProps {
  messages: IMessage[];
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
}

export default function ChatInterface({
  messages,
  setMessages,
}: ChatInterfaceProps) {
  const { t } = useTranslation();
  const USER = getUserObject(t);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [toggledMessages, setToggledMessages] = useState<Set<string>>(
    new Set()
  );
  const [volumeToggledMessages, setVolumeToggledMessages] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    return () => {
      if (speakingMessageId) {
        Speech.stop();
      }
    };
  }, [speakingMessageId]);
  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const userMessage = newMessages[0];
      if (Platform.OS === "ios") {
        Keyboard.dismiss();
      } else {
        Keyboard.dismiss();
      }

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );

      setIsLoading(true);
      setIsTyping(true);

      showMessage({
        message: t("chat.aiResponding"),
        type: "info",
        duration: 2000,
      });

      try {
        const aiResponse = await generateAIResponse(userMessage.text);

        const aiMessage: IMessage = {
          _id: Math.random().toString(36).substr(2, 9),
          text: aiResponse,
          createdAt: new Date(),
          user: AI_USER,
        };

        setTimeout(() => {
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [aiMessage])
          );
          setIsLoading(false);
          setIsTyping(false);

          showMessage({
            message: t("chat.messageSent"),
            type: "success",
            duration: 1500,
          });
        }, 1000);
      } catch (error) {
        setIsLoading(false);
        setIsTyping(false);

        showMessage({
          message: t("chat.errorOccurred"),
          type: "danger",
          duration: 3000,
        });
      }
    },
    [setMessages, setIsLoading, setIsTyping]
  );

  const onQuickReply = useCallback(
    (quickReply: any) => {
      const message: IMessage = {
        _id: Math.random().toString(36).substr(2, 9),
        text: quickReply.value,
        createdAt: new Date(),
        user: USER,
      };
      onSend([message]);
    },
    [onSend]
  );

  const speakMessage = (text: string, messageId: string) => {
    if (speakingMessageId === messageId) {
      Speech.stop();
      setSpeakingMessageId(null);
    } else {
      if (speakingMessageId) {
        Speech.stop();
      }

      setSpeakingMessageId(messageId);

      const cleanText = cleanTextForSpeech(text);

      Speech.speak(cleanText, {
        language: "vi-VN",
        pitch: 1.0,
        rate: 0.8,
      });
    }
  };

  const toggleVolumeMessage = useCallback(
    (messageId: string) => {
      setVolumeToggledMessages((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(messageId)) {
          newSet.delete(messageId);
        } else {
          newSet.add(messageId);
        }
        return newSet;
      });
    },
    [setVolumeToggledMessages]
  );

  const handleStopSpeech = () => {
    Speech.stop();
    setSpeakingMessageId(null);
  };

  const renderBubble = useCallback(
    (props: any) => {
      return (
        <ChatBubble
          props={props}
          speakingMessageId={speakingMessageId}
          toggledMessages={toggledMessages}
          volumeToggledMessages={volumeToggledMessages}
          onSpeakMessage={speakMessage}
          onToggleVolumeMessage={toggleVolumeMessage}
          onStopSpeech={handleStopSpeech}
        />
      );
    },
    [
      speakingMessageId,
      toggledMessages,
      volumeToggledMessages,
      speakMessage,
      toggleVolumeMessage,
    ]
  );

  const renderInputToolbar = (props: any) => {
    return ChatInput.renderInputToolbar(props);
  };

  const renderComposer = (props: any) => {
    return ChatInput.renderComposer(props);
  };

  const renderSend = (props: any) => {
    return ChatInput.renderSend(props);
  };

  const renderQuickReplies = (props: any) => {
    return (
      <QuickReplies
        currentMessage={props.currentMessage}
        onQuickReply={onQuickReply}
      />
    );
  };

  const renderAvatar = (props: any) => {
    return (
      <View style={{ marginBottom: 6 }}>
        <Image
          source={props.currentMessage?.user.avatar}
          style={{
            width: 40,
            height: 40,
            borderRadius: 25,
          }}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (isTyping) {
      return (
        <View style={{ padding: 10, alignItems: "center" }}>
          <ActivityIndicator size="small" color="#38A169" />
          <Text
            style={{
              color: "#666666",
              fontFamily: "Jakarta",
              fontSize: 12,
              marginTop: 5,
            }}
          >
            {t("chat.assistantTyping")}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginTop: -20,
        paddingBottom: 80,
        overflow: "hidden",
      }}
    >
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={USER}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        renderSend={renderSend}
        renderQuickReplies={renderQuickReplies}
        renderFooter={renderFooter}
        renderAvatar={renderAvatar}
        placeholder={t("chat.placeholder")}
        alwaysShowSend
        showUserAvatar
        showAvatarForEveryMessage
        key={`chat-${toggledMessages.size}-${volumeToggledMessages.size}`}
        {...(Platform.OS === "ios" && {
          keyboardShouldPersistTaps: "handled",
          keyboardDismissMode: "interactive",
          scrollToBottom: true,
          scrollToBottomComponent: () => null,
        })}
      />
    </View>
  );
}
