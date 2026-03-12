import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface PaymentMethodSelectionProps {
  selectedPaymentMethod: string;
  onPaymentMethodSelect: (methodId: string) => void;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  selectedPaymentMethod,
  onPaymentMethodSelect,
}) => {
  const { t } = useTranslation();

  const paymentMethods = React.useMemo(
    () => [
      { id: "card", name: t("payment.creditCard"), icon: "💳" },
      { id: "cash", name: t("payment.cash"), icon: "💵" },
      { id: "qr", name: t("payment.qrCode"), icon: "📱" },
    ],
    [t]
  );

  return (
    <View className="mt-4">
      <Text className="mb-4 text-lg font-JakartaSemiBold">
        {t("payment.selectPaymentMethod")}
      </Text>

      <View className="flex flex-row flex-wrap justify-between">
        {paymentMethods.map((method) => {
          const isSelected = selectedPaymentMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              onPress={() => onPaymentMethodSelect(method.id)}
              className={`flex flex-row items-center justify-center p-4 mb-4 rounded-lg border-2 w-[48%] ${
                isSelected
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
              activeOpacity={0.7}
            >
              <Text className="mr-2 text-2xl">{method.icon}</Text>
              <Text className="flex-1 text-base text-center font-JakartaRegular">
                {method.name}
              </Text>

              <View
                className={`absolute top-2 right-2 justify-center items-center w-5 h-5 bg-green-500 !rounded-full ${
                  isSelected ? "opacity-100" : "opacity-0"
                }`}
              >
                {isSelected && (
                  <Text className="text-sm font-bold text-neutral-200">✓</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PaymentMethodSelection;
