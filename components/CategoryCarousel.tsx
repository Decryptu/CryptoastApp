// components/CategoryCarousel.tsx
import type React from "react";
import { useEffect } from "react";
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
const MIN_SWIPE_DISTANCE = 5;

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
  
  // Track whether a swipe is in progress, including animation
  const isGestureActive = useSharedValue(false);
  
  // Update translateX when currentIndex changes externally (e.g., from tab press)
  useEffect(() => {
    if (currentIndexSV.value !== currentIndex) {
      translateX.value = withSpring(-currentIndex * width, SPRING_CONFIG);
      currentIndexSV.value = currentIndex;
      console.log(`🔄 Carousel animated to index: ${currentIndex}`);
    }
  }, [currentIndex, translateX, currentIndexSV]);
  
  // Handle swipe gesture
  const panGesture = Gesture.Pan()
    // Configure the pan gesture to explicitly require horizontal movement
    .activeOffsetX([-MIN_SWIPE_DISTANCE, MIN_SWIPE_DISTANCE]) 
    .failOffsetY([-25, 25]) // Fail if more vertical than horizontal
    .onBegin(() => {
      // Mark that a gesture has started
      isGestureActive.value = true;
    })
    .onUpdate((e) => {
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
      translateX.value = withSpring(-newIndex * width, SPRING_CONFIG, () => {
        // Called when animation completes
        isGestureActive.value = false;
      });
      
      currentIndexSV.value = newIndex;
    })
    .onFinalize(() => {
      // This will be called regardless of success/failure
      // We keep isGestureActive true until the animation completes
    });
  
  // Simple tap gesture that will block all touches during a swipe
  const blockTapsGesture = Gesture.Tap()
    .maxDuration(100000) // Long duration to catch all taps
    .onTouchesDown(() => {
      // If a swipe is in progress or animating, prevent all taps
      if (isGestureActive.value) {
        return false; // Block the gesture
      }
      return true; // Allow the gesture
    });
  
  // Combine gestures with Exclusive to ensure proper priority
  // Pan gesture gets priority, and we completely block taps during swipes
  const combinedGesture = Gesture.Exclusive(
    panGesture,
    blockTapsGesture
  );
  
  // Create the animated style for the container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  
  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <GestureDetector gesture={combinedGesture}>
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
              {renderCategoryPage(category.id, index)}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}