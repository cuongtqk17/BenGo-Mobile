import { fetchAPI } from "@/lib/fetch";

export interface HotspotLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  reason: string;
  crowdLevel: 'high' | 'medium' | 'low';
  estimatedCustomers: string;
  category: string;
  icon: string;
}

export interface HotspotRequest {
  latitude: number;
  longitude: number;
  radius?: number; // km
}

export interface HotspotResponse {
  locations: HotspotLocation[];
  summary: string;
  analyzedAt: string;
}

// Các loại địa điểm cần tìm qua Google Places
const PLACE_TYPES_BY_TIME = (hour: number, isWeekend: boolean): string[] => {
  if (hour >= 5 && hour < 9) {
    // Giờ cao điểm sáng: chợ, trường học, bệnh viện
    return ['market', 'school', 'hospital', 'bus_station', 'train_station'];
  } else if (hour >= 9 && hour < 11) {
    // Sáng: siêu thị, bệnh viện
    return ['supermarket', 'shopping_mall', 'hospital'];
  } else if (hour >= 11 && hour < 14) {
    // Trưa: nhà hàng, quán ăn, siêu thị
    return ['restaurant', 'food', 'supermarket'];
  } else if (hour >= 14 && hour < 17) {
    // Chiều: cafe, trung tâm mua sắm
    return ['cafe', 'shopping_mall', 'supermarket'];
  } else if (hour >= 17 && hour < 20) {
    // Chiều tối: nhà hàng, chợ, trung tâm mua sắm
    return isWeekend
      ? ['restaurant', 'shopping_mall', 'amusement_park', 'night_club']
      : ['restaurant', 'supermarket', 'bus_station', 'shopping_mall'];
  } else if (hour >= 20 && hour < 23) {
    // Tối: nhà hàng, giải trí
    return ['restaurant', 'bar', 'night_club', 'amusement_park'];
  }
  return ['convenience_store', 'restaurant'];
};

const CATEGORY_MAP: Record<string, string> = {
  market: 'market',
  supermarket: 'shopping',
  shopping_mall: 'shopping',
  hospital: 'hospital',
  school: 'school',
  university: 'school',
  restaurant: 'food',
  food: 'food',
  cafe: 'food',
  bus_station: 'transport',
  train_station: 'transport',
  airport: 'transport',
  amusement_park: 'entertainment',
  night_club: 'entertainment',
  bar: 'entertainment',
  convenience_store: 'shopping',
  tourist_attraction: 'tourism',
};

const ICON_MAP: Record<string, string> = {
  shopping: 'cart',
  food: 'restaurant',
  transport: 'bus',
  hospital: 'medkit',
  school: 'school',
  entertainment: 'game-controller',
  office: 'briefcase',
  market: 'storefront',
  tourism: 'camera',
};

const getDayName = (date: Date): string => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return days[date.getDay()];
};

const getTimeContext = (date: Date): string => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 9) return 'buổi sáng sớm (giờ cao điểm đi làm)';
  if (hour >= 9 && hour < 11) return 'buổi sáng (sau giờ cao điểm)';
  if (hour >= 11 && hour < 14) return 'buổi trưa (giờ ăn trưa)';
  if (hour >= 14 && hour < 17) return 'buổi chiều';
  if (hour >= 17 && hour < 20) return 'buổi chiều tối (giờ cao điểm tan làm)';
  if (hour >= 20 && hour < 23) return 'buổi tối';
  return 'khuya';
};

// Lấy danh sách địa điểm thực tế từ Google Places API
const fetchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  radius: number,
  placeTypes: string[],
  googleApiKey: string
): Promise<any[]> => {
  const radiusMeters = Math.min(radius * 1000, 50000); // max 50km
  const allPlaces: any[] = [];
  const seenIds = new Set<string>();

  // Lấy tối đa 2 loại địa điểm để tránh quota
  const typesToFetch = placeTypes.slice(0, 2);

  for (const type of typesToFetch) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&type=${type}&language=vi&key=${googleApiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && data.results) {
        for (const place of data.results.slice(0, 5)) {
          if (!seenIds.has(place.place_id)) {
            seenIds.add(place.place_id);
            allPlaces.push({
              id: place.place_id,
              name: place.name,
              address: place.vicinity || place.formatted_address || '',
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              types: place.types || [],
              rating: place.rating || 0,
              user_ratings_total: place.user_ratings_total || 0,
              opening_hours: place.opening_hours,
            });
          }
        }
      }
    } catch (err) {
      // Bỏ qua lỗi từng type, tiếp tục với type khác
    }
  }

  return allPlaces;
};

