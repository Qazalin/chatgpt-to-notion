# ChatGPT to Notion

## Overview

chat.openai.com currently doesn't have builtin search and organization functionality. All the chats are listed in a very basic interface. This makes it really hard to organize and search through past chats.
This _experimental_ project attempts to solve this problem by creating a script paird with an API to send messages from ChatGPT to your Notion account.



https://user-images.githubusercontent.com/77887910/235661634-22a1c99c-48ff-4dce-a688-73078e134dbc.mp4




## Features

- Automatic sync between ChatGPT conversations and Notion
- Context about the latest synced message in every conversation so that all chats have exactly one page on notion and we only save the new messages
- Differentiate between a user and an agent message in the notion blocks using colors

**future work**

- Support for code blocks
- Better visual seperation and easier reading
- Builtin organization of chats in Notion
- More block support (ie. callouts, headings, etc)

## Getting started

### Notion setup

1. Create a dev account on Notion and get a token with write access.
2. Add the token to the env variable `NOTION_SECRET` in .env.local
3. Create a page inside notion, (ie. Chats with GPT) - and get the ID of the page. The id is located here in the URL of the page:

```
https://www.notion.so/<org>/<name>-<page-id>
```

Enter `page-id`'s value in `NOTION_BASE_PAGE_ID` - This will be the base page where all your chats will be stored.

### Planetscale setup

We use planetscale to keep track of the mapping of chatgpt chat ids to notion pages + what was the latest msg we synced

1. Create a Planetscale account and a database
2. Run `./scripts/setup.sql` in a shell
3. Get the DB url and add it to .env.local as `DATABASE_URL`

### Vercel setup

This is optional, you can also run this locally and just add localhost's url as the url we send data to.

1. Setup a deployment and fill in the env variables
1. Deploy and get the URL

### ChatGPT setup

1. Go to a Chat url like `chat.openai.com/c/<chat-id>` - if you're at `chat.openai.com` the second feature doesn't work.
2. Paste in the script at `./scripts/saveChats.js` to the devtools console

As new messages flow in, the code will auto-save the content to your notion page.
