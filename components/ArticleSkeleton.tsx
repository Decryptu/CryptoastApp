import { View } from "react-native";

export const ArticleSkeleton = () => {
	return (
		<View className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 overflow-hidden animate-pulse">
			{/* Image placeholder */}
			<View className="w-full h-48 bg-gray-200 dark:bg-gray-700" />

			<View className="p-4">
				{/* Title placeholder */}
				<View className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />

				{/* Content placeholder */}
				<View className="space-y-2">
					<View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
					<View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
					<View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
				</View>

				{/* Footer placeholder */}
				<View className="flex-row justify-between items-center mt-4">
					<View className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
					<View className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
				</View>
			</View>
		</View>
	);
};
