import { Tabs } from "expo-router";
import { useColorScheme, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TAB_ROUTES } from "../../constants/routes";
import colors from "tailwindcss/colors";
import { ScrollEvents } from "../../utils/events";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const router = useRouter();

	const handleTabPress = (name: string, isActive: boolean) => {
		if (isActive) {
			ScrollEvents.scrollToTop(name.toLowerCase());
		}
	};

	return (
		<Tabs
			screenOptions={{
				headerStyle: {
					backgroundColor: isDark ? colors.zinc[900] : colors.white,
				},
				headerTitleStyle: {
					color: isDark ? colors.white : colors.zinc[800],
					fontSize: 18,
					fontWeight: "500",
				},
				headerTitleAlign: Platform.OS === "android" ? "center" : "left",
				headerShown: true,
				headerRight: () => (
					<Pressable
						onPress={() => router.push("/search")}
						className="pr-4"
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Feather
							name="search"
							size={24}
							color={isDark ? colors.white : colors.zinc[800]}
						/>
					</Pressable>
				),
				headerShadowVisible: false,
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
