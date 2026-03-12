import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickReply {
  title: string;
  value: string;
}

interface QuickRepliesProps {
  currentMessage: any;
  onQuickReply: (reply: QuickReply) => void;
}

const QUICK_REPLIES: QuickReply[] = [
  {
    title: 'Bạn đang ở đâu?',
    value: 'Bạn đang ở đâu?',
  },
  {
    title: 'Khi nào bạn đến?',
    value: 'Khi nào bạn đến?',
  },
  {
    title: 'Hủy chuyến đi',
    value: 'Hủy chuyến đi',
  },
  {
    title: 'Chia sẻ vị trí',
    value: 'Chia sẻ vị trí',
  },
  {
    title: 'Mẹo an toàn',
    value: 'Mẹo an toàn',
  },
];

const QuickReplies: React.FC<QuickRepliesProps> = ({
  currentMessage,
  onQuickReply,
}) => {
  // Only show quick replies for AI assistant messages that mention support
  if (currentMessage?.user._id === 'ai-assistant' && currentMessage?.text?.includes('hỗ trợ')) {
    return (
      <View style={{ padding: 10 }}>
        <Text style={{
          fontSize: 14,
          fontFamily: 'JakartaBold',
          color: '#333333',
          marginBottom: 10
        }}>
          Câu trả lời nhanh:
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {QUICK_REPLIES.map((reply, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onQuickReply(reply)}
              style={{
                backgroundColor: '#E6FFFA',
                borderRadius: 20,
                paddingHorizontal: 15,
                paddingVertical: 8,
                marginHorizontal: 5,
                marginVertical: 3,
                borderWidth: 1,
                borderColor: '#38A169',
              }}
            >
              <Text style={{
                color: '#2F855A',
                fontFamily: 'Jakarta',
                fontSize: 14,
              }}>
                {reply.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
  
  return null;
};

export default QuickReplies;
