import React, { useCallback } from "react";
import {
	View,
	FlatList,
	RefreshControl,
	ActivityIndicator,
	useColorScheme,
	useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
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

const NUM_SKELETONS = 3;

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
	const { width } = useWindowDimensions();

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
			data={Array(NUM_SKELETONS).fill(0)}
			keyExtractor={(_, index) => index.toString()}
			renderItem={() => <ArticleSkeleton />}
			contentContainerClassName="p-4"
		/>
	);

	// Side skeleton styles to position them absolutely
	const leftSkeletonStyle = useAnimatedStyle(() => ({
		position: "absolute",
		left: -width,
		width,
		height: "100%",
		opacity: 0.5,
	}));

	const rightSkeletonStyle = useAnimatedStyle(() => ({
		position: "absolute",
		right: -width,
		width,
		height: "100%",
		opacity: 0.5,
	}));

	const renderContent = (
		<GestureDetector gesture={panGesture}>
			<Animated.View style={animatedStyle} className="flex-1">
				{/* Left side skeletons */}
				<Animated.View style={leftSkeletonStyle}>
					<FlatList
						data={Array(NUM_SKELETONS).fill(0)}
						keyExtractor={(_, index) => `left-${index}`}
						renderItem={() => <ArticleSkeleton />}
						contentContainerClassName="p-4"
						scrollEnabled={false}
					/>
				</Animated.View>

				{/* Main content */}
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

				{/* Right side skeletons */}
				<Animated.View style={rightSkeletonStyle}>
					<FlatList
						data={Array(NUM_SKELETONS).fill(0)}
						keyExtractor={(_, index) => `right-${index}`}
						renderItem={() => <ArticleSkeleton />}
						contentContainerClassName="p-4"
						scrollEnabled={false}
					/>
				</Animated.View>
			</Animated.View>
		</GestureDetector>
	);

	return loading ? renderSkeletons : renderContent;
}
