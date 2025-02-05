import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Feather } from "@expo/vector-icons";
import { TAB_ROUTES } from "../../constants/routes";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<Tabs
			screenOptions={{
				tabBarStyle: {
					backgroundColor: isDark ? "#000" : "#fff",
					borderTopColor: isDark ? "#333" : "#e5e5e5",
				},
				tabBarActiveTintColor: "#2563eb",
				tabBarInactiveTintColor: isDark ? "#888" : "#666",
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
