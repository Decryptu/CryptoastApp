// types/animation.ts
import type { PanGesture } from "react-native-gesture-handler";
import type { AnimatedStyle } from "react-native-reanimated";
import type { ViewStyle } from "react-native";

export type ReanimatedStyle = AnimatedStyle<ViewStyle>;
export type GestureType = PanGesture;
