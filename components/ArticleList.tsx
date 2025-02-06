import React, { useCallback } from "react";
import {
	View,
	FlatList,
	RefreshControl,
	ActivityIndicator,
	useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { ArticleCard } from "./ArticleCard";
import { ArticleSkeleton } from "./ArticleSkeleton";
import type { Article } from "../types/article";
import type { ReanimatedStyle, GestureType } from "../types/animation";
import { tabScrollRefs } from "../app/(tabs)/_layout";
import colors from "tailwindcss/colors";

interface ArticleListProps {
	articles: Article[];
	loading: boolean;
	refreshing: boolean;
	loadingMore: boolean;
	section: string;
	onRefresh: () => void;
	onLoadMore: () => void;
	panGesture: GestureType;
	animatedStyle: ReanimatedStyle;
}

export function ArticleList({
	articles,
	loading,
	refreshing,
	loadingMore,
	section,
	onRefresh,
	onLoadMore,
	panGesture,
	animatedStyle,
}: ArticleListProps) {
	const router = useRouter();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	const handleArticlePress = useCallback(
		(article: Article) => {
			router.push({
				pathname: "/article/[id]",
				params: { id: article.id },
			});
		},
		[router],
	);

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

	const renderSkeletons = (
		<FlatList
			data={[1, 2, 3]}
			keyExtractor={(item) => item.toString()}
			renderItem={() => <ArticleSkeleton />}
			contentContainerClassName="p-4"
		/>
	);

	const renderContent = (
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
							onRefresh={onRefresh}
							tintColor={isDark ? colors.white : colors.black}
						/>
					}
					onEndReached={onLoadMore}
					onEndReachedThreshold={0.5}
					ListFooterComponent={renderFooter}
				/>
			</Animated.View>
		</GestureDetector>
	);

	return loading ? renderSkeletons : renderContent;
}
