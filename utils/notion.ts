import { Client as NotionClient } from "@notionhq/client";

export const notionCLient = new NotionClient({
    auth: process.env.NOTION_SECRET,
});
export const DEFAULT_PAGE_ID = process.env.NOTION_BASE_PAGE_ID!;
