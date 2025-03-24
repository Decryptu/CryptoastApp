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
import { Gesture, GestureDetector, State } from "react-native-gesture-handler";
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
  
  // Create a tap gesture that we'll configure specially to avoid conflict with pan
  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      // This tap gesture does nothing on its own - it's just here so we can
      // properly manage the gesture relationships
      console.log('Tap gesture recognized but doing nothing');
    });
  
  // Handle swipe gesture
  const panGesture = Gesture.Pan()
    // Configure the pan gesture to explicitly require horizontal movement
    .activeOffsetX([-MIN_SWIPE_DISTANCE, MIN_SWIPE_DISTANCE]) 
    .failOffsetY([-20, 20]) // Fail if significantly more vertical than horizontal
    .onBegin(() => {
      // Reset the horizontal swipe tracker on new gesture
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
    })
    // This is the critical part: make the pan gesture block the tap gesture
    // This means the tap gesture won't activate after a pan gesture completes
    .blocksExternalGesture(tapGesture);
    
  // Now create a special native gesture that we'll use to both:
  // 1. Capture tap events to prevent underlying article taps after swipes
  // 2. Allow normal article tap behavior for regular taps
  const nativeGesture = Gesture.Native()
    .onTouchesDown((_e, manager) => {
      // Reset our horizontal swipe tracker on touch down
      hasSwipedHorizontally.value = false;
    })
    .onTouchesUp((_e, manager) => {
      // If a significant horizontal swipe has occurred, cancel the native gesture
      // This prevents the tap from being detected after a swipe
      if (hasSwipedHorizontally.value) {
        manager.fail();
        return;
      }
      // Otherwise, let the underlying tap work normally
    });
    
  // Combine the gestures with Exclusive to ensure proper priority
  // Pan has highest priority, followed by native (for article taps)
  const combinedGesture = Gesture.Exclusive(
    panGesture,
    Gesture.Simultaneous(tapGesture, nativeGesture)
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