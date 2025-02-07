import React from "react";
import { View } from "react-native";

export const ArticleContentSkeleton = () => {
	return (
		<View className="p-4 animate-pulse">
			{/* Title placeholder */}
			<View className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded mb-2 w-4/5" />

			{/* Author and Date placeholders */}
			<View className="flex-row space-x-4 mb-4">
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
			</View>
			{/* Excerpt placeholder */}
			<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded mb-4 w-3/4" />

			{/* Thumbnail placeholder */}
			<View className="w-full h-48 bg-zinc-200 dark:bg-zinc-700 rounded mb-4" />

			{/* Article content placeholder */}
			<View className="space-y-3 mb-4">
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-11/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-10/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-9/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-8/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-7/12" />
			</View>
			{/* Article content placeholder */}
			<View className="space-y-3 mb-4">
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-11/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-10/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-9/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-8/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-7/12" />
			</View>
			{/* Article content placeholder */}
			<View className="space-y-3 mb-4">
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-11/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-10/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-9/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-8/12" />
				<View className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-7/12" />
			</View>
		</View>
	);
};
