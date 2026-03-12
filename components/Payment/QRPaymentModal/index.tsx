import React from "react";
import { useTranslation } from "react-i18next";
import { Animated, Modal, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import CustomButton from "@/components/Common/CustomButton";

interface QRPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: string;
  qrStep: number;
  qrCodeVisible: boolean;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  qrScanAnim: Animated.Value;
  onQRPayment: () => void;
  onBackToStep1: () => void;
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  visible,
  onClose,
  amount,
  qrStep,
  qrCodeVisible,
  fadeAnim,
  scaleAnim,
  qrScanAnim,
  onQRPayment,
  onBackToStep1,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Animated.View
        className="flex-1 justify-center items-center"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          className="flex flex-col justify-center items-center p-4 mx-4 w-11/12 bg-white rounded-2xl"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          {qrStep === 1 && (
            <>
              <View className="flex justify-center items-center mb-4 w-16 h-16 bg-green-100 rounded-full">
                <Text className="text-3xl">📱</Text>
              </View>
              <Text className="mb-2 text-xl text-center font-JakartaBold">
                {t("payment.payQR")}
              </Text>
              <Text className="mb-4 text-center text-gray-600 font-JakartaRegular">
                {t("payment.scanQRDesc")}
              </Text>
              <View className="p-4 mb-4 w-full bg-gray-50 rounded-lg">
                <Text className="text-lg text-center font-JakartaSemiBold">
                  {t("payment.amount")}:{" "}
                  {Number(amount).toLocaleString("vi-VN")} VNĐ
                </Text>
              </View>
              <View className="flex flex-row gap-x-4 w-full">
                <CustomButton
                  title={t("common.cancel")}
                  className="flex-1 bg-gray-200"
                  onPress={onClose}
                />
                <CustomButton
                  title={t("payment.generateQR")}
                  className="flex-1"
                  onPress={onQRPayment}
                />
              </View>
            </>
          )}

          {qrStep === 2 && (
            <>
              <View className="flex justify-center items-center mb-4 w-16 h-16 bg-green-100 rounded-full">
                <Text className="text-3xl">📱</Text>
              </View>
              <Text className="mb-2 text-xl text-center font-JakartaBold">
                {t("payment.scanQRToPay")}
              </Text>
              <Text className="mb-4 text-center text-gray-600 font-JakartaRegular">
                {t("payment.useBankApp")}
              </Text>

              <View className="relative justify-center items-center mb-4 w-64 h-64 bg-white rounded-lg border-2 border-gray-300">
                {qrCodeVisible && (
                  <>
                    {/* Real QR Code */}
                    <View className="justify-center items-center p-4 w-48 h-48 bg-white rounded-lg">
                      <QRCode
                        value={`https://payment.my-app.com/qr?amount=${amount}&transaction=QR${Date.now().toString().slice(-6)}&timestamp=${Date.now()}`}
                        size={160}
                        color="black"
                        backgroundColor="white"
                        logoSize={30}
                        logoMargin={2}
                        logoBorderRadius={15}
                        quietZone={10}
                      />
                    </View>

                    {/* Scanning animation */}
                    <Animated.View
                      className="absolute w-full h-1 bg-green-500"
                      style={{
                        opacity: qrScanAnim,
                        transform: [
                          {
                            translateY: qrScanAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 240],
                            }),
                          },
                        ],
                      }}
                    />
                  </>
                )}
              </View>

              <View className="p-4 mb-4 w-full bg-green-50 rounded-lg border border-green-200">
                <Text className="text-center text-green-700 font-JakartaSemiBold">
                  {t("payment.qrTip")}
                </Text>
              </View>

              <View className="p-4 mb-4 w-full bg-gray-50 rounded-lg border border-gray-200">
                <View className="flex flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-700 font-JakartaSemiBold">
                    {t("payment.transactionId")}:
                  </Text>
                  <Text className="text-sm text-gray-600 font-JakartaRegular">
                    QR{Date.now().toString().slice(-6)}
                  </Text>
                </View>
                <View className="flex flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-700 font-JakartaSemiBold">
                    {t("payment.amount")}:
                  </Text>
                  <Text className="text-sm text-green-600 font-JakartaSemiBold">
                    {Number(amount).toLocaleString("vi-VN")} VNĐ
                  </Text>
                </View>
                <View className="flex flex-row justify-between items-center">
                  <Text className="text-sm text-gray-700 font-JakartaSemiBold">
                    {t("payment.time")}:
                  </Text>
                  <Text className="text-sm text-gray-600 font-JakartaRegular">
                    {new Date().toLocaleTimeString("vi-VN")}
                  </Text>
                </View>
              </View>

              <View className="flex flex-row gap-x-4 w-full">
                <CustomButton
                  title={t("common.back")}
                  className="flex-1 bg-gray-200"
                  onPress={onBackToStep1}
                />
                <CustomButton
                  title={t("payment.doneScanning")}
                  className="flex-1"
                  onPress={onQRPayment}
                />
              </View>
            </>
          )}

          {qrStep === 3 && (
            <>
              <View className="flex justify-center items-center mb-4 w-16 h-16 bg-green-100 rounded-full">
                <Text className="text-3xl">✅</Text>
              </View>
              <Text className="mb-2 text-xl text-center font-JakartaBold">
                {t("payment.confirmingPayment")}
              </Text>
              <Text className="mb-4 text-center text-gray-600 font-JakartaRegular">
                {t("payment.checkingTransaction")}
              </Text>
              <View className="overflow-hidden w-full h-2 bg-gray-200 rounded-full">
                <Animated.View
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: qrScanAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  }}
                />
              </View>
              <Text className="mt-2 text-sm text-gray-500 font-JakartaRegular">
                {t("payment.doNotCloseApp")}
              </Text>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default QRPaymentModal;
