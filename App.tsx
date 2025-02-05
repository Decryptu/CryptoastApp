import "./global.css";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SplashScreen, Stack } from "expo-router";
import { NavigationContainer } from "@react-navigation/native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();

	useEffect(() => {
		// Hide splash screen once the app is ready
		SplashScreen.hideAsync();
	}, []);

	return (
		<NavigationContainer>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</NavigationContainer>
	);
}
