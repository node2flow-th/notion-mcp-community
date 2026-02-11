/**
 * Notion REST API Client
 * API Version: 2025-09-03
 * Auth: Bearer token (Internal Integration Token)
 */

import type {
  NotionConfig,
  NotionPage,
  NotionBlock,
  NotionDataSource,
  NotionDatabase,
  NotionComment,
  NotionUser,
  NotionList,
  RichText,
} from './types.js';

export class NotionClient {
  private config: NotionConfig;
  private baseUrl = 'https://api.notion.com/v1';

  constructor(config: NotionConfig) {
    this.config = config;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Notion API Error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /** Helper: build a simple rich text array from plain string */
  static richText(content: string): RichText[] {
    return [{ type: 'text', text: { content } }];
  }

  // ========== Search ==========

  async search(params?: {
    query?: string;
    filter_object?: 'page' | 'database';
    sort_direction?: 'ascending' | 'descending';
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionPage | NotionDatabase>> {
    const body: Record<string, unknown> = {};
    if (params?.query) body.query = params.query;
    if (params?.filter_object) body.filter = { property: 'object', value: params.filter_object };
    if (params?.sort_direction) body.sort = { timestamp: 'last_edited_time', direction: params.sort_direction };
    if (params?.start_cursor) body.start_cursor = params.start_cursor;
    if (params?.page_size) body.page_size = params.page_size;
    return this.request('/search', { method: 'POST', body: JSON.stringify(body) });
  }

  // ========== Pages ==========

  async createPage(params: {
    parent: Record<string, unknown>;
    properties: Record<string, unknown>;
    children?: unknown[];
    icon?: unknown;
    cover?: unknown;
  }): Promise<NotionPage> {
    return this.request('/pages', { method: 'POST', body: JSON.stringify(params) });
  }

  async getPage(pageId: string): Promise<NotionPage> {
    return this.request(`/pages/${pageId}`);
  }

  async updatePage(pageId: string, params: {
    properties?: Record<string, unknown>;
    icon?: unknown;
    cover?: unknown;
    archived?: boolean;
    in_trash?: boolean;
  }): Promise<NotionPage> {
    return this.request(`/pages/${pageId}`, { method: 'PATCH', body: JSON.stringify(params) });
  }

  async movePage(pageId: string, newParent: Record<string, unknown>): Promise<NotionPage> {
    return this.request(`/pages/${pageId}/move`, {
      method: 'POST',
      body: JSON.stringify({ parent: newParent }),
    });
  }

  async getPageProperty(pageId: string, propertyId: string, params?: {
    start_cursor?: string;
    page_size?: number;
  }): Promise<unknown> {
    const query = new URLSearchParams();
    if (params?.start_cursor) query.set('start_cursor', params.start_cursor);
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return this.request(`/pages/${pageId}/properties/${propertyId}${qs ? `?${qs}` : ''}`);
  }

  // ========== Blocks ==========

  async getBlock(blockId: string): Promise<NotionBlock> {
    return this.request(`/blocks/${blockId}`);
  }

  async getBlockChildren(blockId: string, params?: {
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionBlock>> {
    const query = new URLSearchParams();
    if (params?.start_cursor) query.set('start_cursor', params.start_cursor);
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return this.request(`/blocks/${blockId}/children${qs ? `?${qs}` : ''}`);
  }

  async appendBlocks(blockId: string, children: unknown[]): Promise<NotionList<NotionBlock>> {
    return this.request(`/blocks/${blockId}/children`, {
      method: 'PATCH',
      body: JSON.stringify({ children }),
    });
  }

  async updateBlock(blockId: string, data: Record<string, unknown>): Promise<NotionBlock> {
    return this.request(`/blocks/${blockId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteBlock(blockId: string): Promise<NotionBlock> {
    return this.request(`/blocks/${blockId}`, { method: 'DELETE' });
  }

  // ========== Data Sources (2025-09-03) ==========

  async createDataSource(databaseId: string, params: {
    title?: RichText[];
    properties?: Record<string, unknown>;
  }): Promise<NotionDataSource> {
    return this.request('/data_sources', {
      method: 'POST',
      body: JSON.stringify({
        parent: { type: 'database', database_id: databaseId },
        ...params,
      }),
    });
  }

  async getDataSource(dataSourceId: string): Promise<NotionDataSource> {
    return this.request(`/data_sources/${dataSourceId}`);
  }

  async updateDataSource(dataSourceId: string, params: {
    title?: RichText[];
    properties?: Record<string, unknown>;
  }): Promise<NotionDataSource> {
    return this.request(`/data_sources/${dataSourceId}`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    });
  }

  async queryDataSource(dataSourceId: string, params?: {
    filter?: Record<string, unknown>;
    sorts?: unknown[];
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionPage>> {
    const body: Record<string, unknown> = {};
    if (params?.filter) body.filter = params.filter;
    if (params?.sorts) body.sorts = params.sorts;
    if (params?.start_cursor) body.start_cursor = params.start_cursor;
    if (params?.page_size) body.page_size = params.page_size;
    return this.request(`/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async listDataSourceTemplates(dataSourceId: string, params?: {
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionPage>> {
    const query = new URLSearchParams();
    if (params?.start_cursor) query.set('start_cursor', params.start_cursor);
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return this.request(`/data_sources/${dataSourceId}/templates${qs ? `?${qs}` : ''}`);
  }

  // ========== Databases (legacy) ==========

  async getDatabase(databaseId: string): Promise<NotionDatabase> {
    return this.request(`/databases/${databaseId}`);
  }

  async queryDatabase(databaseId: string, params?: {
    filter?: Record<string, unknown>;
    sorts?: unknown[];
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionPage>> {
    const body: Record<string, unknown> = {};
    if (params?.filter) body.filter = params.filter;
    if (params?.sorts) body.sorts = params.sorts;
    if (params?.start_cursor) body.start_cursor = params.start_cursor;
    if (params?.page_size) body.page_size = params.page_size;
    return this.request(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async createDatabase(params: {
    parent: Record<string, unknown>;
    title: RichText[];
    properties: Record<string, unknown>;
  }): Promise<NotionDatabase> {
    return this.request('/databases', { method: 'POST', body: JSON.stringify(params) });
  }

  // ========== Comments ==========

  async createComment(params: {
    parent?: { page_id: string };
    discussion_id?: string;
    rich_text: RichText[];
  }): Promise<NotionComment> {
    return this.request('/comments', { method: 'POST', body: JSON.stringify(params) });
  }

  async getComments(blockId: string, params?: {
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionComment>> {
    const query = new URLSearchParams();
    query.set('block_id', blockId);
    if (params?.start_cursor) query.set('start_cursor', params.start_cursor);
    if (params?.page_size) query.set('page_size', String(params.page_size));
    return this.request(`/comments?${query.toString()}`);
  }

  async getComment(commentId: string): Promise<NotionComment> {
    return this.request(`/comments/${commentId}`);
  }

  // ========== Users ==========

  async listUsers(params?: {
    start_cursor?: string;
    page_size?: number;
  }): Promise<NotionList<NotionUser>> {
    const query = new URLSearchParams();
    if (params?.start_cursor) query.set('start_cursor', params.start_cursor);
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return this.request(`/users${qs ? `?${qs}` : ''}`);
  }

  async getUser(userId: string): Promise<NotionUser> {
    return this.request(`/users/${userId}`);
  }

  async getBotUser(): Promise<NotionUser> {
    return this.request('/users/me');
  }
}
