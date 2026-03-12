import CustomButton from "@/components/Common/CustomButton";
import { images } from "@/constants";
import React from "react";
import { useTranslation } from "react-i18next";
import { Animated, Image, Modal, Text } from "react-native";
interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onGoHome: () => void;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  onGoHome,
  fadeAnim,
  scaleAnim,
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
          className="flex flex-col justify-center items-center p-7 mx-4 w-11/12 bg-white rounded-2xl"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Image source={images.check} className="mt-4 w-28 h-28" />

          <Text className="mt-4 text-2xl text-center font-JakartaBold">
            {t("booking.rideBooked")}
          </Text>

          <Text className="mt-4 text-center text-md text-general-200 font-JakartaRegular">
            {t("booking.rideBookedDescription")}
          </Text>

          <CustomButton
            title={t("booking.viewMyRides")}
            onPress={onGoHome}
            className="mt-4"
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default SuccessModal;
