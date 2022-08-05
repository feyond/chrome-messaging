import { MessageRouter } from "../messaging";
import { BackgroundRouteFactory, UserBackgroundTargets } from "./BackgroundRouteFactory";
import {IBGContent} from "../types";
import {BGContentRoute} from "./BGContentRoute";

export class BackgroundContext {
	router?: MessageRouter<BackgroundTarget>;
	content: IBGContent = new BGContentRoute();

}

export const background = new BackgroundContext();
export function onBackgroundMessage(_targets: UserBackgroundTargets) {
	background.router = new MessageRouter(new BackgroundRouteFactory(_targets));
	background.router.onMessage();
}

chrome.background = background;
