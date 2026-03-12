import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import { fetchAPI } from "@/lib/fetch";

export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (error) {
      return;
    }
  },
};

export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    const { createdSessionId, setActive, signUp } = await startOAuthFlow({
      redirectUrl: Linking.createURL("/(root)/tabs/home"),
    });

    if (createdSessionId) {
      if (setActive) {
        await setActive({ session: createdSessionId });

        if (signUp.createdUserId) {
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: `${signUp.firstName} ${signUp.lastName}`,
              email: signUp.emailAddress,
              clerkId: signUp.createdUserId,
            }),
          });
        }

        return {
          success: true,
          code: "success",
          message: "You have successfully signed in with Google",
        };
      }
    }

    console.warn("⚠️ OAuth flow completed but no session created");
    return {
      success: false,
      code: "no_session",
      message: "An error occurred while signing in with Google",
    };
  } catch (error: any) {
    if (error.status === 429) {
      return {
        success: false,
        code: "rate_limit",
        message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi vài phút và thử lại.",
      };
    }
    
    return {
      success: false,
      code: error.code || "unknown_error",
      message: error?.errors?.[0]?.message || error.message || "Đã xảy ra lỗi khi đăng nhập với Google",
    };
  }
};