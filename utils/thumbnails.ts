// CryptoastApp/utils/thumbnails.ts
import type { Article } from "../types/article";

/**
 * Gets the best available thumbnail URL for an article
 * @param article The article to get the thumbnail for
 * @returns The best available thumbnail URL, or null if none found
 */
export const getArticleThumbnail = (article: Article): string | null => {
  if (!article) return null;

  // Check all possible thumbnail sources in order of preference
  const sources = [
    // OG Image is often the highest quality
    article.yoast_head_json?.og_image?.[0]?.url,
    
    // Medium-large size from media details 
    article._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium_large?.source_url,
    
    // Original source URL as fallback
    article._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    
    // Schema thumbnail as last resort
    article.schema?.["@graph"]?.[0]?.thumbnailUrl,
  ];

  // Return the first valid URL found
  return sources.find(url => url && typeof url === 'string') || null;
};

/**
 * Validates if an article has a valid thumbnail
 * @param article The article to validate
 * @returns True if the article has a valid thumbnail source
 */
export const hasThumbnail = (article: Article): boolean => {
  return getArticleThumbnail(article) !== null;
};

/**
 * Calculate the percentage of articles with thumbnails
 * @param articles Array of articles to check
 * @returns Percentage of articles with thumbnails (0-100)
 */
export const calculateThumbnailCoverage = (articles: Article[]): number => {
  if (!articles || articles.length === 0) return 0;
  
  const withThumbnails = articles.filter(article => hasThumbnail(article)).length;
  return Math.round((withThumbnails / articles.length) * 100);
};