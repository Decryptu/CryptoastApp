// components/ArticleListScreen.tsx
import React from 'react';
import { SafeAreaView, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ArticleList } from './ArticleList';
import { useArticles } from '../hooks/useArticles';
import type { Article } from '../types/article';
import type { ContentSection } from '../services/api';

interface Props {
  fetchArticles: (page?: number, perPage?: number) => Promise<Article[]>;
  logLabel: string;
  section: ContentSection;
}

export function ArticleListScreen({ fetchArticles, logLabel, section }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { articles, loading, refreshing, loadingMore, loadMoreArticles, handleRefresh } = 
    useArticles({ fetchArticles, logLabel, selectedCategory: null });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View className="flex-1">
          <ArticleList
            articles={articles}
            loading={loading}
            refreshing={refreshing}
            loadingMore={loadingMore}
            section={section}
            onRefresh={handleRefresh}
            onLoadMore={loadMoreArticles}
            panGesture={null}
            animatedStyle={{}}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}