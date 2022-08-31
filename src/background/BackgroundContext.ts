import { BackgroundRouteFactory, UserBackgroundRouteGenerators } from "./BackgroundRouteFactory";
import { BGContentRoute } from "./BGContentRoute";
import { BackgroundTarget, MessageRouter, ChromeRequest, ChromeResponse, IBackgroundContext } from "@core";
import { IBGContent } from "@client";

class BackgroundContext implements IBackgroundContext {
	router?: MessageRouter<BackgroundTarget>;
	content: IBGContent = new BGContentRoute();

	callMessage(request: ChromeRequest<BackgroundTarget>, callback: (response: ChromeResponse) => void) {
		this.router?.callMessage(request, callback);
	}
}

const background = new BackgroundContext();

export function onBackgroundMessage(_targets: UserBackgroundRouteGenerators) {
	Reflect.set(chrome, "background", background);
	background.router = new MessageRouter(new BackgroundRouteFactory(background.content, _targets));
	background.router.onMessage();
}
