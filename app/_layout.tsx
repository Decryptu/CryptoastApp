import { Stack } from "expo-router";
import { useColorScheme, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import colors from "tailwindcss/colors";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import "../global.css";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const router = useRouter();

	const commonHeaderOptions: NativeStackNavigationOptions = {
		headerStyle: {
			backgroundColor: isDark ? colors.zinc[900] : colors.white,
		},
		headerTitleStyle: {
			color: isDark ? colors.white : colors.zinc[800],
			fontSize: 18,
			fontWeight: "500",
		},
		headerTitleAlign: Platform.OS === "android" ? "center" : "left",
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
		headerBackTitle: Platform.OS === "ios" ? "Retour" : undefined,
		headerTintColor: colors.amber[500],
	};

	return (
		<Stack
			screenOptions={{
				...commonHeaderOptions,
				headerShown: true,
			}}
		>
			<Stack.Screen
				name="(tabs)"
				options={{
					headerShown: false,
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
				options={{
					...commonHeaderOptions,
					headerTitle: "",
					presentation: "card",
					headerShown: true,
					headerBackVisible: true,
				}}
			/>
		</Stack>
	);
}
