import { icons } from "@/constants";
import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabIcon = ({source, focused} : 
    {source: ImageSourcePropType; 
    focused: boolean
} ) => (
    <View className= {`flex flex-row items-center justify-center rounded-full ${focused ? 'bg-general-300' : ''}`}>
        <View className={`rounded-full w-10 h-10 items-center justify-center ${focused ? 'bg-general-400' : ''}`}>
            <Image source={source} tintColor="white" resizeMode="contain" className="w-8 h-8"/>
        </View>
    </View>
)

const Layout = () => {
    const insets = useSafeAreaInsets();
    
    return (
    <Tabs screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: {
            backgroundColor: "#333333",
            borderRadius: 50,
            paddingBottom: 0, // Reset padding as we'll use margin and height
            overflow: "hidden",
            marginHorizontal: 20,
            marginBottom: insets.bottom > 0 ? insets.bottom + 10 : 20,
            height: 70,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            position: "absolute",
        }
    }}>
    <Tabs.Screen
        name="home"  
        options={{    
        title: "Trang chủ",
        headerShown: false, 
        tabBarIcon: ({focused}) => <TabIcon focused={focused} source={icons.home} />
        }} 
        />
    <Tabs.Screen
        name="rides"  
        options={{    
        title: "Chuyến đi",
        headerShown: false, 
        tabBarIcon: ({focused}) => <TabIcon focused={focused} source={icons.list} />
        }} 
        />
    <Tabs.Screen
        name="chat"  
        options={{    
        title: "Chat",
        headerShown: false, 
        tabBarIcon: ({focused}) => <TabIcon focused={focused} source={icons.chat} />
        }} 
        />
    <Tabs.Screen
        name="profile"  
        options={{    
        title: "Cá nhân",
        headerShown: false, 
        tabBarIcon: ({focused}) => <TabIcon focused={focused} source={icons.profile} />
        }} 
        />
    </Tabs>
    );
};

export default Layout;