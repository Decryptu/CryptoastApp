import React, { useCallback, useRef, useEffect } from "react";
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
import { ScrollEvents } from "../utils/events";
import type { Article } from "../types/article";
import type { ReanimatedStyle, GestureType } from "../types/animation";
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

const NUM_SKELETONS = 10;

const SKELETON_IDS = {
	MAIN: Array.from({ length: NUM_SKELETONS }, (_, i) => `skeleton-main-${i}`),
	LEFT: Array.from({ length: NUM_SKELETONS }, (_, i) => `skeleton-left-${i}`),
	RIGHT: Array.from({ length: NUM_SKELETONS }, (_, i) => `skeleton-right-${i}`),
} as const;

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
	const listRef = useRef<FlatList>(null);
	const router = useRouter();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const { width } = useWindowDimensions();

	const isTablet = width >= 768;
	const numColumns = isTablet ? 2 : 1;

	// Register scroll ref when component mounts
	useEffect(() => {
		ScrollEvents.register(section.toLowerCase(), listRef);
		return () => {
			ScrollEvents.unregister(section.toLowerCase());
		};
	}, [section]);

	const handleArticlePress = useCallback(
		(article: Article) => {
			router.push({
				pathname: "/article/[id]",
				params: { id: article.id },
			});
		},
		[router],
	);

	const renderItem = useCallback(
		(props: { item: Article; index: number }) => (
			<View
				className={`${isTablet ? "w-1/2 p-2" : "w-full"}
        ${props.index === 0 ? "mt-4" : ""}`}
			>
				<ArticleCard
					article={props.item}
					onPress={() => handleArticlePress(props.item)}
				/>
			</View>
		),
		[handleArticlePress, isTablet],
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

	const renderSkeletonSet = useCallback(
		(skeletonIds: readonly string[]) => (
			<View className={`flex-row flex-wrap ${isTablet ? "px-2" : "px-0 pt-4"}`}>
				{skeletonIds.map((skeletonId) => (
					<View
						key={skeletonId}
						className={`${isTablet ? "w-1/2 p-2" : "w-full px-4 py-0"}`}
					>
						<ArticleSkeleton />
					</View>
				))}
			</View>
		),
		[isTablet],
	);

	const renderSkeletons = renderSkeletonSet(SKELETON_IDS.MAIN);

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
				<Animated.View style={leftSkeletonStyle}>
					{renderSkeletonSet(SKELETON_IDS.LEFT)}
				</Animated.View>

				<FlatList
					ref={listRef}
					data={articles}
					keyExtractor={(item) => item.id.toString()}
					renderItem={renderItem}
					numColumns={numColumns}
					key={`list-${numColumns}`}
					contentContainerClassName={`${isTablet ? "px-2" : "px-4"}`}
					columnWrapperClassName={isTablet ? "justify-between" : undefined}
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

				<Animated.View style={rightSkeletonStyle}>
					{renderSkeletonSet(SKELETON_IDS.RIGHT)}
				</Animated.View>
			</Animated.View>
		</GestureDetector>
	);

	return loading ? renderSkeletons : renderContent;
}
