import { Tabs } from "expo-router";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";
import { useMemo, useRef, useState } from "react";

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["12%"], []);

  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}>
        <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            handleIndicatorStyle={{ backgroundColor: "#6B7280", width: 40 }}
            backgroundStyle={{ backgroundColor: "#1F2937", borderRadius: 30 }}
            enableOverDrag={false}
            enableHandlePanningGesture={false}
            enableContentPanningGesture={false}
        >
            <BottomSheetView style={{ 
                flex: 1, 
                flexDirection: 'row', 
                justifyContent: 'space-around', 
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingBottom: 10
            }}>
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const icon = route.name === 'home' ? icons.home : icons.list;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            className={`flex flex-row items-center justify-center rounded-full px-4 py-2 ${isFocused ? 'bg-primary-500' : ''}`}
                        >
                            <Image 
                                source={icon} 
                                tintColor="white" 
                                className="w-6 h-6"
                                resizeMode="contain"
                            />
                            {isFocused && (
                                <Text className="text-white ml-2 font-JakartaBold">
                                    {options.title}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </BottomSheetView>
        </BottomSheet>
    </View>
  );
};

const Layout = () => {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Lịch sử",
        }}
      />
    </Tabs>
  );
};

export default Layout;
