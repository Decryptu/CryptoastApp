// components/ArticleImage.tsx

import { type FC, useState, useCallback } from "react";
import { View, Image, useWindowDimensions } from "react-native";

interface ArticleImageProps {
  html: string;
  contentPadding?: number;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const ArticleImage: FC<ArticleImageProps> = ({ html, contentPadding = 32 }) => {
  const { width: screenWidth } = useWindowDimensions();
  const [hasError, setHasError] = useState(false);
  const [actualDimensions, setActualDimensions] = useState<ImageDimensions | null>(null);

  // Extract image attributes from HTML
  const src = html.match(/src="([^"]+)"/)?.[1];
  const originalWidth = Number.parseInt(html.match(/width="(\d+)"/)?.[1] || "0", 10);
  const originalHeight = Number.parseInt(html.match(/height="(\d+)"/)?.[1] || "0", 10);

  // Calculate content width considering padding
  const contentWidth = screenWidth - contentPadding;

  // Handle image load success and get actual dimensions
  const handleImageLoad = useCallback(() => {
    if (!src) return;
    
    Image.getSize(
      src,
      (width, height) => {
        setActualDimensions({ width, height });
      },
      (error) => {
        console.error("Error getting image dimensions:", error);
        setHasError(true);
      }
    );
  }, [src]);

  // Calculate dimensions based on actual image size or original HTML attributes
  const calculateDimensions = useCallback((): { width: number; height: number } => {
    const sourceWidth = actualDimensions?.width || originalWidth;
    const sourceHeight = actualDimensions?.height || originalHeight;

    if (sourceWidth && sourceHeight) {
      const aspectRatio = sourceWidth / sourceHeight;
      const calculatedHeight = contentWidth / aspectRatio;

      return {
        width: contentWidth,
        height: calculatedHeight,
      };
    }

    // Fallback dimensions if no size information is available
    return {
      width: contentWidth,
      height: contentWidth * (3 / 4), // Default 4:3 aspect ratio
    };
  }, [actualDimensions, contentWidth, originalWidth, originalHeight]);

  // Skip if image is inside a blockquote or invalid source
  if (html.includes("<blockquote") || !src || hasError) {
    return null;
  }

  const dimensions = calculateDimensions();

  return (
    <View style={{ width: dimensions.width, height: dimensions.height }}>
      <Image
        source={{ uri: src }}
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
        resizeMode="contain"
        onLoad={handleImageLoad}
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