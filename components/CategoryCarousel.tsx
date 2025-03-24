import type React from "react";
import { useEffect, useMemo } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { ContentSection } from "../services/api";

interface CategoryCarouselProps {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  categories: { id: number | null, name: string }[];
  renderCategoryPage: (categoryId: number | null, index: number) => React.ReactNode;
  section: ContentSection;
}

const { width } = Dimensions.get("window");
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
};

// Minimum distance to consider a gesture a swipe rather than a tap
const MIN_SWIPE_DISTANCE = 10;

// How many pages to render on each side of the current page
// 1 means render the current page plus one on each side (3 total)
const RENDER_WINDOW = 1;

export function CategoryCarousel({
  currentIndex,
  setCurrentIndex,
  categories,
  renderCategoryPage,
  section
}: CategoryCarouselProps) {
  // Add "All" category at the beginning
  const allCategories = [{ id: null, name: "All" }, ...categories];
  
  // Animation values
  const translateX = useSharedValue(-currentIndex * width);
  const currentIndexSV = useSharedValue(currentIndex);
  
  // Track whether a significant horizontal swipe has occurred
  const hasSwipedHorizontally = useSharedValue(false);
  
  // Update translateX when currentIndex changes externally (e.g., from tab press)
  useEffect(() => {
    if (currentIndexSV.value !== currentIndex) {
      translateX.value = withSpring(-currentIndex * width, SPRING_CONFIG);
      currentIndexSV.value = currentIndex;
      console.log(`🔄 Carousel animated to index: ${currentIndex}`);
    }
  }, [currentIndex, translateX, currentIndexSV]);
  
  // Create gestures using useMemo to improve performance
  const gestures = useMemo(() => {
    // Pan gesture for horizontal swiping
    const panGesture = Gesture.Pan()
      // Configure for horizontal movement detection
      .activeOffsetX([-MIN_SWIPE_DISTANCE, MIN_SWIPE_DISTANCE])
      .failOffsetY([-20, 20]) // Fail if more vertical than horizontal
      .onBegin(() => {
        console.log('🟢 Pan gesture began');
        hasSwipedHorizontally.value = false;
      })
      .onUpdate((e) => {
        // Track whether significant horizontal movement has occurred
        if (Math.abs(e.translationX) > MIN_SWIPE_DISTANCE) {
          hasSwipedHorizontally.value = true;
        }
        
        // Calculate new position based on current index
        const newTranslateX = -currentIndexSV.value * width + e.translationX;
        
        // Add resistance when swiping beyond the edge
        if (newTranslateX > 0) {
          translateX.value = Math.min(width * 0.3, newTranslateX * 0.3);
        } else if (newTranslateX < -(allCategories.length - 1) * width) {
          const overscroll = Math.abs(newTranslateX + (allCategories.length - 1) * width);
          translateX.value = -((allCategories.length - 1) * width) - Math.min(width * 0.3, overscroll * 0.3);
        } else {
          translateX.value = newTranslateX;
        }
      })
      .onEnd((e) => {
        console.log(`🔴 Pan gesture ended, horizontal swipe: ${hasSwipedHorizontally.value}`);
        
        // Calculate nearest page based on velocity and current position
        const currentOffset = -currentIndexSV.value * width;
        let newIndex = currentIndexSV.value;
        
        if (Math.abs(e.velocityX) > 500) {
          if (e.velocityX > 0) {
            // Swiping right
            newIndex = Math.max(currentIndexSV.value - 1, 0);
          } else {
            // Swiping left
            newIndex = Math.min(currentIndexSV.value + 1, allCategories.length - 1);
          }
        } else {
          // Based on position
          const dragDistance = translateX.value - currentOffset;
          if (dragDistance > width * 0.35) {
            newIndex = Math.max(currentIndexSV.value - 1, 0);
          } else if (dragDistance < -width * 0.35) {
            newIndex = Math.min(currentIndexSV.value + 1, allCategories.length - 1);
          }
        }
        
        // If the index changed, update the state
        if (newIndex !== currentIndexSV.value) {
          runOnJS(setCurrentIndex)(newIndex);
        }
        
        // Always animate to the nearest page
        translateX.value = withSpring(-newIndex * width, SPRING_CONFIG);
        currentIndexSV.value = newIndex;
      });
    
    // Native gesture to intercept touch events
    const nativeGesture = Gesture.Native()
      .onTouchesDown((_e, _manager) => {
        console.log('👇 Touch down detected');
        hasSwipedHorizontally.value = false;
      })
      .onTouchesUp((_e, manager) => {
        console.log(`👆 Touch up detected, horizontal swipe: ${hasSwipedHorizontally.value}`);
        
        // If we've detected significant horizontal movement, 
        // fail the native gesture to prevent tap events
        if (hasSwipedHorizontally.value) {
          console.log('⛔ Preventing tap event after horizontal swipe');
          manager.fail();
        }
      });
    
    // Compose gestures: Pan takes priority, then native gesture
    return Gesture.Exclusive(
      panGesture,
      nativeGesture
    );
  }, [allCategories.length, currentIndexSV, hasSwipedHorizontally, translateX, setCurrentIndex]);
  
  // Create the animated style for the container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Calculate which pages should be rendered based on the current index
  // This is the key optimization - only render pages that are visible or about to become visible
  const visibleIndices = useMemo(() => {
    const minIndex = Math.max(0, currentIndex - RENDER_WINDOW);
    const maxIndex = Math.min(allCategories.length - 1, currentIndex + RENDER_WINDOW);
    
    console.log(`🎯 Rendering pages from index ${minIndex} to ${maxIndex}`);
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
            animatedStyle
          ]}
        >
          {allCategories.map((category, index) => (
            <View 
              key={`category-${category.id || 'all'}-${section}`}
              style={{ width, height: '100%' }}
            >
              {/* Only render the page if it's in the visible indices array */}
              {visibleIndices.includes(index) ? (
                renderCategoryPage(category.id, index)
              ) : (
                // Render an empty placeholder for non-visible pages
                <View style={{ flex: 1 }} />
              )}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}