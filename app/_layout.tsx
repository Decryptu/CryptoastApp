import { Stack } from "expo-router";
import { useColorScheme, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import colors from "tailwindcss/colors";
import "../global.css";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const router = useRouter();

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: isDark ? colors.zinc[900] : colors.white,
				},
				headerTitleStyle: {
					color: isDark ? colors.white : colors.zinc[800],
					fontSize: 18,
					fontWeight: "500",
				},
				headerTitleAlign: "left",
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
				// Clean up header appearance
				headerShadowVisible: false,
				// Customize back button
				headerBackTitle: "Retour",
				headerTintColor: colors.amber[500], // Using Tailwind amber color
			}}
		>
			{/* Main tab navigation */}
			<Stack.Screen
				name="(tabs)"
				options={{
					headerShown: Platform.OS === "android", // This will be true on Android and false on iOS
				}}
			/>

			{/* Modal screens */}
			<Stack.Screen
				name="search"
				options={{
					headerShown: false,
					presentation: "modal",
				}}
			/>

			{/* Article screen */}
			<Stack.Screen
				name="article/[id]"
				options={{
					headerTitle: "",
					presentation: "card",
					headerBackTitle: "Retour",
					headerTintColor: colors.amber[500], // Using Tailwind amber color
				}}
			/>
		</Stack>
	);
}
