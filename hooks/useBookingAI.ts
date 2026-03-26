import { useState, useCallback } from 'react';
import { getBookingAISuggestion, BookingAISuggestion, BookingAIRequest } from '@/api/booking-ai';

interface UseBookingAIReturn {
  suggestion: BookingAISuggestion | null;
  isLoading: boolean;
  error: string | null;
  getSuggestion: (request: BookingAIRequest) => Promise<void>;
  clearSuggestion: () => void;
}

export const useBookingAI = (): UseBookingAIReturn => {
  const [suggestion, setSuggestion] = useState<BookingAISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestion = useCallback(async (request: BookingAIRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('Thiếu OPENAI API KEY');
      }

      const result = await getBookingAISuggestion(request, apiKey);
      setSuggestion(result);
    } catch (err: any) {
      setError(err.message || 'Không thể lấy gợi ý AI');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestion = useCallback(() => {
    setSuggestion(null);
    setError(null);
  }, []);

  return {
    suggestion,
    isLoading,
    error,
    getSuggestion,
    clearSuggestion,
  };
};
