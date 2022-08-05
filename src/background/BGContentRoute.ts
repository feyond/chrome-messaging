import { ChromeRequest, ChromeResponse, IBGContent } from "../types";

export class BGContentRoute implements IBGContent {
	forward(tabId: number, message: ChromeRequest<ContentTarget>): Promise<ChromeResponse> {
		return new Promise<ChromeResponse>((resolve) => {
			chrome.tabs.sendMessage(tabId, message, resolve);
		});
	}
}

declare global {
	interface BackgroundTargetMap {
		content: IBGContent;
	}
}
