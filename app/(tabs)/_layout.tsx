import { Tabs } from "expo-router";
import { useColorScheme, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TAB_ROUTES } from "../../constants/routes";
import colors from "tailwindcss/colors";
import { createRef } from "react";
import type { FlatList } from "react-native";

// Type definition for scroll references for each tab
type ScrollRefs = {
	[key: string]: React.RefObject<FlatList>;
};

// Initialize scroll references for each tab
export const tabScrollRefs: ScrollRefs = {};

for (const route of TAB_ROUTES) {
	tabScrollRefs[route.name] = createRef<FlatList>();
}

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const router = useRouter();

	// Function to handle tab press and scroll to top if already active
	const handleTabPress = (name: string, isActive: boolean) => {
		if (isActive) {
			const scrollRef = tabScrollRefs[name];
			if (scrollRef.current) {
				scrollRef.current.scrollToOffset({ offset: 0, animated: true });
			}
		}
	};

	return (
		<Tabs
			initialRouteName="news"
			screenOptions={{
				headerStyle: {
					backgroundColor: isDark ? colors.zinc[900] : colors.white,
				},
				headerTitleStyle: {
					color: isDark ? colors.white : colors.zinc[800],
				},
				headerTitleAlign: "left", // Align header title to the left
				headerRight: () => (
					<Pressable onPress={() => router.push("/search")} className="pr-4">
						<Feather
							name="search"
							size={24}
							color={isDark ? colors.white : colors.zinc[800]}
						/>
					</Pressable>
				),
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
						tabBarButton: (props) => (
							<Pressable
								{...props}
								onPress={(e) => {
									props.onPress?.(e);
									handleTabPress(
										route.name,
										props.accessibilityState?.selected ?? false,
									);
								}}
							/>
						),
					}}
				/>
			))}
		</Tabs>
	);
}
