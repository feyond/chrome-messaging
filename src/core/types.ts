import { IBGContent } from "@client";
import { MessageRouter } from "@core/MessageRouter";

export type PromiseConverter<T> = T extends Promise<unknown> ? T : Promise<T>;

export type PromiseFunctionReturnConverter<T> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[fn in keyof T]: T[fn] extends (...args: any[]) => any ? (...args: Parameters<T[fn]>) => PromiseConverter<ReturnType<T[fn]>> : T[fn];
};

export enum ChromeLocation {
	Background,
	Content,
	Devtools,
	Popup,
	Options,
	IFrame,
	External,
}

export interface Payload {
	fn: string;
	args: unknown[];
}

export interface ChromeRequest<T extends ChromeTarget> {
	payload: Payload;
	from: ChromeLocation;
	tabId?: number;
	target: T;
}

export type ChromeResponse = SuccessResponse | ErrorResponse;

export interface SuccessResponse {
	status: true;
	data: unknown;
}

export interface ErrorResponse {
	status: false;
	message: string;
}

export type BackgroundTarget = keyof BackgroundTargetRoutes;
export type ContentTarget = keyof ContentTargetRoutes;
export type ChromeTarget = BackgroundTarget | ContentTarget;

export interface IBackgroundContext {
	router?: MessageRouter<BackgroundTarget>;
	content: IBGContent;
	callMessage(request: ChromeRequest<BackgroundTarget>, callback: (response: ChromeResponse) => void): void;
}

export interface IContentContext {
	router?: MessageRouter<ContentTarget>;
	callMessage(request: ChromeRequest<ContentTarget>, callback: (response: ChromeResponse) => void): void;
}
