import { type FC, useState } from "react";
import { View, Image, useWindowDimensions } from "react-native";

interface ArticleImageProps {
	html: string;
	contentPadding?: number;
}

const ArticleImage: FC<ArticleImageProps> = ({ html, contentPadding = 32 }) => {
	const { width: screenWidth } = useWindowDimensions();
	const [hasError, setHasError] = useState(false);

	// Skip if image is inside a blockquote
	if (html.includes("<blockquote")) {
		return null;
	}

	// Extract image attributes from HTML
	const src = html.match(/src="([^"]+)"/)?.[1];
	const width = Number.parseInt(html.match(/width="(\d+)"/)?.[1] || "0", 10);
	const height = Number.parseInt(html.match(/height="(\d+)"/)?.[1] || "0", 10);

	if (!src || hasError) {
		console.log("Invalid image source or loading error:", { src, hasError });
		return null;
	}

	// Calculate responsive dimensions
	const contentWidth = screenWidth - contentPadding;
	const aspectRatio = width / height || 4 / 3; // Fallback aspect ratio if dimensions are missing
	const calculatedHeight = contentWidth / aspectRatio;

	return (
		<View className="my-4">
			<Image
				source={{ uri: src }}
				style={{
					width: contentWidth,
					height: calculatedHeight,
				}}
				resizeMode="contain"
				onError={() => {
					console.log("Failed to load image:", src);
					setHasError(true);
				}}
				className="rounded-lg"
			/>
		</View>
	);
};

export default ArticleImage;
