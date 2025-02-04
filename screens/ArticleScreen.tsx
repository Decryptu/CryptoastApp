import type React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Share, TouchableOpacity } from 'react-native';
import type { ArticleScreenProps } from '../types/navigation';
import { fetchArticle } from '../services/api';
import type { Article } from '../types/article';
import { Feather } from '@expo/vector-icons';

const ArticleContent: React.FC<{ content: string }> = ({ content }) => {
  const parsedContent = useMemo(() => {
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<blockquote\s+class="twitter-tweet"[^>]*>.*?<\/blockquote>/gs, '')
      .replace(/<div[^>]*class="btn4"[^>]*>.*?<\/div>/gs, '')
      .replace(/<div[^>]*class="blcatt"[^>]*>.*?<\/div>/gs, '');
  }, [content]);

  return (
    <Text className="text-gray-800 leading-relaxed">
      {parsedContent.replace(/<[^>]*>/g, '')}
    </Text>
  );
};

export function ArticleScreen({ route }: ArticleScreenProps) {
  const [article, setArticle] = useState<Article | null>(route.params.article ?? null);
  const [loading, setLoading] = useState(!route.params.article);

  useEffect(() => {
    if (!article) {
      const loadArticle = async () => {
        try {
          const data = await fetchArticle(route.params.articleId);
          setArticle(data);
        } catch (error) {
          console.error('Failed to load article:', error);
        } finally {
          setLoading(false);
        }
      };
      void loadArticle();
    }
  }, [article, route.params.articleId]);

  const handleShare = async () => {
    if (!article) return;
    try {
      await Share.share({
        message: article.link,
        title: article.title.rendered,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const formattedDate = useMemo(() => {
    if (!article?.date) return '';
    const date = new Date(article.date);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }, [article?.date]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!article) return null;

  const imageUrl = article._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const authorName = article.yoast_head_json?.author || article._embedded?.author?.[0]?.name;
  const readingTime = article.yoast_head_json?.twitter_misc?.["Durée de lecture estimée"];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-64"
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          {article.title.rendered.replace(/<[^>]*>/g, '')}
        </Text>

        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            {authorName && (
              <Text className="text-sm text-gray-600 mb-1">
                Par {authorName}
              </Text>
            )}
            <Text className="text-sm text-gray-500">
              {formattedDate}
              {readingTime && ` • ${readingTime}`}
            </Text>
          </View>
          <TouchableOpacity onPress={handleShare}>
            <Feather name="share-2" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <ArticleContent content={article.content.rendered} />
      </View>
    </ScrollView>
  );
}