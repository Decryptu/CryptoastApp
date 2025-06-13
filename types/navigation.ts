// types/navigation.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Article } from './article';

export type RootStackParamList = {
  Home: undefined;
  Article: { articleId: number; article?: Article };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type ArticleScreenProps = NativeStackScreenProps<RootStackParamList, 'Article'>;