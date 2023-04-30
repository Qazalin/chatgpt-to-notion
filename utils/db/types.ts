import { Generated } from "kysely";

export interface NotionRecordedChats {
    id: Generated<number>;
    notion_page_id: string;
    openai_id: string;
    last_msg?: string;
}

export interface Database {
    notion_recorded_chats: NotionRecordedChats;
}
