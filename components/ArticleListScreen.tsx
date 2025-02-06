import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
	FlatList,
	RefreshControl,
	SafeAreaView,
	useColorScheme,
	View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Animated, {
	useAnimatedStyle,
	withSpring,
	runOnJS,
	useSharedValue,
} from "react-native-reanimated";
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import { CategoryTabs } from "./CategoryTabs";
import { ArticleCard } from "./ArticleCard";
import { ArticleSkeleton } from "./ArticleSkeleton";
import { getArticlesCache, setArticlesCache } from "../services/ArticleCache";
import { categories, CATEGORY_MAPPINGS } from "../data/categories";
import type { Article } from "../types/article";
import type { ContentSection } from "../services/api";
import type { Category } from "../data/categories";
import { tabScrollRefs } from "../app/(tabs)/_layout";

interface CategoryTab {
	id: number;
	name: string;
}

const SWIPE_THRESHOLD = 100;

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
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

	const translateX = useSharedValue(0);
	const router = useRouter();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	const sectionCategories = useMemo(() => {
		if (section === "SHEETS") return [] as CategoryTab[];

		const sectionIds: number[] = [...CATEGORY_MAPPINGS[section]];

		return categories
			.flatMap((cat: Category) => cat.children || [])
			.filter((cat: Category) => sectionIds.includes(cat.id))
			.map((cat: Category) => ({
				id: cat.id,
				name: cat.name,
			})) as CategoryTab[];
	}, [section]);

	const currentCategoryIndex = useMemo(() => {
		if (!selectedCategory) return -1;
		return sectionCategories.findIndex(
			(cat: CategoryTab) => cat.id === selectedCategory,
		);
	}, [selectedCategory, sectionCategories]);

	const handleCategoryChange = useCallback(
		(direction: "next" | "prev") => {
			if (sectionCategories.length === 0) return;

			let newIndex = currentCategoryIndex;
			if (
				direction === "next" &&
				currentCategoryIndex < sectionCategories.length - 1
			) {
				newIndex += 1;
			} else if (direction === "prev" && currentCategoryIndex > -1) {
				newIndex -= 1;
			}

			const newCategory =
				newIndex === -1 ? null : sectionCategories[newIndex].id;
			if (newCategory !== selectedCategory) {
				console.log(`🔄 Switching to category: ${newCategory || "all"}`);
				setSelectedCategory(newCategory);
			}
		},
		[currentCategoryIndex, sectionCategories, selectedCategory],
	);

	const panGesture = useMemo(
		() =>
			Gesture.Pan()
				.onChange((event) => {
					translateX.value += event.changeX;
				})
				.onFinalize((event) => {
					if (Math.abs(event.velocityX) >= SWIPE_THRESHOLD) {
						if (event.velocityX > 0) {
							runOnJS(handleCategoryChange)("prev");
						} else {
							runOnJS(handleCategoryChange)("next");
						}
					}
					translateX.value = withSpring(0);
				}),
		[handleCategoryChange, translateX],
	);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	const fetchArticlesData = useCallback(
		async (forceRefresh: boolean) => {
			const cacheKey = `${logLabel}-${selectedCategory || "all"}`;
			console.log(
				`🔍 Loading articles for category: ${selectedCategory || "all"}`,
			);

			if (!forceRefresh) {
				const cachedArticles = await getArticlesCache(cacheKey);
				if (cachedArticles) {
					console.log(`📦 Using cached articles for ${cacheKey}`);
					return cachedArticles;
				}
			}

			console.log(`🔄 Fetching fresh articles for ${cacheKey}`);
			const data = await fetchArticles(1, 10, selectedCategory || undefined);
			console.log(`✅ Fetched ${data.length} ${logLabel}`);
			await setArticlesCache(cacheKey, data);
			return data;
		},
		[fetchArticles, logLabel, selectedCategory],
	);

	const loadArticles = useCallback(
		async (forceRefresh = false) => {
			try {
				const data = await fetchArticlesData(forceRefresh);
				setArticles(data);
			} catch (error) {
				console.error(`❌ Failed to load ${logLabel}:`, error);
			} finally {
				setLoading(false);
			}
		},
		[fetchArticlesData, logLabel],
	);

	useEffect(() => {
		setLoading(true);
		void loadArticles();
	}, [loadArticles]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadArticles(true);
		setRefreshing(false);
	}, [loadArticles]);

	const handleArticlePress = useCallback(
		(article: Article) => {
			router.push({
				pathname: "/article/[id]",
				params: { id: article.id },
			});
		},
		[router],
	);

	const renderCategoryTabs = useMemo(() => {
		if (sectionCategories.length === 0) return null;

		return (
			<CategoryTabs
				selectedCategory={selectedCategory}
				onSelectCategory={setSelectedCategory}
				categories={sectionCategories}
			/>
		);
	}, [sectionCategories, selectedCategory]);

	const renderSkeletons = useMemo(
		() => (
			<FlatList
				data={[1, 2, 3]}
				keyExtractor={(item) => item.toString()}
				renderItem={() => <ArticleSkeleton />}
				contentContainerClassName="p-4"
			/>
		),
		[],
	);

	const renderContent = () => (
		<GestureDetector gesture={panGesture}>
			<Animated.View style={animatedStyle} className="flex-1">
				<FlatList
					ref={tabScrollRefs[section.toLowerCase()]} // Add this line
					data={articles}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<ArticleCard
							article={item}
							onPress={() => handleArticlePress(item)}
						/>
					)}
					contentContainerClassName="p-4"
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							tintColor={isDark ? "#fff" : "#000"}
						/>
					}
				/>
			</Animated.View>
		</GestureDetector>
	);

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
					{loading ? renderSkeletons : renderContent()}
				</View>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
}
