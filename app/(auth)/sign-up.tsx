import CustomButton from "@/components/Common/CustomButton";
import InputField from "@/components/Common/InputField";
import OAuth from "@/components/Common/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const SignUp = () => {
  const { t } = useTranslation();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      Alert.alert(
        t("common.error"),
        err.errors?.[0]?.longMessage || t("errors.somethingWentWrong")
      );
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === "complete") {
        const response = await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
            phone: form.phone,
          }),
        });

        if (response.error) {
          throw new Error(response.error);
        }

        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: t("errors.tryAgain"),
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors?.[0]?.longMessage || t("errors.somethingWentWrong"),
        state: "failed",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (verification.state === "success") {
      setShowSuccessModal(true);
    }
  }, [verification.state]);

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1 bg-general-500">
            <View className="flex-1 bg-general-500">
              <View className="relative w-full h-[280px]">
                <Image
                  source={images.signUpCar}
                  className="z-0 w-full h-[250px]"
                  resizeMode="contain"
                />
                <Text className="absolute -bottom-2 w-full text-2xl text-center text black font-JakartaSemiBold">
                  {t("auth.createAccount")}
                </Text>
              </View>
              <View className="p-4">
                <InputField
                  label={t("profile.name")}
                  placeholder={t("profile.name")}
                  icon="person-outline"
                  value={form.name}
                  onChangeText={(value) => setForm({ ...form, name: value })}
                />

                <InputField
                  label={t("profile.phone") || "Phone"}
                  placeholder={t("profile.phone") || "0123456789"}
                  icon="call-outline"
                  value={form.phone}
                  keyboardType="phone-pad"
                  onChangeText={(value) => setForm({ ...form, phone: value })}
                />

                <InputField
                  label={t("auth.email")}
                  placeholder={t("auth.email")}
                  icon="mail-outline"
                  value={form.email}
                  onChangeText={(value) => setForm({ ...form, email: value })}
                />

                <InputField
                  label={t("auth.password")}
                  placeholder={t("auth.password")}
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                  value={form.password}
                  onChangeText={(value) =>
                    setForm({ ...form, password: value })
                  }
                />

                <CustomButton
                  title={t("auth.signUp")}
                  onPress={onSignUpPress}
                  loading={loading}
                  className="mt-4"
                />

                <OAuth />
                <Link
                  href="/sign-in"
                  className="mt-4 text-lg text-center text-general-200"
                >
                  {t("auth.alreadyHaveAccount")}{" "}
                  <Text className="text-primary-600">{t("auth.signIn")}</Text>
                </Link>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modal for Verification OTP */}
      <Modal
        visible={verification.state === "pending"}
        transparent={true}
        animationType="fade"
      >
        <View
          className="flex-1 justify-center items-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View className="bg-white w-full px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="mb-2 text-2xl text-black font-JakartaBold">
              {t("auth.signUp")}
            </Text>
            <Text className="mb-4 font-Jakarta">
              {t("common.loading")} {form.email}
            </Text>
            <InputField
              label={t("common.confirm")}
              placeholder="*****"
              icon="lock-closed-outline"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            <CustomButton
              title={t("common.confirm")}
              onPress={onPressVerify}
              loading={loading}
              className="mt-4 bg-success-500"
            />
          </View>
        </View>
      </Modal>

      {/* Modal for Success */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="slide"
      >
        <View
          className="flex-1 justify-center items-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View className="bg-white w-full px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-4"
            />
            <Text className="text-2xl text-center text-black font-JakartaBold">
              {t("common.success")}!
            </Text>
            <Text className="mt-4 text-base text-center text-gray-400 font-Jakarta">
              {t("auth.createAccount")}
            </Text>
            <CustomButton
              title={t("common.done")}
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/(root)/tabs/home");
              }}
              className="mt-4"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignUp;
