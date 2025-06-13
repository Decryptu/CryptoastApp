// app/(tabs)/news.tsx
import { ArticleListScreen } from '../../components/ArticleListScreen';
import { fetchNews } from '../../services/api';

export default function NewsScreen() {
  return (
    <ArticleListScreen
      fetchArticles={fetchNews}
      logLabel="news"
      section="NEWS"
    />
  );
}