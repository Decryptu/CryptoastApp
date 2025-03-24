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
import Animated from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { ArticleCard } from "./ArticleCard";
import { ArticleSkeleton } from "./ArticleSkeleton";
import { ScrollEvents } from "../utils/events";
import type { Article } from "../types/article";
import type { GestureType } from "../types/animation";
import colors from "tailwindcss/colors";

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  section: string;
  onRefresh: () => void;
  onLoadMore: () => void;
  panGesture: GestureType | null;
  animatedStyle: any;
}

const NUM_SKELETONS = 10;

const SKELETON_IDS = {
  MAIN: Array.from({ length: NUM_SKELETONS }, (_, i) => `skeleton-main-${i}`),
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

  // Extract tab name from section for scroll events registration
  // Format of section is typically "TABNAME-category" (e.g., "NEWS-all", "NEWS-5")
  const tabName = section.split('-')[0].toLowerCase();
  const registrationKey = section.toLowerCase();

  // Register scroll ref when component mounts
  useEffect(() => {
    // Register with the full key including category
    ScrollEvents.register(registrationKey, listRef);
    
    console.log(`📱 ArticleList: Registered ${registrationKey} with ScrollEvents`);
    
    return () => {
      ScrollEvents.unregister(registrationKey);
      console.log(`📱 ArticleList: Unregistered ${registrationKey} from ScrollEvents`);
    };
  }, [registrationKey]);

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

  // The main content component
  const content = (
    <FlatList
      ref={listRef}
      data={articles}
      keyExtractor={(item) => `${section}-${item.id.toString()}`}
      renderItem={renderItem}
      numColumns={numColumns}
      key={`list-${section}-${numColumns}`}
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
      removeClippedSubviews={true}
    />
  );

  // Conditionally wrap with gesture detector if needed
  const renderContent = panGesture ? (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle} className="flex-1">
        {content}
      </Animated.View>
    </GestureDetector>
  ) : (
    <View style={{ flex: 1, width: '100%' }}>
      {content}
    </View>
  );

  return loading ? renderSkeletons : renderContent;
}