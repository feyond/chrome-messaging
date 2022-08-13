import { ContentTarget, ChromeRequest, ChromeResponse } from "@core";
import { IBGContent } from "@client";

export class BGContentRoute implements IBGContent {
	forward(tabId: number, message: ChromeRequest<ContentTarget>): Promise<ChromeResponse> {
		return new Promise<ChromeResponse>((resolve) => {
			chrome.tabs.sendMessage(tabId, message, resolve);
		});
	}
}
