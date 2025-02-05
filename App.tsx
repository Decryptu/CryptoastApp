import "./global.css";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SplashScreen, Stack } from "expo-router";
import { NavigationContainer } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();

	useEffect(() => {
		// For debugging
		console.log("Current color scheme:", colorScheme);
		SplashScreen.hideAsync();
	}, [colorScheme]);

	return (
		<NavigationContainer>
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: {
						backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
					},
				}}
			>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</NavigationContainer>
	);
}
