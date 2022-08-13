import { ChromeTarget } from "./Route";

export type PromiseConverter<T> = T extends Promise<unknown> ? T : Promise<T>;

export type PromiseFunctionReturnConverter<T> = {
	[fn in keyof T]: T[fn] extends (...args: unknown[]) => unknown ? (...args: Parameters<T[fn]>) => PromiseConverter<ReturnType<T[fn]>> : T[fn];
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
	tabId: number;
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
