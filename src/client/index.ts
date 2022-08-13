import { ChromeRequest, ChromeResponse, ContentTarget } from "@core";

export * from "./route";

export interface ICTDocument {
	click(): void;
}

export interface IBGContent {
	forward: (tabId: number, message: ChromeRequest<ContentTarget>) => Promise<ChromeResponse>;
}

declare global {
	interface BackgroundTargetRoutes {
		content: IBGContent;
	}

	interface ContentTargetRoutes {
		document: ICTDocument;
	}
}
