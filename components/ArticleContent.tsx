import type React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

interface ArticleContentProps {
  content: string;
}

let uniqueId = 0;
const generateId = () => `section-${uniqueId++}`;

export const ArticleContent: React.FC<ArticleContentProps> = ({ content }) => {
  const processContent = (htmlContent: string) => {
    const sections = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<blockquote\s+class="twitter-tweet"[^>]*>.*?<\/blockquote>/gs, '')
      .split(/(<h[1-3][^>]*>.*?<\/h[1-3]>|<p[^>]*>.*?<\/p>)/gs);

    return sections.map(section => {
      if (!section.trim()) return null;

      const id = generateId();

      if (section.startsWith('<h2')) {
        return (
          <Text key={id} className="text-2xl font-bold mt-8 mb-4 text-gray-900">
            {section.replace(/<[^>]*>/g, '')}
          </Text>
        );
      }

      if (section.startsWith('<p')) {
        // Handle special links (Tip/Guide links with 💡)
        if (section.includes('💡')) {
          const linkMatch = section.match(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/);
          if (linkMatch) {
            return (
              <TouchableOpacity
                key={id}
                onPress={() => Linking.openURL(linkMatch[1])}
                className="flex-row items-center bg-blue-50 p-4 my-3 rounded-lg"
              >
                <Text className="text-lg mr-2">💡</Text>
                <Text className="text-blue-600 flex-1">
                  {linkMatch[2].replace(/<[^>]*>/g, '')}
                </Text>
              </TouchableOpacity>
            );
          }
        }

        // Handle normal paragraphs
        const text = section
          .replace(/<strong>(.*?)<\/strong>/g, '$1') // Keep strong text but remove tags
          .replace(/<a[^>]*>(.*?)<\/a>/g, '$1') // Keep link text but remove tags
          .replace(/<[^>]*>/g, '')
          .trim();

        if (!text) return null;

        return (
          <Text key={id} className="text-gray-800 leading-relaxed mb-4">
            {text}
          </Text>
        );
      }

      return null;
    }).filter(Boolean);
  };

  return <View>{processContent(content)}</View>;
};