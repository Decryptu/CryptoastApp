// app/(tabs)/guides.tsx
import { ArticleListScreen } from '../../components/ArticleListScreen';
import { fetchGuides } from '../../services/api';

export default function GuidesScreen() {
  return (
    <ArticleListScreen
      fetchArticles={fetchGuides}
      logLabel="guides"
      section="GUIDES"
    />
  );
}