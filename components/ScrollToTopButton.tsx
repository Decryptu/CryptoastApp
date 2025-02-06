import type React from "react";
import { TouchableOpacity, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ScrollToTopButtonProps {
	visible: Animated.AnimatedValue;
	onPress: () => void;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
	visible,
	onPress,
}) => {
	return (
		<Animated.View
			style={{
				position: "absolute",
				bottom: 20,
				right: 20,
				opacity: visible,
				transform: [
					{
						scale: visible.interpolate({
							inputRange: [0, 1],
							outputRange: [0.8, 1],
						}),
					},
				],
			}}
		>
			<TouchableOpacity
				onPress={onPress}
				className="w-10 h-10 rounded-full bg-zinc-500 items-center justify-center shadow-lg"
			>
				<Feather name="arrow-up" size={24} color="white" />
			</TouchableOpacity>
		</Animated.View>
	);
};
