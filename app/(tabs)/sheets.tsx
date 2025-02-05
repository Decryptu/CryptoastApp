import { ArticleListScreen } from "../../components/ArticleListScreen";
import { fetchSheets } from "../../services/api";

export default function SheetsScreen() {
	return <ArticleListScreen fetchArticles={fetchSheets} logLabel="sheets" />;
}
