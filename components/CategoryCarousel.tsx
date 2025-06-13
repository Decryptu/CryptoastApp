// components/CategoryCarousel.tsx
import type React from 'react';
import { useEffect, useMemo } from 'react';
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
const SPRING_CONFIG = { damping: 20, stiffness: 200 };
const MIN_SWIPE_DISTANCE = 25; // Increased to avoid interference with vertical scrolling
const RENDER_WINDOW = 1;

export function CategoryCarousel({
  currentIndex,
  setCurrentIndex,
  categories,
  renderCategoryPage,
  section,
}: CategoryCarouselProps) {
  const allCategories = [{ id: null, name: 'All' }, ...categories];

  const translateX = useSharedValue(-currentIndex * width);
  const currentIndexSV = useSharedValue(currentIndex);
  const hasSwipedHorizontally = useSharedValue(false);

  useEffect(() => {
    if (currentIndexSV.value !== currentIndex) {
      translateX.value = withSpring(-currentIndex * width, SPRING_CONFIG);
      currentIndexSV.value = currentIndex;
    }
  }, [currentIndex, translateX, currentIndexSV]);

  const gestures = useMemo(() => {
    const panGesture = Gesture.Pan()
      // More restrictive horizontal detection to not interfere with vertical scrolling
      .activeOffsetX([-MIN_SWIPE_DISTANCE, MIN_SWIPE_DISTANCE])
      .failOffsetY([-30, 30]) // Fail more easily on vertical movement
      .onBegin(() => {
        hasSwipedHorizontally.value = false;
      })
      .onUpdate((e) => {
        // Only proceed if horizontal movement is dominant
        if (Math.abs(e.translationX) > Math.abs(e.translationY) && 
            Math.abs(e.translationX) > MIN_SWIPE_DISTANCE) {
          hasSwipedHorizontally.value = true;

          const newTranslateX = -currentIndexSV.value * width + e.translationX;

          if (newTranslateX > 0) {
            translateX.value = Math.min(width * 0.3, newTranslateX * 0.3);
          } else if (newTranslateX < -(allCategories.length - 1) * width) {
            const overscroll = Math.abs(newTranslateX + (allCategories.length - 1) * width);
            translateX.value =
              -((allCategories.length - 1) * width) - Math.min(width * 0.3, overscroll * 0.3);
          } else {
            translateX.value = newTranslateX;
          }
        }
      })
      .onEnd((e) => {
        // Only handle if we had significant horizontal movement
        if (!hasSwipedHorizontally.value) return;

        const currentOffset = -currentIndexSV.value * width;
        let newIndex = currentIndexSV.value;

        if (Math.abs(e.velocityX) > 500) {
          if (e.velocityX > 0) {
            newIndex = Math.max(currentIndexSV.value - 1, 0);
          } else {
            newIndex = Math.min(currentIndexSV.value + 1, allCategories.length - 1);
          }
        } else {
          const dragDistance = translateX.value - currentOffset;
          if (dragDistance > width * 0.35) {
            newIndex = Math.max(currentIndexSV.value - 1, 0);
          } else if (dragDistance < -width * 0.35) {
            newIndex = Math.min(currentIndexSV.value + 1, allCategories.length - 1);
          }
        }

        if (newIndex !== currentIndexSV.value) {
          runOnJS(setCurrentIndex)(newIndex);
        }

        translateX.value = withSpring(-newIndex * width, SPRING_CONFIG);
        currentIndexSV.value = newIndex;
      });

    // Simplified simultaneous gesture to allow both horizontal and vertical scrolling
    return panGesture;
  }, [allCategories.length, currentIndexSV, hasSwipedHorizontally, translateX, setCurrentIndex]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const visibleIndices = useMemo(() => {
    const minIndex = Math.max(0, currentIndex - RENDER_WINDOW);
    const maxIndex = Math.min(allCategories.length - 1, currentIndex + RENDER_WINDOW);
    return Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => minIndex + i);
  }, [currentIndex, allCategories.length]);

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <GestureDetector gesture={gestures}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              width: width * allCategories.length,
              height: '100%',
            },
            animatedStyle,
          ]}
        >
          {allCategories.map((category, index) => (
            <View
              key={`category-${category.id || 'all'}-${section}`}
              style={{ width, height: '100%' }}
            >
              {visibleIndices.includes(index) ? (
                renderCategoryPage(category.id, index)
              ) : (
                <View style={{ flex: 1 }} />
              )}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}