import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { FlatList, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

interface FeatureItem {
  id: string;
  titleKey: string;
  descKey: string;
  icon: {
    name: string;
    size: number;
    color: string;
    library: "AntDesign" | "FontAwesome5" | "Ionicons";
  };
}

const renderIcon = (icon: FeatureItem["icon"]) => {
  const iconProps = {
    name: icon.name as any,
    size: icon.size,
    color: icon.color,
  };

  switch (icon.library) {
    case "AntDesign":
      return <AntDesign {...iconProps} />;
    case "FontAwesome5":
      return <FontAwesome5 {...iconProps} />;
    case "Ionicons":
      return <Ionicons {...iconProps} />;
    default:
      return <AntDesign {...iconProps} />;
  }
};

const FeatureItem = ({ item, t }: { item: FeatureItem; t: any }) => (
  <View className="p-4 mb-4 rounded-xl bg-white/20">
    <View className="flex-row items-center">
      <View className="justify-center items-center mr-4 w-12 h-12 rounded-full bg-white/20">
        {renderIcon(item.icon)}
      </View>
      <View className="flex-1 pl-3 border-l border-l-white/20">
        <Text className="text-lg text-neutral-200 font-JakartaBold">
          {t(item.titleKey)}
        </Text>
        <Text className="text-sm text-neutral-200/80">{t(item.descKey)}</Text>
      </View>
      <View
        className="w-12 h-12 bg-green-600 rounded-full"
        style={{
          transform: [{ translateX: 36 }],
        }}
      />
    </View>
  </View>
);

export default function Features() {
  const { t } = useTranslation();

  const featuresData: FeatureItem[] = [
    {
      id: "1",
      titleKey: "home.rateDriver",
      descKey: "home.rateDriverDesc",
      icon: {
        name: "star",
        size: 24,
        color: "white",
        library: "AntDesign",
      },
    },
    {
      id: "2",
      titleKey: "home.flexiblePayment",
      descKey: "home.flexiblePaymentDesc",
      icon: {
        name: "credit-card",
        size: 20,
        color: "white",
        library: "FontAwesome5",
      },
    },
    {
      id: "3",
      titleKey: "home.support247",
      descKey: "home.support247Desc",
      icon: {
        name: "headset",
        size: 24,
        color: "white",
        library: "Ionicons",
      },
    },
  ];

  const renderFeatureItem = ({ item }: { item: FeatureItem }) => (
    <FeatureItem item={item} t={t} />
  );

  return (
    <View>
      <Text className="mb-4 text-xl text-neutral-200 font-JakartaBold">
        {t("home.features")}
      </Text>
      <FlatList
        data={featuresData}
        renderItem={renderFeatureItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
