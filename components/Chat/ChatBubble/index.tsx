import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextProps, TouchableOpacity, View } from "react-native";
import { Bubble } from "react-native-gifted-chat";

const FormattedText = ({ text, style, ...props }: { text: string } & TextProps) => {
  const renderFormattedText = (inputText: string) => {
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(inputText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <Text key={`text-${lastIndex}`} style={style}>
            {inputText.slice(lastIndex, match.index)}
          </Text>
        );
      }

      parts.push(
        <Text key={`bold-${match.index}`} style={[style, { fontWeight: 'bold' }]}>
          {match[1]}
        </Text>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < inputText.length) {
      parts.push(
        <Text key={`text-${lastIndex}`} style={style}>
          {inputText.slice(lastIndex)}
        </Text>
      );
    }

    return parts.length > 0 ? parts : <Text style={style}>{inputText}</Text>;
  };

  return <Text {...props}>{renderFormattedText(text)}</Text>;
};

interface ChatBubbleProps {
  props: any;
  speakingMessageId: string | null;
  toggledMessages: Set<string>;
  volumeToggledMessages: Set<string>;
  onSpeakMessage: (text: string, messageId: string) => void;
  onToggleVolumeMessage: (messageId: string) => void;
  onStopSpeech: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  props,
  speakingMessageId,
  toggledMessages,
  volumeToggledMessages,
  onSpeakMessage,
  onToggleVolumeMessage,
  onStopSpeech,
}) => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: '#38A169', // Primary green
          borderRadius: 20,
          marginRight: 0,
          marginLeft: 60,
          marginVertical: 5,
          paddingHorizontal: 12,
          paddingVertical: 12,
        },
        left: {
          backgroundColor: '#F1F1F1', // Light gray
          borderRadius: 20,
          marginLeft: 0,
          marginRight: 60,
          marginVertical: 5,
          paddingVertical: 12,
          paddingHorizontal: 12,
        },
      }}
      textStyle={{
        right: {
          color: 'white',
          fontFamily: 'Jakarta',
          fontSize: 16,
          lineHeight: 24,
          paddingHorizontal: 0,
          marginHorizontal: 0,
        },
        left: {
          color: '#333333',
          fontFamily: 'Jakarta',
          fontSize: 16,
          lineHeight: 24,
          marginHorizontal: 0,
          paddingHorizontal: 0,
        },
      }}
      renderMessageText={(props) => {
        const { currentMessage } = props;
        const textStyle = currentMessage?.user._id === 'user'
          ? {
              color: 'white',
              fontFamily: 'Jakarta',
              fontSize: 16,
              lineHeight: 24,
            }
          : {
              color: '#333333',
              fontFamily: 'Jakarta',
              fontSize: 16,
              lineHeight: 24,
            };

        return (
          <FormattedText
            text={currentMessage?.text || ''}
            style={textStyle}
          />
        );
      }}
      renderTicks={() => null}
      renderTime={() => null}
      renderCustomView={(props) => {
        if (props.currentMessage?.user._id === 'ai-assistant') {
          const messageId = String(props.currentMessage?._id || '');
          const isThisMessageSpeaking = speakingMessageId === messageId;
          const isToggled = toggledMessages.has(messageId);
          const isVolumeToggled = volumeToggledMessages.has(messageId);

          return (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 4
            }}>
              <TouchableOpacity
                onPress={() => {
                  if (isVolumeToggled) {
                    onStopSpeech();
                  } else {
                    onSpeakMessage(props.currentMessage?.text || '', messageId);
                  }
                  onToggleVolumeMessage(messageId);
                }}
                style={{
                  backgroundColor: isVolumeToggled ? '#2F855A' : '#2F855A',
                  borderRadius: 30,
                  width: 30,
                  height: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name={isThisMessageSpeaking ? "pause" : "volume-high"}
                  size={16}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          );
        }
        return null;
      }}
    />
  );
};

export default ChatBubble;
