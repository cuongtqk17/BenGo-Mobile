export interface BookingAISuggestion {
  // Product lookup
  correctedName: string;
  estimatedWeight: string;
  productInfo: string;
  // Vehicle + note suggestion
  recommendedVehicle: 'BIKE' | 'VAN' | 'TRUCK';
  vehicleReason: string;
  suggestedNote: string;
  tips: string[];
}

export interface BookingAIRequest {
  goodsName: string;
  goodsWeight: string;
  hasImages: boolean;
  imageCount: number;
  currentNote: string;
  distance?: number;
}

const SYSTEM_PROMPT = `Bạn là trợ lý AI cho ứng dụng giao hàng BenGo. Bạn có 2 nhiệm vụ:

**NHIỆM VỤ 1: TRA CỨU & SỬA THÔNG TIN SẢN PHẨM**
Khi người dùng nhập tên hàng hóa (có thể viết tắt, sai chính tả, hoặc không đầy đủ), bạn phải:
- Tra cứu từ kiến thức của bạn để nhận diện sản phẩm chính xác
- Sửa lại tên đúng chính tả, viết hoa đúng chuẩn (tên thương hiệu, model...)
- Ước tính cân nặng thực tế nếu người dùng chưa nhập hoặc nhập sai
- Mô tả ngắn gọn về sản phẩm

Ví dụ:
- "xe ab125" → "Honda Air Blade 125cc" - ~112 kg
- "may giat samsung 9kg" → "Máy giặt Samsung 9kg" - ~65 kg  
- "iphone 15 pro" → "iPhone 15 Pro" - ~0.19 kg
- "tu lanh panasonic" → "Tủ lạnh Panasonic" - ~50-80 kg
- "ban ghe go" → "Bàn ghế gỗ" - ~30-50 kg

**NHIỆM VỤ 2: GỢI Ý LOẠI XE & GHI CHÚ**
Các loại xe có sẵn:
- BIKE: Xe máy - phù hợp hàng nhỏ gọn, dưới 20kg, không cồng kềnh
- VAN: Xe tải van - phù hợp hàng trung bình 20-200kg, đồ gia dụng vừa
- TRUCK: Xe tải lớn - phù hợp hàng nặng trên 200kg, cồng kềnh

Trả về JSON chính xác (KHÔNG markdown, KHÔNG \`\`\`json):
{
  "correctedName": "Tên sản phẩm đúng chính tả, viết hoa chuẩn",
  "estimatedWeight": "Số kg ước tính (chỉ số, ví dụ: 112)",
  "productInfo": "Mô tả ngắn về sản phẩm (kích thước ước tính, lưu ý vận chuyển)",
  "recommendedVehicle": "BIKE|VAN|TRUCK",
  "vehicleReason": "Giải thích ngắn lý do chọn xe (1-2 câu)",
  "suggestedNote": "Ghi chú gợi ý cho tài xế",
  "tips": ["Mẹo 1", "Mẹo 2"]
}

Quy tắc:
- correctedName: PHẢI sửa chính tả, viết hoa thương hiệu đúng chuẩn
- estimatedWeight: Nếu người dùng đã nhập cân nặng hợp lý thì giữ nguyên, nếu chưa nhập (0) hoặc sai thì ước tính
- productInfo: Mô tả 1-2 câu về kích thước, đặc điểm vận chuyển
- Ghi chú phải cụ thể và hữu ích cho tài xế
- Tips tối đa 3 mục, ngắn gọn
- Dùng tiếng Việt tự nhiên`;

export const getBookingAISuggestion = async (
  request: BookingAIRequest,
  openaiApiKey: string
): Promise<BookingAISuggestion> => {
  const weightNote = !request.goodsWeight || request.goodsWeight === '0' 
    ? '(chưa nhập - hãy ước tính giúp)'
    : `${request.goodsWeight} kg`;

  const userPrompt = `Thông tin hàng hóa:
- Tên hàng (người dùng nhập): "${request.goodsName}"
- Khối lượng: ${weightNote}
- Có ${request.imageCount} ảnh hàng hóa
- Ghi chú hiện tại: ${request.currentNote || '(chưa có)'}
${request.distance ? `- Khoảng cách giao: ${request.distance} km` : ''}

Hãy tra cứu thông tin sản phẩm, sửa chính tả, ước tính cân nặng, và gợi ý loại xe + ghi chú phù hợp.`;

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
        temperature: 0.5,
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
      correctedName: parsed.correctedName || request.goodsName,
      estimatedWeight: parsed.estimatedWeight || request.goodsWeight || '0',
      productInfo: parsed.productInfo || '',
      recommendedVehicle: parsed.recommendedVehicle || 'VAN',
      vehicleReason: parsed.vehicleReason || '',
      suggestedNote: parsed.suggestedNote || '',
      tips: parsed.tips || [],
    };
  } catch (error: any) {
    console.error('Booking AI error:', error);
    throw error;
  }
};
