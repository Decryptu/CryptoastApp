import { useNavigation, usePathname } from "expo-router";
import { HeaderBackButton } from "@react-navigation/elements";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { getRouteTitle } from "../constants/routes";
import type { NavigationState, ParamListBase } from "@react-navigation/native";
import colors from "tailwindcss/colors";

export function ArticleHeader() {
	const navigation = useNavigation();
	const pathname = usePathname();
	const insets = useSafeAreaInsets();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	const getBackTitle = () => {
		const state = navigation.getState();
		if (!state) return getRouteTitle("index");

		const tabRoute = state.routes.find((route) => route.name === "(tabs)");
		if (!tabRoute?.state) return getRouteTitle("index");

		const tabState = tabRoute.state as NavigationState<ParamListBase>;
		if (!tabState?.index || !tabState?.routes?.[tabState.index]?.name) {
			return getRouteTitle("index");
		}

		const activeRouteName = tabState.routes[tabState.index].name;
		return getRouteTitle(activeRouteName);
	};

	return (
		<View
			className="bg-white dark:bg-zinc-900"
			style={{
				paddingTop: insets.top,
			}}
		>
			<HeaderBackButton
				onPress={() => navigation.goBack()}
				tintColor={isDark ? colors.white : colors.black}
				label={getBackTitle()}
				style={{
					marginLeft: 8,
				}}
			/>
		</View>
	);
}
