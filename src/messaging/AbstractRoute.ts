import { ChromeRequest } from "../types";

export abstract class AbstractRoute<T extends ContentTarget | BackgroundTarget> {
	constructor(public context: ChromeRequest<T>, public readonly sender: chrome.runtime.MessageSender) {}
}
