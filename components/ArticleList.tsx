// components/ArticleList.tsx
import React, { useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArticleCard } from './ArticleCard';
import { ArticleSkeleton } from './ArticleSkeleton';
import type { Article } from '../types/article';
import colors from 'tailwindcss/colors';

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  section: string;
  onRefresh: () => void;
  onLoadMore: () => void;
}

const SKELETON_COUNT = 10;

export function ArticleList({
  articles,
  loading,
  refreshing,
  loadingMore,
  onRefresh,
  onLoadMore,
}: ArticleListProps) {
  const listRef = useRef<FlatList>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const numColumns = isTablet ? 2 : 1;

  const handleArticlePress = useCallback((article: Article) => {
    router.push({
      pathname: '/article/[id]',
      params: { id: article.id.toString() },
    });
  }, [router]);

  const renderItem = useCallback(({ item, index }: { item: Article; index: number }) => (
    <View className={`${isTablet ? 'w-1/2 p-2' : 'w-full'} ${index === 0 ? 'mt-4' : ''}`}>
      <ArticleCard article={item} onPress={() => handleArticlePress(item)} />
    </View>
  ), [handleArticlePress, isTablet]);

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

  const renderSkeletons = useCallback(() => (
    <View className={`flex-row flex-wrap ${isTablet ? 'px-2' : 'px-0 pt-4'}`}>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => {
        const skeletonKey = `skeleton-${Date.now()}-${i}`;
        return (
          <View
            key={skeletonKey}
            className={`${isTablet ? 'w-1/2 p-2' : 'w-full px-4 py-0'}`}
          >
            <ArticleSkeleton />
          </View>
        );
      })}
    </View>
  ), [isTablet]);

  const flatListContent = (
    <FlatList
      ref={listRef}
      data={articles}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      numColumns={numColumns}
      key={`list-${numColumns}`}
      contentContainerClassName={isTablet ? 'px-2' : 'px-4'}
      columnWrapperClassName={isTablet ? 'justify-between' : undefined}
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
      removeClippedSubviews
    />
  );

  return loading ? renderSkeletons() : flatListContent;
}