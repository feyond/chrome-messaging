import { ContentRouteFactory, UserContentRouteGenerators } from "./ContentRouteFactory";
import { ChromeRequest, ChromeResponse, ContentTarget, IContentContext, MessageRouter } from "@core";

export class ContentContext implements IContentContext {
	router?: MessageRouter<ContentTarget>;

	callMessage(request: ChromeRequest<ContentTarget>, callback: (response: ChromeResponse) => void) {
		this.router?.callMessage(request, callback);
	}
}

const content = new ContentContext();

export function onContentMessage(_targets: UserContentRouteGenerators) {
	Reflect.set(chrome, "content", content);
	content.router = new MessageRouter(new ContentRouteFactory(_targets));
	content.router.onMessage();
}
