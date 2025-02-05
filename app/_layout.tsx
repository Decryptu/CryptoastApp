import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import "../global.css";
import { ArticleHeader } from "../components/ArticleHeader";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: isDark ? "#000" : "#fff",
				},
			}}
		>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen
				name="article/[id]"
				options={{
					header: () => <ArticleHeader />,
					headerTransparent: true,
					headerShown: true,
				}}
			/>
		</Stack>
	);
}
