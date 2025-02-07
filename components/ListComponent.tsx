// components/ListComponent.tsx
import React from "react";
import { View, Text } from "react-native";

interface ListComponentProps {
	html: string;
	ordered?: boolean;
}

const ListComponent: React.FC<ListComponentProps> = ({
	html,
	ordered = false,
}) => {
	// Clean up the HTML and split into list items
	const items = html
		.replace(/<\/?[uo]l[^>]*>/g, "") // Remove ul/ol tags
		.split("</li>")
		.map((item) => item.replace(/<li[^>]*>/g, "").trim()) // Remove li tags
		.filter((item) => item.length > 0);

	// Process bold text within items
	const processListItem = (text: string) => {
		const parts = text.split(/(<strong>.*?<\/strong>)/g);
		return parts.map((part, index) => {
			if (part.startsWith("<strong>")) {
				return (
					<Text key={index} className="font-bold">
						{part.replace(/<\/?strong>/g, "")}
					</Text>
				);
			}
			return <Text key={index}>{part}</Text>;
		});
	};

	return (
		<View className="mb-4 ml-4">
			{items.map((item, index) => (
				<View key={index} className="flex-row mb-2">
					<Text className="mr-2 text-lg text-zinc-800 dark:text-zinc-200">
						{ordered ? `${index + 1}.` : "•"}
					</Text>
					<View className="flex-1">
						<Text className="text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed">
							{processListItem(item)}
						</Text>
					</View>
				</View>
			))}
		</View>
	);
};

export default ListComponent;
