import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import "../global.css";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
				},
			}}
		>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen
				name="article/[id]"
				options={{
					headerShown: true,
					headerTitle: "",
					headerTransparent: true,
					headerTintColor: "#000",
				}}
			/>
		</Stack>
	);
}
