import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Feather } from "@expo/vector-icons";
import { TAB_ROUTES } from "../../constants/routes";
import colors from "tailwindcss/colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? colors.zinc[900] : colors.white,
        },
        headerTitleStyle: {
          color: isDark ? colors.white : colors.zinc[800],
        },
        tabBarStyle: {
          backgroundColor: isDark ? colors.zinc[900] : colors.white,
          borderTopColor: isDark ? colors.zinc[700] : colors.zinc[200],
        },
        tabBarActiveTintColor: "#EDA73B",
        tabBarInactiveTintColor: isDark ? colors.zinc[400] : colors.zinc[500],
      }}
    >
      {TAB_ROUTES.map((route) => (
        <Tabs.Screen
          key={route.name}
          name={route.name}
          options={{
            title: route.title,
            tabBarIcon: ({ color, size }) => (
              <Feather name={route.iconName} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}