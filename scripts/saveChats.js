const CLASSES = {
    MAIN_CHAT: "relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1",
    AGENT_MODEL:
        "flex w-full items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300",
    USER_MESSAGE:
        "group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 dark:bg-gray-800",
    AGENT_MESSAGE:
        "group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 bg-gray-50 dark:bg-[#444654]",
    USER_EDIT_BUTTON:
        "p-1 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400",
    AGENT_CLIPBOARD:
        "flex ml-auto gap-2 h-full w-full rounded-md p-1 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400",
};

function classListToSelector(classList) {
    return classList
        .split(/\s+/)
        .map((className) => `.${className.replace(/[/:]/g, "\\$&").replace("[", "\\[\\").replace("]", "\\]")}`)
        .join("");
}

// V1 is ONLY raw text, no markup
function collectMessagesV1() {
    const mainChatElement = document.querySelector(classListToSelector(CLASSES.MAIN_CHAT));
    const agentModelElement = mainChatElement.querySelector(classListToSelector(CLASSES.AGENT_MODEL));
    const userMessagesElement = Array.from(mainChatElement.querySelectorAll(classListToSelector(CLASSES.USER_MESSAGE)));
    const agentMessagesElement = Array.from(
        mainChatElement.querySelectorAll(classListToSelector(CLASSES.AGENT_MESSAGE))
    );

    const agentModel = agentModelElement.innerText;
    const userMessages = userMessagesElement.map((uel) => uel.innerText);
    const agentMessages = agentMessagesElement.map((ael) => ael.innerText);

    const chatId = window.location.href.split("/").pop();

    const data = {
        chatId,
        agentModel,
        userMessages,
        agentMessages,
    };

    return data;
}

function sendXhr(route, data) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `http://localhost:3003/api${route}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}

function save() {
    const data = collectMessagesV1();
    sendXhr("/gpt", data);
}

const elements = [];
const observer = new MutationObserver(function (mutationsList) {
    for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
            for (let node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (JSON.stringify(node.classList) === '{"0":"h-4","1":"w-4","2":"mr-1"}') {
                        // This is the "regenerate response" button that shows up when a pair of user msg and agent msg is done rendering, this is when we auto-save
                        save();
                    }
                }
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
