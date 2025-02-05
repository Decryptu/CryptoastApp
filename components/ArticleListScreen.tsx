import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
	FlatList,
	RefreshControl,
	SafeAreaView,
	useColorScheme,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { CategoryTabs } from "./CategoryTabs";
import { ArticleCard } from "./ArticleCard";
import { ArticleSkeleton } from "./ArticleSkeleton";
import { getArticlesCache, setArticlesCache } from "../services/ArticleCache";
import { categories } from "../data/categories";
import { CATEGORY_MAPPINGS } from "../data/categories";
import type { Article } from "../types/article";
import type { ContentSection } from "../services/api";
import type { Category } from "../data/categories";

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

	const router = useRouter();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	const sectionCategories = useMemo(() => {
		if (section === "SHEETS") return [];

		const sectionIds: number[] = [...CATEGORY_MAPPINGS[section]];

		return categories
			.flatMap((cat: Category) => cat.children || [])
			.filter((cat: Category) => sectionIds.includes(cat.id))
			.map((cat: Category) => ({
				id: cat.id,
				name: cat.name,
			}));
	}, [section]);

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
			<>
				{renderCategoryTabs}
				<FlatList
					data={[1, 2, 3]}
					keyExtractor={(item) => item.toString()}
					renderItem={() => <ArticleSkeleton />}
					contentContainerClassName="p-4"
				/>
			</>
		),
		[renderCategoryTabs],
	);

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
				<StatusBar style={isDark ? "light" : "dark"} />
				{renderSkeletons}
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
			<StatusBar style={isDark ? "light" : "dark"} />
			{renderCategoryTabs}
			<FlatList
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
		</SafeAreaView>
	);
}
