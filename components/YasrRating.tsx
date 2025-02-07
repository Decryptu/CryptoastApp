// components/YasrRating.tsx
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useMemo } from "react";

interface YasrRatingProps {
	rating: number;
	starSize?: number;
	label?: string;
	showRatingText?: boolean;
}

export const YasrRating: React.FC<YasrRatingProps> = ({
	rating,
	starSize = 32,
	label = "Notre note",
	showRatingText = false,
}) => {
	// Convert rating to number and ensure it's between 0 and 5
	const numericRating = useMemo(
		() => Math.min(Math.max(Number.parseFloat(rating.toString()), 0), 5),
		[rating],
	);

	// Calculate full and partial stars
	const { fullStars, hasHalfStar, emptyStars } = useMemo(
		() => ({
			fullStars: Math.floor(numericRating),
			hasHalfStar: numericRating % 1 >= 0.5,
			emptyStars:
				5 - Math.floor(numericRating) - (numericRating % 1 >= 0.5 ? 1 : 0),
		}),
		[numericRating],
	);

	// Generate unique keys for stars
	const starKeys = useMemo(
		() => Array.from({ length: 5 }, (_, i) => `star-${Math.random()}-${i}`),
		[],
	);

	return (
		<View className="items-center my-4">
			<Text className="text-zinc-800 dark:text-zinc-200 mb-2 text-base">
				{label}
			</Text>
			<View className="flex-row">
				{/* Full stars */}
				{Array.from({ length: fullStars }).map((_, i) => (
					<FontAwesome
						key={starKeys[i]}
						name="star"
						size={starSize}
						color="#FFD700"
					/>
				))}

				{/* Half star */}
				{hasHalfStar && (
					<FontAwesome name="star-half-o" size={starSize} color="#FFD700" />
				)}

				{/* Empty stars */}
				{Array.from({ length: emptyStars }).map((_, i) => (
					<FontAwesome
						key={starKeys[fullStars + (hasHalfStar ? 1 : 0) + i]}
						name="star-o"
						size={starSize}
						color="#FFD700"
					/>
				))}
			</View>
			{showRatingText && (
				<Text className="text-zinc-800 dark:text-zinc-200 mt-2 text-lg font-bold">
					{numericRating.toFixed(1).replace(".", ",")}/5
				</Text>
			)}
		</View>
	);
};

export default YasrRating;
