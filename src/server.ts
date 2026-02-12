/**
 * Shared MCP Server — used by both Node.js (index.ts) and CF Worker (worker.ts)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { NotionClient } from './client.js';
import { TOOLS } from './tools.js';

export interface NotionMcpConfig {
  apiKey: string;
}

export function handleToolCall(
  toolName: string,
  args: Record<string, unknown>,
  client: NotionClient
) {
  switch (toolName) {
    // ========== Search ==========
    case 'notion_search':
      return client.search(args as any);

    // ========== Pages ==========
    case 'notion_create_page':
      return client.createPage(args as any);
    case 'notion_get_page':
      return client.getPage(args.page_id as string);
    case 'notion_update_page':
      return client.updatePage(args.page_id as string, args as any);
    case 'notion_move_page':
      return client.movePage(args.page_id as string, args.new_parent as Record<string, unknown>);
    case 'notion_get_page_property':
      return client.getPageProperty(args.page_id as string, args.property_id as string, args as any);

    // ========== Blocks ==========
    case 'notion_get_block':
      return client.getBlock(args.block_id as string);
    case 'notion_get_block_children':
      return client.getBlockChildren(args.block_id as string, args as any);
    case 'notion_append_blocks':
      return client.appendBlocks(args.block_id as string, args.children as unknown[]);
    case 'notion_update_block':
      return client.updateBlock(args.block_id as string, args.data as Record<string, unknown>);
    case 'notion_delete_block':
      return client.deleteBlock(args.block_id as string);

    // ========== Data Sources ==========
    case 'notion_create_data_source':
      return client.createDataSource(args.database_id as string, {
        title: args.title as any,
        properties: args.properties as Record<string, unknown> | undefined,
      });
    case 'notion_get_data_source':
      return client.getDataSource(args.data_source_id as string);
    case 'notion_update_data_source':
      return client.updateDataSource(args.data_source_id as string, {
        title: args.title as any,
        properties: args.properties as Record<string, unknown> | undefined,
      });
    case 'notion_query_data_source':
      return client.queryDataSource(args.data_source_id as string, args as any);
    case 'notion_list_data_source_templates':
      return client.listDataSourceTemplates(args.data_source_id as string, args as any);

    // ========== Databases (legacy) ==========
    case 'notion_get_database':
      return client.getDatabase(args.database_id as string);
    case 'notion_query_database':
      return client.queryDatabase(args.database_id as string, args as any);
    case 'notion_create_database':
      return client.createDatabase(args as any);

    // ========== Comments ==========
    case 'notion_create_comment': {
      const commentParams: any = { rich_text: args.rich_text };
      if (args.parent_page_id) commentParams.parent = { page_id: args.parent_page_id };
      if (args.discussion_id) commentParams.discussion_id = args.discussion_id;
      return client.createComment(commentParams);
    }
    case 'notion_get_comments':
      return client.getComments(args.block_id as string, args as any);
    case 'notion_get_comment':
      return client.getComment(args.comment_id as string);

    // ========== Users ==========
    case 'notion_list_users':
      return client.listUsers(args as any);
    case 'notion_get_user':
      return client.getUser(args.user_id as string);
    case 'notion_get_bot_user':
      return client.getBotUser();

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export function createServer(config?: NotionMcpConfig) {
  const server = new McpServer({
    name: 'notion-mcp',
    version: '1.0.3',
  }, {
    capabilities: {
      tools: {},
      prompts: {},
      resources: {},
    },
  });

  let client: NotionClient | null = null;

  // ========== Register Tools ==========
  for (const tool of TOOLS) {
    (server as any).registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      },
      async (args: Record<string, unknown>) => {
        const apiKey =
          config?.apiKey ||
          (args as Record<string, unknown>).NOTION_API_KEY as string;

        if (!apiKey) {
          return {
            content: [{ type: 'text' as const, text: 'Error: NOTION_API_KEY is required' }],
            isError: true,
          };
        }

        if (!client || config?.apiKey !== apiKey) {
          client = new NotionClient({ apiKey });
        }

        try {
          const result = await handleToolCall(tool.name, args, client);
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
            isError: false,
          };
        } catch (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          };
        }
      }
    );
  }

  // ========== Register Prompts ==========
  server.prompt(
    'manage-pages',
    'Guide for managing Notion pages — search, create, update, and organize content',
    () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: [
            'You are a Notion workspace assistant. Help me manage my Notion pages and content.',
            '',
            'Available actions:',
            '1. **Search** — Use notion_search to find pages and databases',
            '2. **Get page** — Use notion_get_page to read page properties',
            '3. **Create page** — Use notion_create_page with parent and properties',
            '4. **Update page** — Use notion_update_page to modify properties',
            '5. **Blocks** — Use notion_get_block_children, notion_append_block_children to manage content',
            '6. **Comments** — Use notion_create_comment, notion_list_comments for discussions',
            '',
            'Start by searching for my recent pages.',
          ].join('\n'),
        },
      }],
    })
  );

  server.prompt(
    'query-databases',
    'Guide for querying and managing Notion databases and data sources',
    () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: [
            'You are a Notion database assistant. Help me query and manage my databases.',
            '',
            'Available actions:',
            '1. **Search databases** — Use notion_search with filter for databases',
            '2. **Query database** — Use notion_query_database with filters and sorts',
            '3. **Create database** — Use notion_create_database with schema',
            '4. **Data sources** — Use notion_query_data_source for the new data source API',
            '5. **Templates** — Use notion_list_data_source_templates for available templates',
            '6. **Users** — Use notion_list_users to see workspace members',
            '',
            'Start by searching for my databases.',
          ].join('\n'),
        },
      }],
    })
  );

  // ========== Register Resources ==========
  server.resource(
    'Notion Server Info',
    'notion://server-info',
    {
      description: 'Connection status and available tools for this Notion MCP server',
      mimeType: 'application/json',
    },
    async () => ({
      contents: [{
        uri: 'notion://server-info',
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'notion-mcp',
          version: '1.0.3',
          connected: !!config,
          tools_available: TOOLS.length,
          tool_categories: {
            search: 1,
            pages: 5,
            blocks: 5,
            data_sources: 5,
            databases: 3,
            comments: 3,
            users: 3,
          },
        }, null, 2),
      }],
    })
  );

  // Override tools/list handler to return raw JSON Schema with property descriptions.
  // McpServer's Zod processing strips raw JSON Schema properties, returning empty schemas.
  (server as any).server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: TOOLS.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    })),
  }));

  return server;
}
