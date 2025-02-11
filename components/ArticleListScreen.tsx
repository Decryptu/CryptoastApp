import React, { useState, useMemo } from "react";
import { SafeAreaView, useColorScheme, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
	useAnimatedStyle,
	withSpring,
	runOnJS,
	useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import { CategoryTabs } from "./CategoryTabs";
import { ArticleList } from "./ArticleList";
import { useArticles } from "../hooks/useArticles";
import { useCategories } from "../hooks/useCategories";
import type { Article } from "../types/article";
import type { ContentSection } from "../services/api";

type Props = {
	fetchArticles: (
		page?: number,
		perPage?: number,
		categoryId?: number,
	) => Promise<Article[]>;
	logLabel: string;
	section: ContentSection;
};

export function ArticleListScreen({ fetchArticles, logLabel, section }: Props) {
	const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
	const translateX = useSharedValue(0);
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	const { sectionCategories, handleCategoryChange, SWIPE_THRESHOLD } =
		useCategories(section, selectedCategory);

	const {
		articles,
		loading,
		refreshing,
		loadingMore,
		loadMoreArticles,
		handleRefresh,
	} = useArticles({
		fetchArticles,
		logLabel,
		selectedCategory,
	});

	const panGesture = useMemo(
		() =>
			Gesture.Pan()
				.activeOffsetX([-20, 20]) // Only activate after 20px horizontal movement
				.failOffsetY([-20, 20]) // Fail gesture if vertical movement exceeds 20px
				.onChange((event) => {
					translateX.value += event.changeX;
				})
				.onFinalize((event) => {
					if (Math.abs(event.velocityX) >= SWIPE_THRESHOLD) {
						if (event.velocityX > 0) {
							runOnJS(handleCategoryChange)("prev", setSelectedCategory);
						} else {
							runOnJS(handleCategoryChange)("next", setSelectedCategory);
						}
					}
					translateX.value = withSpring(0);
				}),
		[handleCategoryChange, translateX, SWIPE_THRESHOLD],
	);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
				<StatusBar style={isDark ? "light" : "dark"} />
				<View className="flex-1">
					{sectionCategories.length > 0 && (
						<CategoryTabs
							selectedCategory={selectedCategory}
							onSelectCategory={setSelectedCategory}
							categories={sectionCategories}
						/>
					)}
					<ArticleList
						articles={articles}
						loading={loading}
						refreshing={refreshing}
						loadingMore={loadingMore}
						section={section}
						onRefresh={handleRefresh}
						onLoadMore={loadMoreArticles}
						panGesture={panGesture}
						animatedStyle={animatedStyle}
					/>
				</View>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
}
