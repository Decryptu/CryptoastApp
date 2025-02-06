import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
	FlatList,
	RefreshControl,
	SafeAreaView,
	useColorScheme,
	View,
	ActivityIndicator,
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
import colors from "tailwindcss/colors";

interface CategoryTab {
	id: number;
	name: string;
}

const SWIPE_THRESHOLD = 100;
const ITEMS_PER_PAGE = 10;

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
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMoreArticles, setHasMoreArticles] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
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
		async (page: number, forceRefresh = false) => {
			const cacheKey = `${logLabel}-${selectedCategory || "all"}-page-${page}`;
			console.log(
				`🔍 Loading page ${page} of articles for category: ${
					selectedCategory || "all"
				}`,
			);

			if (!forceRefresh) {
				const cachedArticles = await getArticlesCache(cacheKey);
				if (cachedArticles) {
					console.log(`📦 Using cached articles for ${cacheKey}`);
					return cachedArticles;
				}
			}

			console.log(`🔄 Fetching fresh articles for ${cacheKey}`);
			const data = await fetchArticles(
				page,
				ITEMS_PER_PAGE,
				selectedCategory || undefined,
			);
			console.log(`✅ Fetched ${data.length} ${logLabel} for page ${page}`);

			if (data.length < ITEMS_PER_PAGE) {
				setHasMoreArticles(false);
			}

			await setArticlesCache(cacheKey, data);
			return data;
		},
		[fetchArticles, logLabel, selectedCategory],
	);

	const loadArticles = useCallback(
		async (forceRefresh = false) => {
			try {
				setLoading(true);
				const data = await fetchArticlesData(1, forceRefresh);
				setArticles(data);
				setCurrentPage(1);
				setHasMoreArticles(data.length === ITEMS_PER_PAGE);
			} catch (error) {
				console.error(`❌ Failed to load ${logLabel}:`, error);
			} finally {
				setLoading(false);
			}
		},
		[fetchArticlesData, logLabel],
	);

	const loadMoreArticles = useCallback(async () => {
		if (loadingMore || !hasMoreArticles) return;

		try {
			setLoadingMore(true);
			console.log(`📥 Loading more articles (page ${currentPage + 1})`);

			const newArticles = await fetchArticlesData(currentPage + 1);

			setArticles((prev) => [...prev, ...newArticles]);
			setCurrentPage((prev) => prev + 1);

			if (newArticles.length < ITEMS_PER_PAGE) {
				setHasMoreArticles(false);
				console.log("📪 No more articles to load");
			}
		} catch (error) {
			console.error("❌ Failed to load more articles:", error);
		} finally {
			setLoadingMore(false);
		}
	}, [currentPage, fetchArticlesData, hasMoreArticles, loadingMore]);

	const handleArticlePress = useCallback(
		(article: Article) => {
			router.push({
				pathname: "/article/[id]",
				params: { id: article.id },
			});
		},
		[router],
	);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		setHasMoreArticles(true);
		await loadArticles(true);
		setRefreshing(false);
	}, [loadArticles]);

	useEffect(() => {
		void loadArticles();
	}, [loadArticles]);

	const renderFooter = useCallback(() => {
		if (!loadingMore) return null;

		return (
			<View className="py-4 flex-row justify-center">
				<ActivityIndicator
					size="large"
					color={isDark ? colors.white : colors.black}
				/>
			</View>
		);
	}, [loadingMore, isDark]);

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

	const renderContent = useCallback(
		() => (
			<GestureDetector gesture={panGesture}>
				<Animated.View style={animatedStyle} className="flex-1">
					<FlatList
						ref={tabScrollRefs[section.toLowerCase()]}
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
								tintColor={isDark ? colors.white : colors.black}
							/>
						}
						onEndReached={loadMoreArticles}
						onEndReachedThreshold={0.5}
						ListFooterComponent={renderFooter}
					/>
				</Animated.View>
			</GestureDetector>
		),
		[
			animatedStyle,
			articles,
			handleArticlePress,
			handleRefresh,
			isDark,
			loadMoreArticles,
			panGesture,
			refreshing,
			renderFooter,
			section,
		],
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
