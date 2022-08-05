import { MessageRouter } from "../messaging";
import { ContentRouteFactory, UserContentTargets } from "./ContentRouteFactory";

class ContentContext {
	router?: MessageRouter<ContentTarget>;
}

export const content = new ContentContext();
export function onContentMessage(_targets: UserContentTargets) {
	content.router = new MessageRouter(new ContentRouteFactory(_targets));
	content.router.onMessage();
}

chrome.content = new ContentContext();
