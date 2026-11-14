import Fuse from 'fuse.js';
import { toolsRegistry } from './registry';
import { ToolDefinition } from './types';

export interface ToolSearchResult {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  route: string;
}

let fuseInstance: Fuse<ToolDefinition> | null = null;

export function getFuse(): Fuse<ToolDefinition> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(toolsRegistry.filter((t) => t.enabled), {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'keywords', weight: 0.3 },
        { name: 'title', weight: 0.15 },
        { name: 'description', weight: 0.1 },
        { name: 'category', weight: 0.05 },
      ],
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 2,
    });
  }
  return fuseInstance;
}

export function searchTools(query: string): ToolSearchResult[] {
  const activeTools = toolsRegistry.filter((t) => t.enabled);
  if (!query || query.trim() === '') {
    return activeTools.map((t) => ({
      id: t.id,
      name: t.name,
      title: t.title,
      description: t.description,
      category: t.category,
      route: t.route,
    }));
  }

  const fuse = getFuse();
  const results = fuse.search(query.trim());
  return results.map((r) => ({
    id: r.item.id,
    name: r.item.name,
    title: r.item.title,
    description: r.item.description,
    category: r.item.category,
    route: r.item.route,
  }));
}
