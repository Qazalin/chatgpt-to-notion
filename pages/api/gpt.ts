import { NextApiRequest, NextApiResponse } from "next";
import { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import NextCors from "nextjs-cors";

import { notionCLient, DEFAULT_PAGE_ID } from "@project/utils/notion";
import { db } from "@project/utils/db";

type CollectorMessageType = {
    agentModel: string;
    userMessages: string[];
    agentMessages: string[];
    chatId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await NextCors(req, res, {
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        origin: "*",
        optionsSuccessStatus: 200,
    });

    let { chatId, userMessages, agentMessages, agentModel }: CollectorMessageType = req.body;
    const notionBlocks: BlockObjectRequest[] = [];

    // P1. Get the notion page
    let notionPageId: string;
    const existingPage = await db
        .selectFrom("notion_recorded_chats")
        .where("notion_recorded_chats.openai_id", "=", chatId)
        .selectAll()
        .limit(1)
        .executeTakeFirst();
    if (!existingPage) {
        const newPage = await notionCLient.pages.create({
            parent: {
                page_id: DEFAULT_PAGE_ID,
                type: "page_id",
            },
            properties: {
                title: [
                    {
                        text: {
                            content: "Chat", // TODO - Make this more descriptive
                        },
                    },
                    {
                        mention: {
                            date: {
                                start: new Date().toISOString().split("T")[0],
                            },
                        },
                    },
                ],
            },
            icon: {
                type: "emoji",
                emoji: "✨",
            },
        });

        notionPageId = newPage.id;
        await db
            .insertInto("notion_recorded_chats")
            .values({
                openai_id: chatId,
                notion_page_id: notionPageId,
            })
            .execute();

        notionBlocks.push({
            type: "paragraph",
            paragraph: {
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: `Created by: ${agentModel}   -   `,
                        },
                    },
                    {
                        type: "mention",
                        mention: {
                            date: {
                                start: new Date().toISOString(),
                            },
                        },
                    },
                ],
                color: "green",
            },
        });

        notionBlocks.push({
            type: "paragraph",
            paragraph: {
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: "",
                        },
                    },
                ],
            },
        });
        notionBlocks.push({
            type: "divider",
            divider: {},
        });
        notionBlocks.push({
            type: "paragraph",
            paragraph: {
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: "",
                        },
                    },
                ],
            },
        });
    } else {
        notionPageId = existingPage.notion_page_id;
    }

    // P2. Select the new messages
    if (existingPage?.last_msg) {
        const lastMsgIndex = agentMessages.indexOf(existingPage.last_msg);
        if (lastMsgIndex > -1) {
            agentMessages = agentMessages.slice(lastMsgIndex + 1);
            userMessages = userMessages.slice(lastMsgIndex + 1);
        }
    }

    for (let i = 0; i < userMessages.length; i++) {
        const userMessage = userMessages[i];
        const userMsgParagraphs = splitToParagraphs(userMessage);
        const userRichTextContent = userMsgParagraphs.map((p) => {
            return {
                text: {
                    content: p,
                },
            };
        });
        notionBlocks.push({
            type: "paragraph",
            paragraph: {
                rich_text: userRichTextContent,
                color: "gray",
            },
        });

        const agentResponse = agentMessages[i].replace("ChatGPT\n", "");
        const agentMsgParagraphs = splitToParagraphs(agentResponse);
        const agentRichTextContent = agentMsgParagraphs.map((p) => {
            return {
                text: {
                    content: p,
                },
            };
        });
        notionBlocks.push({
            type: "paragraph",
            paragraph: {
                rich_text: agentRichTextContent,
                color: "default",
            },
        });
    }

    await notionCLient.blocks.children.append({
        block_id: notionPageId,
        children: notionBlocks,
    });

    // P3. Update the last message
    await db
        .updateTable("notion_recorded_chats")
        .set({
            last_msg: agentMessages[agentMessages.length - 1],
        })
        .where("notion_recorded_chats.openai_id", "=", chatId)
        .execute();

    return res.status(200).json(notionBlocks);
}

/*
 * Split the message into paragraphs - Notion has a limit of 2K characters per paragraph
 */
function splitToParagraphs(msg: string) {
    const sentences = msg.split(".");
    const paragraphs = [];

    let currParagraph = "";
    for (let i = 0; i < sentences.length; i++) {
        // If adding the current sentence to the current paragraph would make it longer than 2K characters,
        // add the current paragraph to the list of paragraphs and start a new one
        if (currParagraph.length + sentences[i].length > 2000) {
            paragraphs.push(currParagraph);
            currParagraph = "";
        }
        currParagraph += sentences[i];
    }

    paragraphs.push(currParagraph);
    return paragraphs;
}
