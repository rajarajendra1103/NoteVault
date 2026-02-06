
export type EntryType = 'note' | 'bookmark';
export type ViewType = 'notes' | 'bookmarks' | 'all';

export interface Entry {
  id: string;
  type: EntryType;
  title: string;
  content: string; // For notes, the body; for bookmarks, the URL
  description?: string; // User-provided description
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  entries: Entry[];
  searchQuery: string;
  selectedTag: string | null;
  activeFilter: ViewType;
}
