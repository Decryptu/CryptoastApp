// hooks/useCategories.ts
import { useMemo } from 'react';
import { categories, CATEGORY_MAPPINGS } from '../data/categories';
import type { Category } from '../data/categories';
import type { ContentSection } from '../services/api';

interface CategoryTab {
  id: number;
  name: string;
}

interface UseCategoriesReturn {
  sectionCategories: CategoryTab[];
}

export function useCategories(section: ContentSection): UseCategoriesReturn {
  const sectionCategories = useMemo(() => {
    if (section === 'SHEETS') return [];

    const sectionIds = Array.from(CATEGORY_MAPPINGS[section]) as (typeof CATEGORY_MAPPINGS[typeof section][number])[];
    
    return categories
      .flatMap((cat: Category) => cat.children ?? [])
      .filter((cat: Category) => sectionIds.includes(cat.id as typeof sectionIds[number]))
      .map((cat: Category) => ({ id: cat.id, name: cat.name }));
  }, [section]);

  return { sectionCategories };
}