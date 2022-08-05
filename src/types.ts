export type PromiseConverter<T> = T extends Promise<any> ? T : Promise<T>;

export type PromiseFunctionReturnConverter<T> = {
	[fn in keyof T]: T[fn] extends (...args: any[]) => any ? (...args: Parameters<T[fn]>) => PromiseConverter<ReturnType<T[fn]>> : T[fn];
};
export enum Location {
	Background,
	Content,
	Devtools,
	// Popup,
	// Options,
	// IFrame,
	// External,
}

export interface Payload {
	fn: string;
	args: any[];
}

export type ChromeRequest<T extends BackgroundTarget | ContentTarget> =
	| {
			payload: Payload;
			from: Location.Content | Location.Devtools;
			tabId: number;
			target: T;
	  }
	| {
			payload: Payload;
			from: Location.Background;
			target: T;
	  };

export type ChromeResponse = SuccessResponse | ErrorResponse;

export interface SuccessResponse {
	status: true;
	data: any;
}

export interface ErrorResponse {
	status: false;
	message: string;
}

declare global {
	interface BackgroundTargetMap {}

	type BackgroundTarget = keyof BackgroundTargetMap;

	interface ContentTargetMap {}

	type ContentTarget = keyof ContentTargetMap;
}

export type BackgroundTargets = Targets<BackgroundTarget>;

export type ContentTargets = Targets<ContentTarget>;

export type Targets<T extends ContentTarget | BackgroundTarget> = {
	[index in T]: (
		message: ChromeRequest<T>,
		sender: chrome.runtime.MessageSender
	) => T extends BackgroundTarget ? BackgroundTargetMap[T] : T extends ContentTarget ? ContentTargetMap[T] : never;
};

export interface RouteFactory<T extends BackgroundTarget | ContentTarget> {
	createRoute(
		message: ChromeRequest<T>,
		sender: chrome.runtime.MessageSender
	): T extends BackgroundTarget ? BackgroundTargetMap[T] : T extends ContentTarget ? ContentTargetMap[T] : never;
	validate(message: ChromeRequest<T>): boolean;
}

export interface IBGContent {
	forward: (tabId: number, message: ChromeRequest<ContentTarget>) => Promise<ChromeResponse>;
}

export interface ICTDocument {
	click(): void;
}
