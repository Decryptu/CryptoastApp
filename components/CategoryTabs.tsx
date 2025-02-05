import React from "react";
import { ScrollView, Text, Pressable, View } from "react-native";

interface CategoryTab {
	id: number;
	name: string;
}

interface CategoryTabsProps {
	selectedCategory: number | null;
	onSelectCategory: (categoryId: number | null) => void;
	categories: CategoryTab[];
}

export const CategoryTabs = React.memo(function CategoryTabs({
	selectedCategory,
	onSelectCategory,
	categories,
}: CategoryTabsProps) {
	return (
		<View className="border-b border-zinc-200 dark:border-zinc-700">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="px-4"
				contentContainerStyle={{ height: 40 }}
			>
				{/* All Categories Tab */}
				<View className="mr-4 h-full justify-center">
					<Pressable
						onPress={() => onSelectCategory(null)}
						className="h-full justify-center px-2"
					>
						<Text
							className={`${
								selectedCategory === null
									? "text-primary-600"
									: "text-zinc-500 dark:text-zinc-400"
							}`}
						>
							Tout
						</Text>
						{/* Active Indicator */}
						<View
							className={`absolute bottom-0 left-0 right-0 h-0.5 ${
								selectedCategory === null ? "bg-primary-600" : "bg-transparent"
							}`}
						/>
					</Pressable>
				</View>

				{/* Category Tabs */}
				{categories.map((category) => (
					<View key={category.id} className="mr-4 h-full justify-center">
						<Pressable
							onPress={() => onSelectCategory(category.id)}
							className="h-full justify-center px-2"
						>
							<Text
								className={`${
									selectedCategory === category.id
										? "text-primary-600"
										: "text-zinc-500 dark:text-zinc-400"
								}`}
								numberOfLines={1}
							>
								{category.name.replace(/^Actualité\s|^Guide\s/, "")}
							</Text>
							{/* Active Indicator */}
							<View
								className={`absolute bottom-0 left-0 right-0 h-0.5 ${
									selectedCategory === category.id
										? "bg-primary-600"
										: "bg-transparent"
								}`}
							/>
						</Pressable>
					</View>
				))}
			</ScrollView>
		</View>
	);
});
