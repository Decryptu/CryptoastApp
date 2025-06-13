// app/(tabs)/home.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { SafeAreaView, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CategoryTabs } from '../../components/CategoryTabs';
import { CategoryCarousel } from '../../components/CategoryCarousel';
import { ArticleListScreen } from '../../components/ArticleListScreen';
import { fetchNews, fetchGuides, fetchSheets, fetchReports } from '../../services/api';
import { HOME_SECTIONS } from '../../constants/routes';
import type { ContentSection } from '../../services/api';

// Map section names to their fetch functions and content sections
const SECTION_CONFIG = {
  news: { fetchFn: fetchNews, section: 'NEWS' as ContentSection, logLabel: 'news' },
  guides: { fetchFn: fetchGuides, section: 'GUIDES' as ContentSection, logLabel: 'guides' },
  sheets: { fetchFn: fetchSheets, section: 'SHEETS' as ContentSection, logLabel: 'sheets' },
  reports: { fetchFn: fetchReports, section: 'REPORTS' as ContentSection, logLabel: 'reports' },
} as const;

const SectionPage = React.memo<{
  sectionName: string;
}>(({ sectionName }) => {
  const config = SECTION_CONFIG[sectionName as keyof typeof SECTION_CONFIG];
  
  if (!config) {
    console.warn(`No config found for section: ${sectionName}`);
    return <View className="flex-1" />;
  }

  return (
    <ArticleListScreen
      fetchArticles={config.fetchFn}
      logLabel={config.logLabel}
      section={config.section}
    />
  );
});

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Convert HOME_SECTIONS to the format expected by CategoryTabs
  const sectionCategories = useMemo(() => 
    HOME_SECTIONS.map(section => ({
      id: HOME_SECTIONS.findIndex(s => s.name === section.name),
      name: section.title,
    })),
    []
  );

  const selectedSectionId = useMemo(() => 
    currentIndex, 
    [currentIndex]
  );

  const handleSelectSection = useCallback((sectionId: number | null) => {
    const newIndex = sectionId ?? 0;
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex]);

  const renderSectionPage = useCallback((sectionId: number | null, index: number) => {
    const sectionIndex = sectionId ?? index;
    const section = HOME_SECTIONS[sectionIndex];
    
    if (!section) {
      console.warn(`No section found for index: ${sectionIndex}`);
      return <View className="flex-1" />;
    }

    return (
      <SectionPage
        key={`section-${section.name}`}
        sectionName={section.name}
      />
    );
  }, []);

  // Convert sections to categories format for the carousel
  const sectionsAsCategories = useMemo(() => 
    HOME_SECTIONS.map((section, index) => ({
      id: index,
      name: section.title,
    })),
    []
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View className="flex-1">
          <CategoryTabs
            selectedCategory={selectedSectionId}
            onSelectCategory={handleSelectSection}
            categories={sectionCategories}
          />
          
          <CategoryCarousel
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            categories={sectionsAsCategories}
            renderCategoryPage={renderSectionPage}
            section="HOME"
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}