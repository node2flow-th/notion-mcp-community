/**
 * Notion MCP Tool Definitions (25 tools)
 * All prefixed with notion_
 */

import type { MCPToolDefinition } from './types.js';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Search (1) ==========
  {
    name: 'notion_search',
    description: 'Search pages and databases in your Notion workspace by title. Filter by object type and sort by last edited time.',
    annotations: {
      title: 'Search Notion',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search text to match against titles' },
        filter_object: { type: 'string', enum: ['page', 'database'], description: 'Limit results to pages or databases only' },
        sort_direction: { type: 'string', enum: ['ascending', 'descending'], description: 'Sort by last_edited_time' },
        start_cursor: { type: 'string', description: 'Pagination cursor from previous response' },
        page_size: { type: 'number', description: 'Results per page (max 100)' },
      },
    },
  },

  // ========== Pages (5) ==========
  {
    name: 'notion_create_page',
    description: 'Create a new page in Notion. Set parent as a data source (data_source_id) or another page (page_id). Provide properties matching the parent schema. Optionally include initial content blocks.',
    annotations: {
      title: 'Create Page',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        parent: { type: 'object', description: 'Parent: { "data_source_id": "..." } for database pages, or { "page_id": "..." } for sub-pages' },
        properties: { type: 'object', description: 'Page properties. For title: { "Name": { "title": [{ "text": { "content": "..." } }] } }' },
        children: { type: 'array', description: 'Initial content blocks (optional)' },
        icon: { type: 'object', description: 'Page icon: { "type": "emoji", "emoji": "..." }' },
        cover: { type: 'object', description: 'Cover image: { "type": "external", "external": { "url": "..." } }' },
      },
      required: ['parent', 'properties'],
    },
  },
  {
    name: 'notion_get_page',
    description: 'Retrieve a Notion page by ID. Returns properties, parent, timestamps, and URL. Use notion_get_block_children to read the page content.',
    annotations: {
      title: 'Get Page',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Page ID (UUID, with or without dashes)' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'notion_update_page',
    description: 'Update a Notion page. Change properties, icon, cover, or archive/trash status. Use block tools to update page content.',
    annotations: {
      title: 'Update Page',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Page ID to update' },
        properties: { type: 'object', description: 'Updated properties' },
        icon: { type: 'object', description: 'New page icon' },
        cover: { type: 'object', description: 'New cover image' },
        archived: { type: 'boolean', description: 'Set true to archive' },
        in_trash: { type: 'boolean', description: 'Set true to move to trash' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'notion_move_page',
    description: 'Move a page to a new parent page or data source.',
    annotations: {
      title: 'Move Page',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Page ID to move' },
        new_parent: { type: 'object', description: 'New parent: { "page_id": "..." } or { "data_source_id": "..." }' },
      },
      required: ['page_id', 'new_parent'],
    },
  },
  {
    name: 'notion_get_page_property',
    description: 'Retrieve a specific property value from a page. Useful for paginated properties like relations or rollups.',
    annotations: {
      title: 'Get Page Property',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Page ID' },
        property_id: { type: 'string', description: 'Property ID (from page properties response)' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Items per page' },
      },
      required: ['page_id', 'property_id'],
    },
  },

  // ========== Blocks (5) ==========
  {
    name: 'notion_get_block',
    description: 'Retrieve a single block by ID. Returns block type, content, and whether it has children.',
    annotations: {
      title: 'Get Block',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Block ID (a page ID also works)' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'notion_get_block_children',
    description: 'Get child blocks of a page or block. This is how you read page content. Returns a paginated list of blocks.',
    annotations: {
      title: 'Get Block Children',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Block or page ID' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Blocks per page (max 100)' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'notion_append_blocks',
    description: 'Append content blocks to a page or block. Max 100 blocks, 2 levels of nesting. Common types: paragraph, heading_1/2/3, bulleted_list_item, numbered_list_item, to_do, code, quote, callout, divider, table.',
    annotations: {
      title: 'Append Block Children',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Page or block ID to append to' },
        children: { type: 'array', description: 'Block objects. Example: { "type": "paragraph", "paragraph": { "rich_text": [{ "type": "text", "text": { "content": "Hello" } }] } }' },
      },
      required: ['block_id', 'children'],
    },
  },
  {
    name: 'notion_update_block',
    description: 'Update a block\'s content. Send the block type key with updated data, e.g. { "paragraph": { "rich_text": [...] } }.',
    annotations: {
      title: 'Update Block',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Block ID to update' },
        data: { type: 'object', description: 'Block type key with content: { "paragraph": { "rich_text": [...] } }' },
      },
      required: ['block_id', 'data'],
    },
  },
  {
    name: 'notion_delete_block',
    description: 'Delete (archive) a block. The block is moved to trash.',
    annotations: {
      title: 'Delete Block',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Block ID to delete' },
      },
      required: ['block_id'],
    },
  },

  // ========== Data Sources - 2025-09-03 (5) ==========
  {
    name: 'notion_create_data_source',
    description: 'Create a new data source (table) under an existing database. Data sources are individual tables within a database (API 2025-09-03).',
    annotations: {
      title: 'Create Data Source',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'Parent database ID' },
        title: { type: 'array', description: 'Title as rich text: [{ "type": "text", "text": { "content": "My Table" } }]' },
        properties: { type: 'object', description: 'Property schema definitions' },
      },
      required: ['database_id'],
    },
  },
  {
    name: 'notion_get_data_source',
    description: 'Retrieve a data source by ID. Returns title, property schema, and timestamps.',
    annotations: {
      title: 'Get Data Source',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Data source ID' },
      },
      required: ['data_source_id'],
    },
  },
  {
    name: 'notion_update_data_source',
    description: 'Update a data source title or property schema.',
    annotations: {
      title: 'Update Data Source',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Data source ID' },
        title: { type: 'array', description: 'New title as rich text' },
        properties: { type: 'object', description: 'Updated property schema' },
      },
      required: ['data_source_id'],
    },
  },
  {
    name: 'notion_query_data_source',
    description: 'Query pages in a data source with filters and sorts. For new API (2025-09-03). For legacy databases use notion_query_database.',
    annotations: {
      title: 'Query Data Source',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Data source ID to query' },
        filter: { type: 'object', description: 'Filter: { "property": "Status", "select": { "equals": "Done" } }' },
        sorts: { type: 'array', description: 'Sorts: [{ "property": "Created", "direction": "descending" }]' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Results per page (max 100)' },
      },
      required: ['data_source_id'],
    },
  },
  {
    name: 'notion_list_data_source_templates',
    description: 'List page templates available in a data source.',
    annotations: {
      title: 'List Data Source Templates',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        data_source_id: { type: 'string', description: 'Data source ID' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Results per page' },
      },
      required: ['data_source_id'],
    },
  },

  // ========== Databases - Legacy (3) ==========
  {
    name: 'notion_get_database',
    description: 'Get a database by ID (legacy endpoint). Returns schema with properties and title. For new integrations prefer data source endpoints.',
    annotations: {
      title: 'Get Database',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'Database ID' },
      },
      required: ['database_id'],
    },
  },
  {
    name: 'notion_query_database',
    description: 'Query a database with filters and sorts (legacy endpoint). For new integrations prefer notion_query_data_source.',
    annotations: {
      title: 'Query Database',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        database_id: { type: 'string', description: 'Database ID to query' },
        filter: { type: 'object', description: 'Filter object (Notion filter syntax)' },
        sorts: { type: 'array', description: 'Sort criteria array' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Results per page (max 100)' },
      },
      required: ['database_id'],
    },
  },
  {
    name: 'notion_create_database',
    description: 'Create a new inline database inside a page (legacy). Must include at least one title property in the schema.',
    annotations: {
      title: 'Create Database',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        parent: { type: 'object', description: 'Parent page: { "type": "page_id", "page_id": "..." }' },
        title: { type: 'array', description: 'Database title as rich text' },
        properties: { type: 'object', description: 'Property schema. Must include a title property.' },
      },
      required: ['parent', 'title', 'properties'],
    },
  },

  // ========== Comments (3) ==========
  {
    name: 'notion_create_comment',
    description: 'Create a comment on a page or reply in a discussion thread. Integration must have comment capabilities enabled.',
    annotations: {
      title: 'Create Comment',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        parent_page_id: { type: 'string', description: 'Page ID to comment on (use this OR discussion_id)' },
        discussion_id: { type: 'string', description: 'Discussion thread ID to reply to' },
        rich_text: { type: 'array', description: 'Comment content: [{ "type": "text", "text": { "content": "My comment" } }]' },
      },
      required: ['rich_text'],
    },
  },
  {
    name: 'notion_get_comments',
    description: 'List unresolved comments on a page or block.',
    annotations: {
      title: 'List Comments',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        block_id: { type: 'string', description: 'Page or block ID' },
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Comments per page' },
      },
      required: ['block_id'],
    },
  },
  {
    name: 'notion_get_comment',
    description: 'Retrieve a single comment by ID.',
    annotations: {
      title: 'Get Comment',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'string', description: 'Comment ID' },
      },
      required: ['comment_id'],
    },
  },

  // ========== Users (3) ==========
  {
    name: 'notion_list_users',
    description: 'List all users in the workspace. Returns names, types (person/bot), and avatars.',
    annotations: {
      title: 'List Users',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        start_cursor: { type: 'string', description: 'Pagination cursor' },
        page_size: { type: 'number', description: 'Users per page' },
      },
    },
  },
  {
    name: 'notion_get_user',
    description: 'Get a user by ID.',
    annotations: {
      title: 'Get User',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'User ID' },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'notion_get_bot_user',
    description: 'Get the bot user info for this integration. Useful for checking identity and permissions.',
    annotations: {
      title: 'Get Bot Info',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];