// AI phân tích và xếp hạng các địa điểm thực tế
const AI_RANKING_PROMPT = `Bạn là trợ lý AI cho tài xế giao hàng. Nhiệm vụ của bạn là phân tích danh sách các địa điểm thực tế được cung cấp và đánh giá mức độ đông khách dựa trên thời điểm hiện tại.

CHỈ sử dụng các địa điểm trong danh sách được cung cấp. KHÔNG được tự thêm địa điểm mới hoặc thay đổi tọa độ.

Trả về JSON (KHÔNG markdown, KHÔNG \`\`\`json):
{
  "rankedLocations": [
    {
      "id": "ID từ danh sách gốc",
      "reason": "Lý do địa điểm này đông người vào thời điểm này (cụ thể, 1-2 câu)",
      "crowdLevel": "high|medium|low",
      "estimatedCustomers": "Ước tính số khách (ví dụ: 50-100 người)",
      "category": "shopping|food|transport|hospital|school|entertainment|office|market|tourism"
    }
  ],
  "summary": "Tóm tắt ngắn về tình hình khu vực theo thời điểm"
}

Quy tắc:
- Chỉ trả về TỐI ĐA 8 địa điểm có mức độ đông cao nhất
- Ưu tiên địa điểm phù hợp với thời điểm trong ngày
- crowdLevel: high nếu rất đông, medium nếu đông vừa, low nếu đông nhẹ
- Lý do phải cụ thể theo thời gian và loại địa điểm`;

export const predictHotspots = async (
  request: HotspotRequest,
  openaiApiKey: string,
  googleApiKey?: string
): Promise<HotspotResponse> => {
  const now = new Date();
  const dayName = getDayName(now);
  const timeContext = getTimeContext(now);
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const hour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const radius = request.radius || 5;

  // Lấy API key của Google
  const gApiKey = googleApiKey || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

  let realPlaces: any[] = [];

  if (gApiKey) {
    try {
      const placeTypes = PLACE_TYPES_BY_TIME(hour, isWeekend);
      realPlaces = await fetchNearbyPlaces(
        request.latitude,
        request.longitude,
        radius,
        placeTypes,
        gApiKey
      );
    } catch (err) {
      // Nếu Google Places thất bại, vẫn tiếp tục với AI
      realPlaces = [];
    }
  }

  // Nếu không có địa điểm thực tế → thông báo lỗi
  if (realPlaces.length === 0) {
    throw new Error(
      'Không thể tải địa điểm thực tế từ Google Maps. Vui lòng kiểm tra kết nối internet và thử lại.'
    );
  }

  // Tạo prompt cho AI với danh sách địa điểm thực tế
  const placesListStr = realPlaces.map((p, i) =>
    `${i + 1}. ID: ${p.id}
   Tên: ${p.name}
   Địa chỉ: ${p.address}
   Tọa độ: ${p.latitude}, ${p.longitude}
   Loại: ${p.types.join(', ')}
   Đánh giá: ${p.rating}/5 (${p.user_ratings_total} lượt)
   Giờ mở cửa: ${p.opening_hours?.open_now !== undefined ? (p.opening_hours.open_now ? 'Đang mở cửa' : 'Đã đóng') : 'Không rõ'}`
  ).join('\n\n');

  const userPrompt = `Thời gian hiện tại: ${timeStr} - ${timeContext}
Ngày: ${dayName}${isWeekend ? ' (Cuối tuần)' : ' (Ngày thường)'}
Bán kính tìm kiếm: ${radius}km

Danh sách địa điểm thực tế trong khu vực:
${placesListStr}

Hãy phân tích và xếp hạng các địa điểm trên theo mức độ đông khách tại thời điểm ${timeStr} ${dayName}.
Chỉ giữ lại những địa điểm có thể đang hoặc sắp đông khách.`;

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
          { role: 'system', content: AI_RANKING_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2000,
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

    // Map lại tọa độ THỰC TẾ từ Google Places, không dùng tọa độ AI tự tạo
    const rankedLocations: HotspotLocation[] = (parsed.rankedLocations || [])
      .map((ranked: any) => {
        const realPlace = realPlaces.find((p) => p.id === ranked.id);
        if (!realPlace) return null;

        const category = ranked.category || CATEGORY_MAP[realPlace.types?.[0]] || 'shopping';
        const icon = ICON_MAP[category] || 'location';

        return {
          id: realPlace.id,
          name: realPlace.name,
          address: realPlace.address,
          // TỌA ĐỘ THỰC TẾ từ Google Places, không dùng AI
          latitude: realPlace.latitude,
          longitude: realPlace.longitude,
          reason: ranked.reason || '',
          crowdLevel: (ranked.crowdLevel as 'high' | 'medium' | 'low') || 'medium',
          estimatedCustomers: ranked.estimatedCustomers || 'Chưa rõ',
          category,
          icon,
        };
      })
      .filter(Boolean) as HotspotLocation[];

    return {
      locations: rankedLocations,
      summary: parsed.summary || 'Phân tích hoàn tất',
      analyzedAt: now.toISOString(),
    };
  } catch (error: any) {
    throw error;
  }
};
