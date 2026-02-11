# @node2flow/notion-mcp

MCP server for the Notion API — manage pages, blocks, databases, data sources, comments, and users.

## Quick Start

### Claude Desktop / Cursor / VS Code

Add to your MCP client config:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@node2flow/notion-mcp"],
      "env": {
        "NOTION_API_KEY": "ntn_your_integration_token"
      }
    }
  }
}
```

### HTTP Mode (Streamable HTTP)

```bash
NOTION_API_KEY=ntn_xxx npx @node2flow/notion-mcp --http
```

MCP endpoint: `http://localhost:3000/mcp`

### Cloudflare Worker

```
https://notion-mcp-community.node2flow.net/mcp?NOTION_API_KEY=ntn_xxx
```

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `NOTION_API_KEY` | Yes | Notion Internal Integration Token (starts with `ntn_` or `secret_`) |

### Getting a Notion API Key

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Give it a name and select the workspace
4. Copy the **Internal Integration Token**
5. Share your pages/databases with the integration (click "..." > "Connections" > add your integration)

## Tools (25)

### Search (1)
| Tool | Description |
|------|-------------|
| `notion_search` | Search pages and databases by title |

### Pages (5)
| Tool | Description |
|------|-------------|
| `notion_create_page` | Create a new page |
| `notion_get_page` | Get page by ID |
| `notion_update_page` | Update page properties, icon, cover |
| `notion_move_page` | Move page to new parent |
| `notion_get_page_property` | Get a specific property value |

### Blocks (5)
| Tool | Description |
|------|-------------|
| `notion_get_block` | Get a block by ID |
| `notion_get_block_children` | Read page/block content |
| `notion_append_blocks` | Add content blocks to page/block |
| `notion_update_block` | Update block content |
| `notion_delete_block` | Delete (archive) a block |

### Data Sources (5)
| Tool | Description |
|------|-------------|
| `notion_create_data_source` | Create a data source table |
| `notion_get_data_source` | Get data source by ID |
| `notion_update_data_source` | Update data source schema |
| `notion_query_data_source` | Query pages with filters/sorts |
| `notion_list_data_source_templates` | List data source templates |

### Databases — Legacy (3)
| Tool | Description |
|------|-------------|
| `notion_get_database` | Get database by ID |
| `notion_query_database` | Query database with filters/sorts |
| `notion_create_database` | Create inline database in page |

### Comments (3)
| Tool | Description |
|------|-------------|
| `notion_create_comment` | Comment on page or reply to thread |
| `notion_get_comments` | List comments on page/block |
| `notion_get_comment` | Get single comment by ID |

### Users (3)
| Tool | Description |
|------|-------------|
| `notion_list_users` | List all workspace users |
| `notion_get_user` | Get user by ID |
| `notion_get_bot_user` | Get bot integration info |

## License

MIT
