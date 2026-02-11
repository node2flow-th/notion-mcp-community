/**
 * Notion MCP Plugin - Type Definitions
 * API Version: 2025-09-03
 */

export interface NotionConfig {
  apiKey: string;
}

// --- Rich Text ---

export interface RichText {
  type: 'text' | 'mention' | 'equation';
  text?: { content: string; link?: { url: string } | null };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
  plain_text?: string;
  href?: string | null;
}

// --- Parent ---

export interface NotionParent {
  type: string;
  database_id?: string;
  data_source_id?: string;
  page_id?: string;
  workspace?: boolean;
  block_id?: string;
}

// --- Page ---

export interface NotionPage {
  object: 'page';
  id: string;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  in_trash: boolean;
  parent: NotionParent;
  properties: Record<string, unknown>;
  icon?: unknown;
  cover?: unknown;
  url: string;
}

// --- Block ---

export interface NotionBlock {
  object: 'block';
  id: string;
  type: string;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  in_trash: boolean;
  has_children: boolean;
  parent: NotionParent;
  [key: string]: unknown;
}

// --- Data Source (2025-09-03) ---

export interface NotionDataSource {
  object: 'data_source';
  id: string;
  title: RichText[];
  properties: Record<string, unknown>;
  created_time: string;
  last_edited_time: string;
  parent: { type: 'database'; database_id: string };
}

// --- Database (legacy) ---

export interface NotionDatabase {
  object: 'database';
  id: string;
  title: RichText[];
  properties: Record<string, unknown>;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  url: string;
}

// --- Comment ---

export interface NotionComment {
  object: 'comment';
  id: string;
  parent: NotionParent;
  discussion_id: string;
  rich_text: RichText[];
  created_time: string;
  created_by: { object: string; id: string };
}

// --- User ---

export interface NotionUser {
  object: 'user';
  id: string;
  type: 'person' | 'bot';
  name: string;
  avatar_url: string | null;
}

// --- Paginated List ---

export interface NotionList<T> {
  object: 'list';
  results: T[];
  next_cursor: string | null;
  has_more: boolean;
  type: string;
}

// --- Tool Definition ---

export interface MCPToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  annotations?: MCPToolAnnotations;
  inputSchema: Record<string, unknown>;
}
