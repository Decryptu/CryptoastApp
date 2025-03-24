import React, { useState, useCallback, useMemo } from "react";
import { SafeAreaView, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CategoryTabs } from "./CategoryTabs";
import { ArticleList } from "./ArticleList";
import { CategoryCarousel } from "./CategoryCarousel";
import { useArticles } from "../hooks/useArticles";
import { useCategories } from "../hooks/useCategories";
import type { Article } from "../types/article";
import type { ContentSection } from "../services/api";

type Props = {
  fetchArticles: (
    page?: number,
    perPage?: number,
    categoryId?: number,
  ) => Promise<Article[]>;
  logLabel: string;
  section: ContentSection;
};

// Memoized CategoryPage component to prevent unnecessary re-renders
const CategoryPage = React.memo(
  ({
    fetchArticles,
    categoryId,
    logLabel,
    section,
  }: {
    fetchArticles: (page?: number, perPage?: number, categoryId?: number) => Promise<Article[]>;
    categoryId: number | null;
    logLabel: string;
    section: ContentSection;
  }) => {
    // Use the existing hook for article loading
    const {
      articles,
      loading,
      refreshing,
      loadingMore,
      loadMoreArticles,
      handleRefresh,
    } = useArticles({
      fetchArticles,
      logLabel,
      selectedCategory: categoryId,
    });
    
    console.log(`📊 Rendering category ${categoryId || "all"} with ${articles.length} articles`);
    
    return (
      <View style={{ flex: 1, width: '100%' }}>
        <ArticleList
          articles={articles}
          loading={loading}
          refreshing={refreshing}
          loadingMore={loadingMore}
          section={`${section}-${categoryId || "all"}`}
          onRefresh={handleRefresh}
          onLoadMore={loadMoreArticles}
          panGesture={null} // We're handling gestures at the carousel level
          animatedStyle={{}}
        />
      </View>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if the categoryId or section changes
    // fetchArticles and logLabel depend on these, so no need to check them separately
    return prevProps.categoryId === nextProps.categoryId && 
           prevProps.section === nextProps.section;
  }
);

export function ArticleListScreen({ fetchArticles, logLabel, section }: Props) {
  // Current category index (0 = All, 1+ = specific categories)
  const [currentIndex, setCurrentIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { sectionCategories } = useCategories(section, null);

  // Function to get category ID from index
  const getCategoryIdFromIndex = useCallback((index: number): number | null => {
    if (index === 0) return null; // All categories
    return sectionCategories[index - 1]?.id || null;
  }, [sectionCategories]);

  // The currently selected category ID
  const selectedCategory = useMemo(() => 
    getCategoryIdFromIndex(currentIndex), 
    [getCategoryIdFromIndex, currentIndex]
  );

  // Handle category selection from tabs
  const handleSelectCategory = useCallback((categoryId: number | null) => {
    const newIndex = categoryId === null 
      ? 0 
      : sectionCategories.findIndex(cat => cat.id === categoryId) + 1;
    
    if (newIndex !== -1) {
      console.log(`🔄 Selecting category: ${categoryId || "all"} (index: ${newIndex})`);
      setCurrentIndex(newIndex);
    }
  }, [sectionCategories]);

  // Render a single category page - memoized to prevent recreation on every render
  const renderCategoryPage = useCallback((categoryId: number | null, index: number) => {
    return (
      <CategoryPage 
        key={`page-${categoryId || 'all'}-${section}`}
        fetchArticles={fetchArticles}
        categoryId={categoryId}
        logLabel={`${logLabel}-${categoryId || 'all'}`}
        section={section}
      />
    );
  }, [fetchArticles, logLabel, section]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
        <StatusBar style={isDark ? "light" : "dark"} />
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