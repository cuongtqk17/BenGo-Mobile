import { transporter } from './config';
import { 
  getRideConfirmationHTML, 
  getRideConfirmationText, 
  RideConfirmationData 
} from './templates';

export const sendRideConfirmationEmail = async (
  data: RideConfirmationData
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email service not configured. Skipping email send.');
      return { 
        success: false, 
        error: 'Email service not configured' 
      };
    }

    const info = await transporter.sendMail({
      from: `"Uber Clone" <${process.env.EMAIL_USER}>`,
      to: data.userEmail,
      subject: `✅ Xác nhận đặt xe thành công - Chuyến #${data.rideId}`,
      text: getRideConfirmationText(data),
      html: getRideConfirmationHTML(data),
    });

    return { 
      success: true, 
      messageId: info.messageId 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export { RideConfirmationData } from './templates';
