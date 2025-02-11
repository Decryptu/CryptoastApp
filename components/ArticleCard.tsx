import type React from "react";
import { useMemo, useState, useCallback } from "react";
import { View, Text, Image, Pressable } from "react-native";
import type { Article } from "../types/article";

type Props = {
  article: Article;
  onPress: () => void;
};

export const ArticleCard: React.FC<Props> = ({ article, onPress }) => {
  const [imageError, setImageError] = useState(false);

  // Resolve image URL from multiple possible sources
  const getImageUrl = useCallback((article: Article): string | null => {
    if (!article) return null;

    const imageSources = [
      article.yoast_head_json?.og_image?.[0]?.url,
      article._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium_large?.source_url,
      article._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
      article.schema?.["@graph"]?.[0]?.thumbnailUrl,
    ];

    return imageSources.find(url => url && typeof url === 'string') || null;
  }, []);

  const imageUrl = !imageError ? getImageUrl(article) : null;

  // Extract and format article metadata
  const authorName = article.yoast_head_json?.author || article._embedded?.author?.[0]?.name;
  const readingTime = article.yoast_head_json?.twitter_misc?.["Durée de lecture estimée"];

  const formattedDate = useMemo(() => {
    const date = new Date(article.date);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }, [article.date]);

  const cleanHtml = (html: string) => {
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  };

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.95 : 1,
      })}
    >
      <View className="bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4 overflow-hidden">
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-48"
            resizeMode="cover"
            onError={handleImageError}
          />
        )}
        <View className="p-4">
          <Text
            className="text-lg leading-5 font-bold text-zinc-900 dark:text-white mb-2"
            numberOfLines={2}
          >
            {cleanHtml(article.title.rendered)}
          </Text>

          <Text
            className="text-zinc-600 dark:text-zinc-300 mb-3"
            numberOfLines={3}
          >
            {cleanHtml(article.excerpt.rendered)}
          </Text>

          <View className="flex-row justify-between items-center">
            {authorName && (
              <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                Par {authorName}
              </Text>
            )}
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              {readingTime && `${readingTime} • `}
              {formattedDate}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};