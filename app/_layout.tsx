import { Stack } from "expo-router";
import { useColorScheme, Platform } from "react-native";
import colors from "tailwindcss/colors";
import "../global.css";
import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

interface ArticleScreenParams {
	id: string;
	presentedFromSearch?: string;
}

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const router = useRouter();

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: isDark ? colors.zinc[900] : colors.white,
				},
			}}
		>
			<Stack.Screen
				name="(tabs)"
				options={{
					headerShown: Platform.select({
						android: true,
						ios: false,
					}),
					headerTitle: "",
				}}
			/>

			<Stack.Screen
				name="search"
				options={{
					headerShown: false,
					presentation:
						Platform.OS === "ios" && Platform.isPad
							? "fullScreenModal"
							: "modal",
				}}
			/>

			<Stack.Screen
				name="article/[id]"
				options={({ route }): NativeStackNavigationOptions => {
					const { presentedFromSearch } = route.params as ArticleScreenParams;
					const isFromSearch = presentedFromSearch === "true";

					const presentation: NativeStackNavigationOptions["presentation"] =
						isFromSearch && Platform.OS === "ios" && Platform.isPad
							? "fullScreenModal"
							: isFromSearch
								? "modal"
								: "card";

					return {
						title: "",
						headerShown:
							Platform.OS === "ios" && Platform.isPad && isFromSearch,
						presentation,
						headerLeft: () =>
							Platform.OS === "ios" && Platform.isPad ? (
								<Pressable
									onPress={() => router.back()}
									className="flex-row items-center px-3"
								>
									<Ionicons
										name="arrow-back"
										size={20}
										color={colors.zinc[600]}
									/>
									<Text className="ml-2 text-zinc-600">Retour</Text>
								</Pressable>
							) : null,
					};
				}}
			/>
		</Stack>
	);
}
