export interface BookingAISuggestion {
  // Thông tin tham khảo (hiển thị để người dùng biết, KHÔNG auto-fill vào form)
  estimatedWeight: string;
  estimatedLength: string;
  productInfo: string;
  // Gợi ý xe (áp dụng khi người dùng nhấn "Áp dụng")
  recommendedVehicle: 'BIKE' | 'VAN' | 'TRUCK';
  vehicleReason: string;
  // Ghi chú gợi ý (áp dụng khi người dùng nhấn "Áp dụng")
  suggestedNote: string;
  tips: string[];
  // Cảnh báo mâu thuẫn (chỉ hiển thị, không thay đổi dữ liệu)
  conflictWarning?: string;
}

export interface BookingAIRequest {
  goodsName: string;
  goodsWeight: string;
  goodsLength?: string;
  hasImages: boolean;
  imageCount: number;
  currentNote: string;
  distance?: number;
}

const SYSTEM_PROMPT = `Bạn là trợ lý AI cho ứng dụng giao hàng BenGo. Nhiệm vụ của bạn là:

**PHÂN TÍCH HÀNG HÓA (chỉ để tham khảo)**
Dựa vào tên hàng hóa người dùng nhập để:
- Ước tính cân nặng thực tế của sản phẩm (estimatedWeight)
- Ước tính kích thước/chiều dài thực tế (estimatedLength)
- Mô tả ngắn về sản phẩm (productInfo)
- Nếu thông tin người dùng khai có sự chênh lệch quá lớn so với thực tế, hãy hiển thị cảnh báo (conflictWarning) để người dùng lưu ý.

**GỢI Ý LOẠI XE (BẮT BUỘC DỰA TRÊN THÔNG TIN NGƯỜI DÙNG NHẬP)**
Các loại xe có sẵn:
- BIKE: Xe máy - tối đa 20kg, dài dưới 50cm.
- VAN: Xe tải van - từ 20-200kg, dài 50cm-1.8m.
- TRUCK: Xe tải lớn - trên 200kg HOẶC dài trên 1.8m.

QUY TẮC TỐI THƯỢNG:
- Bạn PHẢI sử dụng Khối lượng và Kích thước mà người dùng ĐÃ NHẬP làm căn cứ duy nhất để gợi ý loại phương tiện.
- KHÔNG ĐƯỢC tự ý dùng số liệu thực tế bạn ước tính để thay đổi gợi ý xe nếu người dùng đã nhập thông tin.
- **Giải thích lý do (vehicleReason):** Bạn phải giải thích rõ ràng tại sao loại xe này phù hợp dựa trên số liệu người dùng đã nhập. Ví dụ: "Dựa trên khối lượng 10kg và kích thước 40cm bạn nhập, xe máy (BIKE) là lựa chọn tối ưu và tiết kiệm nhất." hoặc "Vì hàng dài 2m (vượt quá giới hạn 1.8m của xe Van), nên bạn cần sử dụng xe tải (TRUCK)."

Trả về JSON chính xác (KHÔNG markdown, KHÔNG \`\`\`json):
{
  "estimatedWeight": "Ước tính thực tế (ví dụ: ~112 kg)",
  "estimatedLength": "Ước tính thực tế (ví dụ: 1.9m x 0.7m)",
  "productInfo": "Mô tả ngắn về sản phẩm",
  "recommendedVehicle": "BIKE|VAN|TRUCK",
  "vehicleReason": "Giải thích logic lý do chọn xe bằng cách so khớp số liệu người dùng nhập với giới hạn của loại xe đó.",
  "suggestedNote": "Ghi chú hướng dẫn tài xế cụ thể",
  "tips": ["Mẹo 1", "Mẹo 2"],
  "conflictWarning": "Cảnh báo nếu thông tin người dùng khai chênh lệch lớn so với sản phẩm thực tế"
}

Quy tắc bắt buộc:
- vehicleReason: Phải chỉ ra sự tương quan giữa thông số (cân nặng/kích thước) của đơn hàng và khả năng đáp ứng của loại xe.
- Dùng tiếng Việt tự nhiên`;

export const getBookingAISuggestion = async (
  request: BookingAIRequest,
  openaiApiKey: string
): Promise<BookingAISuggestion> => {
  const weightNote = !request.goodsWeight || request.goodsWeight === '0'
    ? '(chưa nhập - AI hãy ước tính)'
    : `${request.goodsWeight} kg`;

  const lengthNote = !request.goodsLength || request.goodsLength.trim() === ''
    ? '(chưa nhập - AI hãy ước tính)'
    : request.goodsLength;

  const imageNote = request.imageCount > 0
    ? `Có ${request.imageCount} ảnh hàng hóa đính kèm.`
    : 'Không có ảnh hàng hóa';

  const userPrompt = `YÊU CẦU: Bạn PHẢI ưu tiên tuyệt đối thông tin người dùng đã nhập dưới đây để gợi ý loại xe và giải thích lý do lựa chọn một cách logic.

Thông tin người dùng nhập:
- Tên hàng: "${request.goodsName}"
- Khối lượng người dùng khai: ${weightNote}
- Kích thước người dùng khai: ${lengthNote}
- ${imageNote}

Hãy thực hiện:
1. Gợi ý loại xe dựa TRÊN THÔNG TIN NGƯỜI DÙNG ĐÃ NHẬP.
2. Tại mục "vehicleReason": Hãy giải thích rõ tại sao loại xe đó được chọn dựa trên các thông số người dùng đã cung cấp (so sánh với giới hạn tải trọng/kích thước của xe).
3. Đưa ra thông tin ước tính thực tế để tham khảo và ghi cảnh báo nếu cần.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Không nhận được phản hồi từ AI');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        const startIdx = content.indexOf('{');
        const endIdx = content.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          parsed = JSON.parse(content.substring(startIdx, endIdx + 1));
        } else {
          throw new Error('Không thể phân tích phản hồi AI');
        }
      }
    }

    return {
      estimatedWeight: parsed.estimatedWeight || '',
      estimatedLength: parsed.estimatedLength || '',
      productInfo: parsed.productInfo || '',
      recommendedVehicle: parsed.recommendedVehicle || 'VAN',
      vehicleReason: parsed.vehicleReason || '',
      suggestedNote: parsed.suggestedNote || '',
      tips: parsed.tips || [],
      conflictWarning: parsed.conflictWarning || undefined,
    };
  } catch (error: any) {
    throw error;
  }
};
