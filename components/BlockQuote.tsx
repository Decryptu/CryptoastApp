import type { FC } from "react";
import { View, Text } from "react-native";
import type { TextSegment } from "../types/article";

interface BlockQuoteProps {
	sectionId: string;
	section: string;
	processTextSegments: (text: string) => TextSegment[];
	handleLinkPress: (url: string, className?: string) => void;
	isInternalLink: (url: string, className?: string) => boolean;
}

export const BlockQuote: FC<BlockQuoteProps> = ({
	sectionId,
	section,
	processTextSegments,
	handleLinkPress,
	isInternalLink,
}) => {
	// Extract citation from blockquote
	let citation = "";
	if (section.includes('class="blockquote-citation"')) {
		citation =
			section.match(/<p class="blockquote-citation">(.*?)<\/p>/s)?.[1] ?? "";
	} else {
		citation =
			section.match(/<blockquote><p>(.*?)<\/p><\/blockquote>/s)?.[1] ?? "";
	}

	// Process the citation text through segment processor
	const segments = processTextSegments(citation);

	return (
		<View className="my-6 px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-l-4 border-primary-600 rounded-r-lg">
			<Text className="font-serif italic text-lg text-zinc-700 dark:text-zinc-300">
				{segments.map((segment, index) => {
					const key = `${sectionId}-${index}`;

					if (segment.type === "link") {
						return (
							<Text
								key={key}
								onPress={() =>
									segment.linkData &&
									handleLinkPress(
										segment.linkData.url,
										segment.linkData.className,
									)
								}
								className={
									isInternalLink(
										segment.linkData?.url ?? "",
										segment.linkData?.className,
									)
										? "text-blue-600 dark:text-blue-400"
										: "text-primary-600 dark:text-primary-400"
								}
							>
								{segment.content}
							</Text>
						);
					}

					if (segment.type === "bold") {
						return (
							<Text key={key} className="font-bold">
								{segment.content}
							</Text>
						);
					}

					return <Text key={key}>{segment.content}</Text>;
				})}
			</Text>
		</View>
	);
};

export default BlockQuote;
