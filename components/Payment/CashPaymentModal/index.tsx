import React from "react";
import { useTranslation } from "react-i18next";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";

import CustomButton from "@/components/Common/CustomButton";

interface CashPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: string;
  cashStep: number;
  paymentAmount: string;
  changeAmount: string;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  qrScanAnim: Animated.Value;
  onCashPayment: () => void;
  onCashAmountChange: (value: string) => void;
  onBackToStep1: () => void;
}

const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  visible,
  onClose,
  amount,
  cashStep,
  paymentAmount,
  changeAmount,
  fadeAnim,
  scaleAnim,
  qrScanAnim,
  onCashPayment,
  onCashAmountChange,
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
          {cashStep === 1 && (
            <>
              <View className="flex justify-center items-center mb-4 w-16 h-16 bg-green-100 rounded-full">
                <Text className="text-3xl">💵</Text>
              </View>
              <Text className="mb-2 text-xl text-center font-JakartaBold">
                {t("payment.payCash")}
              </Text>
              <Text className="mb-4 text-center text-gray-600 font-JakartaRegular">
                {t("payment.prepareCash")}
              </Text>
              <View className="p-4 mb-4 w-full bg-gray-50 rounded-lg">
                <Text className="text-lg text-center font-JakartaSemiBold">
                  {t("payment.amountToPay")}:{" "}
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
                  title={t("common.continue")}
                  className="flex-1"
                  onPress={onCashPayment}
                />
              </View>
            </>
          )}

          {cashStep === 2 && (
            <>
              <View className="flex justify-center items-center mb-4 w-16 h-16 bg-green-100 rounded-full">
                <Text className="text-3xl">💰</Text>
              </View>
              <Text className="mb-2 text-xl text-center font-JakartaBold">
                {t("payment.enterReceivedAmount")}
              </Text>
              <Text className="mb-4 text-center text-gray-600 font-JakartaRegular">
                {t("payment.receivedAmountDesc")}
              </Text>

              <View className="mb-4 w-full">
                <Text className="mb-2 text-sm text-gray-700 font-JakartaSemiBold">
                  {t("payment.amountToPay")}:{" "}
                  {Number(amount).toLocaleString("vi-VN")} VNĐ
                </Text>
                <View className="flex flex-row items-center p-4 rounded-lg border border-gray-300">
                  <Text className="text-lg">💰</Text>
                  <Text className="flex-1 ml-2 text-lg font-JakartaRegular">
                    {Number(paymentAmount).toLocaleString("vi-VN")} VNĐ
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const currentAmount = parseFloat(paymentAmount);
                      const newAmount = (currentAmount + 10000).toString();
                      onCashAmountChange(newAmount);
                    }}
                    className="px-4 py-1 bg-green-500 rounded"
                  >
                    <Text className="text-sm text-neutral-200 font-JakartaSemiBold">
                      +10k
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Quick amount buttons */}
                <View className="mt-4">
                  <Text className="mb-2 text-sm text-gray-700 font-JakartaSemiBold">
                    {t("payment.quickAmount")}:
                  </Text>
                  <View className="flex flex-row flex-wrap gap-2">
                    {[
                      amount,
                      (parseFloat(amount) * 1.1).toFixed(0),
                      (parseFloat(amount) * 1.2).toFixed(0),
                    ].map((quickAmount) => (
                      <TouchableOpacity
                        key={quickAmount}
                        onPress={() => onCashAmountChange(quickAmount)}
                        className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-300"
                      >
                        <Text className="text-sm text-gray-700 font-JakartaSemiBold">
                          {Number(quickAmount).toLocaleString("vi-VN")} VNĐ
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {parseFloat(changeAmount) > 0 && (
                  <View className="p-4 mt-4 bg-green-50 rounded-lg border border-green-200">
                    <Text className="text-center text-green-700 font-JakartaSemiBold">
                      {t("payment.change")}:{" "}
                      {Number(changeAmount).toLocaleString("vi-VN")} VNĐ
                    </Text>
                  </View>
                )}

                {parseFloat(paymentAmount) < parseFloat(amount) && (
                  <View className="p-4 mt-4 bg-red-50 rounded-lg border border-red-200">
                    <Text className="text-center text-red-700 font-JakartaSemiBold">
                      {t("payment.missing")}:{" "}
                      {Number(
                        (
                          parseFloat(amount) - parseFloat(paymentAmount)
                        ).toFixed(0)
                      ).toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex flex-row gap-x-4 w-full">
                <CustomButton
                  title={t("common.back")}
                  className="flex-1 bg-gray-200"
                  onPress={onBackToStep1}
                />
                <CustomButton
                  title={t("common.confirm")}
                  className="flex-1"
                  onPress={onCashPayment}
                  disabled={parseFloat(paymentAmount) < parseFloat(amount)}
                />
              </View>
            </>
          )}

          {cashStep === 3 && (
            <>
              <View className="flex justify-center items-center mb-4 w-16 h-16 bg-green-100 rounded-full">
                <Text className="text-3xl">⏳</Text>
              </View>
              <Text className="mb-2 text-xl text-center font-JakartaBold">
                {t("payment.processingPayment")}
              </Text>
              <Text className="mb-4 text-center text-gray-600 font-JakartaRegular">
                {t("payment.pleaseWait")}
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
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CashPaymentModal;
