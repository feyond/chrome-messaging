import { MessageRouter } from "../messaging";
import { BackgroundRouteFactory, UserBackgroundTargets } from "./BackgroundRouteFactory";

class BackgroundContext {
	router?: MessageRouter<BackgroundTarget>;
}

export const background = new BackgroundContext();
export function onBackgroundMessage(_targets: UserBackgroundTargets) {
	background.router = new MessageRouter(new BackgroundRouteFactory(_targets));
	background.router.onMessage();
}

chrome.background = background;
