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
					// Set background color based on theme
					backgroundColor: isDark ? colors.zinc[900] : colors.white,
				},
			}}
		>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />

			{/* Added search screen with modal presentation */}
			<Stack.Screen
				name="search"
				options={{
					headerShown: false,
					presentation: "modal", // Present the search screen as a modal
				}}
			/>

			<Stack.Screen
				name="article/[id]"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
