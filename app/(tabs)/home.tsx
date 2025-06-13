// app/(tabs)/home.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { SafeAreaView, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CategoryTabs } from '../../components/CategoryTabs';
import { CategoryCarousel } from '../../components/CategoryCarousel';
import { ArticleList } from '../../components/ArticleList';
import { useArticles } from '../../hooks/useArticles';
import { fetchAll, fetchNews, fetchGuides, fetchSheets, fetchReports } from '../../services/api';

// Simple section configuration
const SECTIONS = [
  { id: 0, name: 'Tout', fetchFn: fetchAll },
  { id: 1, name: 'Actualités', fetchFn: fetchNews },
  { id: 2, name: 'Formations', fetchFn: fetchGuides },
  { id: 3, name: 'Analyses', fetchFn: fetchSheets },
  { id: 4, name: 'Dossiers', fetchFn: fetchReports },
] as const;

const SectionPage = React.memo<{
  sectionIndex: number;
}>(({ sectionIndex }) => {
  const section = SECTIONS[sectionIndex];
  
  const { articles, loading, refreshing, loadingMore, loadMoreArticles, handleRefresh } = 
    useArticles({ 
      fetchArticles: section.fetchFn, 
      logLabel: section.name.toLowerCase(), 
      selectedCategory: null 
    });
  
  return (
    <View className="flex-1">
      <ArticleList
        articles={articles}
        loading={loading}
        refreshing={refreshing}
        loadingMore={loadingMore}
        section={section.name}
        onRefresh={handleRefresh}
        onLoadMore={loadMoreArticles}
        panGesture={null}
        animatedStyle={{}}
      />
    </View>
  );
});

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Convert sections to category format for tabs
  const sectionCategories = useMemo(() => 
    SECTIONS.map(section => ({
      id: section.id,
      name: section.name,
    })),
    []
  );

  const handleSelectSection = useCallback((sectionId: number | null) => {
    const newIndex = sectionId ?? 0;
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex]);

  const renderSectionPage = useCallback((categoryId: number | null, index: number) => {
    const sectionIndex = categoryId ?? index;
    
    return (
      <SectionPage
        key={`section-${sectionIndex}`}
        sectionIndex={sectionIndex}
      />
    );
  }, []);

  // Categories for carousel (same as sections)
  const carouselCategories = useMemo(() => 
    SECTIONS.map(section => ({
      id: section.id,
      name: section.name,
    })),
    []
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View className="flex-1">
          <CategoryTabs
            selectedCategory={currentIndex}
            onSelectCategory={handleSelectSection}
            categories={sectionCategories}
          />
          
          <CategoryCarousel
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            categories={carouselCategories}
            renderCategoryPage={renderSectionPage}
            section="HOME"
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}