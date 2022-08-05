export enum Location {
	Background,
	Content,
	Popup,
	Devtools,
	IFrame,
	External,
}
export interface FromBackground {
	readonly location: Location.Background;
}
export interface FromContent {
	readonly location: Location.Content;
	readonly tabId: number;
}
export interface FromPopup {
	readonly location: Location.Popup;
}
export interface FromDevtools {
	readonly location: Location.Devtools;
	readonly tabId: number;
}

export type Source = FromBackground | FromContent | FromPopup | FromDevtools;

export interface Payload {
	fn: string;
	args: any[];
}

export interface ChromeRequest<T extends BackgroundTarget | ContentTarget> {
	payload: Payload;
	source: Source;
	target: T;
}

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
