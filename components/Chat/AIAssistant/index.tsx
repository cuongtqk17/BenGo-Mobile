export const generateAIResponse = async (
  userMessage: string
): Promise<string> => {
  try {
    const systemPrompt = `You are an AI assistant for BenGo app. Respond helpfully in Vietnamese/English, provide trip updates, safety tips, or escalate to human support. Provide thorough, detailed, and informative responses. Avoid being too brief; instead, explain things clearly with context and helpful tips. Maintain a friendly and professional tone. Context: User is using BenGo app for ride booking.`;

    // Use OpenRouter with Gemini Flash
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://BenGo.com",
          "X-Title": "BenGo Ride Booking",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.9,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    return text || "Xin lỗi, AI tạm thời không khả dụng. Vui lòng thử lại sau.";
  } catch (error) {
    return "Xin lỗi, AI tạm thời không khả dụng. Vui lòng thử lại sau.";
  }
};

export const cleanTextForSpeech = (text: string): string => {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
};
