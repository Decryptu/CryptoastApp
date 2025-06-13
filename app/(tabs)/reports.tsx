// app/(tabs)/reports.tsx
import { ArticleListScreen } from "../../components/ArticleListScreen";
import { fetchReports } from "../../services/api";

export default function ReportsScreen() {
	return (
		<ArticleListScreen
			fetchArticles={fetchReports}
			logLabel="reports"
			section="REPORTS"
		/>
	);
}
