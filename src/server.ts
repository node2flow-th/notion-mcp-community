/**
 * Shared MCP Server — used by both Node.js (index.ts) and CF Worker (worker.ts)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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
    version: '1.0.0',
  });

  let client: NotionClient | null = null;

  for (const tool of TOOLS) {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema as Record<string, unknown>,
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

  return server;
}
