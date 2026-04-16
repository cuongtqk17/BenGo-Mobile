export interface BookingAISuggestion {
  // Product lookup
  correctedName: string;
  estimatedWeight: string;
  estimatedLength: string;
  productInfo: string;
  // Vehicle + note suggestion
  recommendedVehicle: 'BIKE' | 'VAN' | 'TRUCK';
  vehicleReason: string;
  suggestedNote: string;
  tips: string[];
  // Conflict warning
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

const SYSTEM_PROMPT = `Bạn là trợ lý AI cho ứng dụng giao hàng BenGo. Bạn có 2 nhiệm vụ:

**NHIỆM VỤ 1: TRA CỨU & SỬA THÔNG TIN SẢN PHẨM**
Khi người dùng nhập tên hàng hóa (có thể viết tắt, sai chính tả, hoặc không đầy đủ), bạn phải:
- Tra cứu từ kiến thức của bạn để nhận diện sản phẩm chính xác
- Sửa lại tên đúng chính tả, viết hoa đúng chuẩn (tên thương hiệu, model...)
- Ước tính cân nặng VÀ chiều dài/kích thước thực tế nếu người dùng chưa nhập hoặc nhập sai
- Mô tả ngắn gọn về sản phẩm

Ví dụ:
- "xe ab125" → "Honda Air Blade 125cc" - ~112 kg, dài ~1.9m
- "may giat samsung 9kg" → "Máy giặt Samsung 9kg" - ~65 kg, dài ~60cm
- "iphone 15 pro" → "iPhone 15 Pro" - ~0.19 kg, dài ~15cm
- "tu lanh panasonic" → "Tủ lạnh Panasonic" - ~50-80 kg, cao ~1.7m
- "ban ghe go" → "Bàn ghế gỗ" - ~30-50 kg, dài ~1.2m
- "sofa 3 cho" → "Sofa 3 chỗ" - ~80-120 kg, dài ~2.1m

**NHIỆM VỤ 2: GỢI Ý LOẠI XE & GHI CHÚ**
Các loại xe có sẵn:
- BIKE: Xe máy - phù hợp hàng nhỏ gọn, dưới 20kg, dài dưới 50cm, không cồng kềnh
- VAN: Xe tải van - phù hợp hàng trung bình 20-200kg, dài 50cm-1.8m, đồ gia dụng vừa
- TRUCK: Xe tải lớn - phù hợp hàng nặng trên 200kg HOẶC dài trên 1.8m, cồng kềnh

**QUY TẮC XỬ LÝ MÂU THUẪN THÔNG TIN:**
- Nếu người dùng khai khối lượng nhỏ nhưng tên hàng thực tế rất nặng (ví dụ: khai 5kg nhưng hàng là xe máy ~112kg):
  → Dùng cân nặng THỰC TẾ của sản phẩm để gợi ý xe, đặt conflictWarning
- Nếu người dùng có đính kèm ảnh (imageCount > 0):
  → Lưu ý rằng ảnh có thể chứa hàng hóa nặng/cồng kềnh hơn mô tả. Hãy dựa vào tên sản phẩm để ước tính chính xác.
  → Nếu số lượng ảnh nhiều (>= 3), khả năng đây là hàng cồng kềnh hoặc nhiều kiện.
- Nếu chiều dài/kích thước vượt quá giới hạn của xe nhỏ:
  → Phải ưu tiên gợi ý xe đủ lớn dù cân nặng có vẻ nhỏ

Trả về JSON chính xác (KHÔNG markdown, KHÔNG \`\`\`json):
{
  "correctedName": "Tên sản phẩm đúng chính tả, viết hoa chuẩn",
  "estimatedWeight": "Số kg ước tính (chỉ số, ví dụ: 112)",
  "estimatedLength": "Kích thước ước tính (ví dụ: 1.9m x 0.7m hoặc ~60cm)",
  "productInfo": "Mô tả ngắn về sản phẩm (kích thước ước tính, lưu ý vận chuyển)",
  "recommendedVehicle": "BIKE|VAN|TRUCK",
  "vehicleReason": "Giải thích ngắn lý do chọn xe (1-2 câu), đề cập cân nặng VÀ kích thước",
  "suggestedNote": "Ghi chú gợi ý cho tài xế",
  "tips": ["Mẹo 1", "Mẹo 2"],
  "conflictWarning": "Cảnh báo nếu thông tin người dùng nhập không khớp với thực tế (để trống nếu không có)"
}

Quy tắc bắt buộc:
- correctedName: PHẢI sửa chính tả, viết hoa thương hiệu đúng chuẩn
- estimatedWeight: Ưu tiên cân nặng THỰC TẾ của sản phẩm, không tin tuyệt đối vào số người dùng nhập nếu mâu thuẫn
- estimatedLength: PHẢI ước tính kích thước/chiều dài sản phẩm để đánh giá sức chứa xe
- recommendedVehicle: Phải xem xét CẢ cân nặng lẫn kích thước. Hàng dài/cồng kềnh cần xe lớn dù nhẹ
- conflictWarning: Thêm cảnh báo khi người dùng khai cân nặng không phù hợp với thực tế sản phẩm
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

  const lengthNote = !request.goodsLength || request.goodsLength.trim() === ''
    ? '(chưa nhập - hãy ước tính giúp)'
    : request.goodsLength;

  const imageNote = request.imageCount > 0
    ? `Có ${request.imageCount} ảnh hàng hóa đính kèm. LƯU Ý: Ảnh có thể phản ánh hàng hóa nặng/cồng kềnh hơn mô tả. Hãy dùng kiến thức về sản phẩm để ước tính chính xác.`
    : 'Không có ảnh hàng hóa';

  const userPrompt = `Thông tin hàng hóa:
- Tên hàng (người dùng nhập): "${request.goodsName}"
- Khối lượng (người dùng khai): ${weightNote}
- Kích thước/Chiều dài: ${lengthNote}
- ${imageNote}
- Ghi chú hiện tại: ${request.currentNote || '(chưa có)'}
${request.distance ? `- Khoảng cách giao: ${request.distance} km` : ''}

QUAN TRỌNG: Hãy tra cứu thực tế của sản phẩm "${request.goodsName}" để biết cân nặng và kích thước thực tế. Nếu người dùng khai cân nặng không phù hợp với sản phẩm thực tế, hãy dùng số liệu thực tế và thêm cảnh báo. Gợi ý xe phải dựa trên cả cân nặng VÀ kích thước.`;

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
        max_tokens: 1000,
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
