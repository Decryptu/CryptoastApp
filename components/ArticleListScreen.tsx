// components/ArticleListScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { SafeAreaView, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CategoryTabs } from './CategoryTabs';
import { ArticleList } from './ArticleList';
import { CategoryCarousel } from './CategoryCarousel';
import { useArticles } from '../hooks/useArticles';
import { useCategories } from '../hooks/useCategories';
import type { Article } from '../types/article';
import type { ContentSection } from '../services/api';

interface Props {
  fetchArticles: (page?: number, perPage?: number, categoryId?: number) => Promise<Article[]>;
  logLabel: string;
  section: ContentSection;
}

const CategoryPage = React.memo<{
  fetchArticles: Props['fetchArticles'];
  categoryId: number | null;
  logLabel: string;
  section: ContentSection;
}>(({ fetchArticles, categoryId, logLabel, section }) => {
  const { articles, loading, refreshing, loadingMore, loadMoreArticles, handleRefresh } = 
    useArticles({ fetchArticles, logLabel, selectedCategory: categoryId });
  
  const sectionIdentifier = `${section}-${categoryId ?? 'all'}`;
  
  return (
    <View className="flex-1">
      <ArticleList
        articles={articles}
        loading={loading}
        refreshing={refreshing}
        loadingMore={loadingMore}
        section={sectionIdentifier}
        onRefresh={handleRefresh}
        onLoadMore={loadMoreArticles}
        panGesture={null}
        animatedStyle={{}}
      />
    </View>
  );
});

export function ArticleListScreen({ fetchArticles, logLabel, section }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { sectionCategories } = useCategories(section);

  const getCategoryFromIndex = useCallback((index: number): number | null => 
    index === 0 ? null : sectionCategories[index - 1]?.id ?? null,
    [sectionCategories]
  );

  const selectedCategory = useMemo(() => 
    getCategoryFromIndex(currentIndex), 
    [getCategoryFromIndex, currentIndex]
  );

  const handleSelectCategory = useCallback((categoryId: number | null) => {
    const newIndex = categoryId === null ? 0 : 
      sectionCategories.findIndex(cat => cat.id === categoryId) + 1;
    
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
    }
  }, [sectionCategories]);

  const renderCategoryPage = useCallback((categoryId: number | null) => (
    <CategoryPage
      key={`${section}-${categoryId ?? 'all'}`}
      fetchArticles={fetchArticles}
      categoryId={categoryId}
      logLabel={`${logLabel}-${categoryId ?? 'all'}`}
      section={section}
    />
  ), [fetchArticles, logLabel, section]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View className="flex-1">
          {sectionCategories.length > 0 && (
            <CategoryTabs
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              categories={sectionCategories}
            />
          )}
          
          <CategoryCarousel
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            categories={sectionCategories}
            renderCategoryPage={renderCategoryPage}
            section={section}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}