import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import colors from "tailwindcss/colors";
import "../global.css";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: isDark ? colors.zinc[900] : colors.white,
				},
			}}
		>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen
				name="article/[id]"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
