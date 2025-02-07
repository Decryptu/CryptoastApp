import type React from "react";
import { View, Text } from "react-native";

interface ListComponentProps {
	html: string;
	ordered?: boolean;
}

// Helper function to generate unique IDs
const generateUniqueId = (): string => {
	return Math.random().toString(36).substring(2, 11);
};

// Interface for processed text parts
interface ProcessedPart {
	id: string;
	text: string;
	isBold: boolean;
}

const ListComponent: React.FC<ListComponentProps> = ({
	html,
	ordered = false,
}) => {
	// Clean up the HTML and split into list items
	const items = html
		.replace(/<\/?[uo]l[^>]*>/g, "")
		.split("</li>")
		.map((item) => item.replace(/<li[^>]*>/g, "").trim())
		.filter((item) => item.length > 0);

	// Process bold text within items
	const processListItem = (text: string) => {
		const parts = text.split(/(<strong>.*?<\/strong>)/g);
		const processedParts: ProcessedPart[] = parts.map((part) => ({
			id: generateUniqueId(),
			text: part.startsWith("<strong>")
				? part.replace(/<\/?strong>/g, "")
				: part,
			isBold: part.startsWith("<strong>"),
		}));

		return processedParts.map((part) => (
			<Text key={part.id} className={part.isBold ? "font-bold" : undefined}>
				{part.text}
			</Text>
		));
	};

	return (
		<View className="mb-4 ml-4">
			{items.map((item) => {
				const itemId = generateUniqueId();
				const itemNumber = items.indexOf(item) + 1;

				return (
					<View key={itemId} className="flex-row mb-2">
						<Text className="mr-2 text-lg text-zinc-800 dark:text-zinc-200">
							{ordered ? `${itemNumber}.` : "•"}
						</Text>
						<View className="flex-1">
							<Text className="text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed">
								{processListItem(item)}
							</Text>
						</View>
					</View>
				);
			})}
		</View>
	);
};

export default ListComponent;
