// components/CategoryCarousel.tsx
import type React from 'react';
import { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { ContentSection } from '../services/api';

interface CategoryCarouselProps {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  categories: { id: number | null; name: string }[];
  renderCategoryPage: (categoryId: number | null, index: number) => React.ReactNode;
  section: ContentSection;
}

const { width } = Dimensions.get('window');

export function CategoryCarousel({
  currentIndex,
  setCurrentIndex,
  categories,
  renderCategoryPage,
}: CategoryCarouselProps) {
  const translateX = useSharedValue(-currentIndex * width);
  const startTranslateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(-currentIndex * width);
  }, [currentIndex, translateX]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startTranslateX.value = translateX.value;
    })
    .onUpdate((e) => {
      translateX.value = startTranslateX.value + e.translationX;
    })
    .onEnd((e) => {
      const threshold = width * 0.3;
      let newIndex = currentIndex;

      if (e.translationX > threshold && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (e.translationX < -threshold && currentIndex < categories.length - 1) {
        newIndex = currentIndex + 1;
      }

      translateX.value = withSpring(-newIndex * width);

      if (newIndex !== currentIndex) {
        runOnJS(setCurrentIndex)(newIndex);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="flex-1">
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              width: width * categories.length,
              height: '100%',
            },
            animatedStyle,
          ]}
        >
          {categories.map((category, index) => (
            <View key={`${category.name}-${index}`} style={{ width, height: '100%' }}>
              {renderCategoryPage(category.id, index)}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}