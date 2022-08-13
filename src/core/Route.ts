import { ChromeRequest } from "./types";

export type BackgroundTarget = keyof BackgroundTargetRoutes;
export type ContentTarget = keyof ContentTargetRoutes;
export type ChromeTarget = BackgroundTarget | ContentTarget;

export abstract class AbstractRoute<T extends ChromeTarget> {
	constructor(public context: ChromeRequest<T>, public readonly sender?: chrome.runtime.MessageSender) {}
}
