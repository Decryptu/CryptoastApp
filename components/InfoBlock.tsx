import type { FC } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InfoBlockProps {
	title: string;
	content: string;
	blockType?: "aim" | "info" | "warning";
}

type IconName = keyof typeof Ionicons.glyphMap;

export const InfoBlock: FC<InfoBlockProps> = ({
	title,
	content,
	blockType = "info",
}) => {
	const blockConfig = {
		aim: {
			icon: "information-circle" as IconName,
			color: "#4A90E2",
			bgColor: "bg-blue-50 dark:bg-blue-900/30",
			borderColor: "border-blue-200 dark:border-blue-800",
		},
		info: {
			icon: "information-circle" as IconName,
			color: "#34C759",
			bgColor: "bg-green-50 dark:bg-green-900/30",
			borderColor: "border-green-200 dark:border-green-800",
		},
		warning: {
			icon: "warning" as IconName,
			color: "#FFCC00",
			bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
			borderColor: "border-yellow-200 dark:border-yellow-800",
		},
	};

	const { icon, color, bgColor, borderColor } = blockConfig[blockType];

	return (
		<View className={`rounded-lg p-4 my-4 border ${bgColor} ${borderColor}`}>
			<View className="flex-row items-center mb-3">
				<Ionicons name={icon} size={24} color={color} />
				<Text className="text-lg font-semibold ml-2 flex-1 text-zinc-900 dark:text-white">
					{title}
				</Text>
			</View>
			<Text className="text-base text-zinc-700 dark:text-zinc-300">
				{content}
			</Text>
		</View>
	);
};

export default InfoBlock;
