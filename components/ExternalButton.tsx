import type { FC } from "react";
import { TouchableOpacity, Text } from "react-native";

interface ExternalButtonProps {
	url: string;
	text: string;
	bgColor: string;
	onPress: (url: string, className: string) => void;
}

export const ExternalButton: FC<ExternalButtonProps> = ({
	url,
	text,
	bgColor,
	onPress,
}) => {
	return (
		<TouchableOpacity
			onPress={() => onPress(url, "btn4")}
			style={{ backgroundColor: `#${bgColor}` }}
			className="p-4 my-3 rounded-lg"
		>
			<Text className="text-white text-center font-medium">
				{text.replace(/<[^>]*>/g, "")}
			</Text>
		</TouchableOpacity>
	);
};

export default ExternalButton;
