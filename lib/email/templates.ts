export interface RideConfirmationData {
  userEmail: string;
  userName: string;
  rideId: number;
  originAddress: string;
  destinationAddress: string;
  farePrice: number;
  rideTime: string;
  driverName: string;
  vehicleType: string;
  paymentIntentId: string;
}

export const getRideConfirmationHTML = (data: RideConfirmationData): string => {
  const farePriceVND = data.farePrice.toLocaleString('vi-VN');
  
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đặt xe</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    .container { 
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 16px;
      color: #333;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #667eea;
    }
    .info-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      font-size: 14px;
    }
    .info-value {
      color: #333;
      font-size: 14px;
      text-align: right;
      max-width: 60%;
    }
    .highlight-box {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .total-price {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
      text-align: center;
      margin: 10px 0;
    }
    .status-badge {
      display: inline-block;
      background: #22c55e;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .footer {
      background: #f8f9fa;
      padding: 25px 30px;
      text-align: center;
      color: #666;
      font-size: 13px;
    }
    .footer p {
      margin: 8px 0;
    }
    .divider {
      height: 1px;
      background: #e9ecef;
      margin: 20px 0;
    }
    @media only screen and (max-width: 600px) {
      .container { border-radius: 0; }
      .content { padding: 20px; }
      .header { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 Thanh toán thành công!</h1>
      <p>Payment Successful</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <p class="greeting">Xin chào <strong>${data.userName}</strong>,</p>
      <p class="greeting">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Chuyến đi của bạn đã được xác nhận thành công!</p>
      
      <!-- Ride Information -->
      <div class="section">
        <h2 class="section-title">📍 Thông tin chuyến đi</h2>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Mã chuyến đi</span>
            <span class="info-value"><strong>#${data.rideId}</strong></span>
          </div>
          <div class="info-row">
            <span class="info-label">Điểm đón</span>
            <span class="info-value">${data.originAddress}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Điểm đến</span>
            <span class="info-value">${data.destinationAddress}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Thời gian</span>
            <span class="info-value">${data.rideTime}</span>
          </div>
        </div>
      </div>
      
      <!-- Driver Information -->
      <div class="section">
        <h2 class="section-title">🚗 Thông tin tài xế</h2>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Tên tài xế</span>
            <span class="info-value">${data.driverName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Loại xe</span>
            <span class="info-value">${data.vehicleType}</span>
          </div>
        </div>
      </div>
      
      <!-- Payment Information -->
      <div class="section">
        <h2 class="section-title">💳 Thông tin thanh toán</h2>
        <div class="highlight-box">
          <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Tổng tiền</div>
            <div class="total-price">${farePriceVND} ₫</div>
          </div>
          <div class="divider"></div>
          <div class="info-row" style="border: none;">
            <span class="info-label">Mã giao dịch</span>
            <span class="info-value" style="font-family: monospace; font-size: 12px;">${data.paymentIntentId}</span>
          </div>
          <div class="info-row" style="border: none;">
            <span class="info-label">Trạng thái</span>
            <span class="info-value"><span class="status-badge">✓ Đã thanh toán</span></span>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
          Chúc bạn có một chuyến đi an toàn và vui vẻ!
        </p>
        <p style="color: #999; font-size: 13px;">
          Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Email này được gửi tự động, vui lòng không trả lời.</strong></p>
      <p>Nếu bạn cần hỗ trợ, hãy liên hệ: support@uberclone.com</p>
      <div class="divider"></div>
      <p style="color: #999; font-size: 12px; margin-top: 15px;">
        © 2025 Uber Clone. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getRideConfirmationText = (data: RideConfirmationData): string => {
  const farePriceVND = data.farePrice.toLocaleString('vi-VN');
  
  return `
THANH TOÁN THÀNH CÔNG
Payment Successful

Xin chào ${data.userName},

Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Chuyến đi của bạn đã được xác nhận thành công!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 THÔNG TIN CHUYẾN ĐI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mã chuyến đi: #${data.rideId}
Điểm đón: ${data.originAddress}
Điểm đến: ${data.destinationAddress}
Thời gian: ${data.rideTime}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚗 THÔNG TIN TÀI XẾ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tên tài xế: ${data.driverName}
Loại xe: ${data.vehicleType}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 THÔNG TIN THANH TOÁN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tổng tiền: ${farePriceVND} ₫
Mã giao dịch: ${data.paymentIntentId}
Trạng thái: ✓ Đã thanh toán

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chúc bạn có một chuyến đi an toàn và vui vẻ!

---
Email này được gửi tự động. Vui lòng không trả lời email này.
Nếu cần hỗ trợ, liên hệ: support@uberclone.com

© 2025 Uber Clone. All rights reserved.
  `.trim();
};
