import {
	BackgroundTarget,
	ChromeLocation,
	ChromeRequest,
	ChromeResponse,
	ChromeTarget,
	ContentTarget,
	IBackgroundContext,
	IContentContext,
	PromiseFunctionReturnConverter,
} from "@core";

import { _debug, _error } from "@core/helpers";

const debug = _debug("client");
const error = _error("client");
type MessagingHandler<T extends ChromeTarget> = (request: ChromeRequest<T>, callback: (response: ChromeResponse) => void) => void;

export function useBackground<T extends BackgroundTarget>(target: T, from?: ChromeLocation): PromiseFunctionReturnConverter<BackgroundTargetRoutes[T]> {
	return useRoute<BackgroundTargetRoutes[T], BackgroundTarget>(
		target,
		(request, callback) => {
			if (Reflect.has(chrome, "background")) {
				const background: IBackgroundContext = Reflect.get(chrome, "background");
				return background.callMessage(request, callback);
			}
			chrome.runtime.sendMessage(request, callback);
		},
		from
	);
}

export function useContent<T extends ContentTarget>(
	target: T,
	tabId?: number,
	location?: ChromeLocation
): PromiseFunctionReturnConverter<ContentTargetRoutes[T]> {
	const contentRoute = Reflect.has(chrome, "background") ? (Reflect.get(chrome, "background") as IBackgroundContext).content : useBackground("content");
	return useRoute<ContentTargetRoutes[T], ContentTarget>(
		target,
		(request, callback) => {
			if (Reflect.has(chrome, "content")) {
				const content: IContentContext = Reflect.get(chrome, "content");
				return content.callMessage(request, callback);
			}
			useTab(tabId).then((_tabId) =>
				contentRoute
					.forward(_tabId, request)
					.then(callback)
					.catch((reason) => {
						error("forward error", reason);
						callback({
							status: false,
							message: reason,
						});
					})
			);
		},
		location
	);
}

function useRoute<IRoute, Target extends BackgroundTarget | ContentTarget>(target: Target, sendRequest: MessagingHandler<Target>, location?: ChromeLocation) {
	const proxy = {} as PromiseFunctionReturnConverter<IRoute>;
	return new Proxy(proxy, {
		get(_, fn: string) {
			return (...args: unknown[]) => {
				return new Promise((resolve, reject) => {
					const request: ChromeRequest<Target> = {
						payload: { fn, args },
						target,
						from: getLocation(location),
						tabId: chrome.devtools?.inspectedWindow?.tabId,
					};
					debug("chrome request. %O", request);
					sendRequest(request, (response: ChromeResponse) => {
						debug("chrome response: %O", response);
						if (response.status) {
							resolve(response.data);
						} else {
							reject(response.message);
						}
					});
				});
			};
		},
	});
}

export function useTab(defaultTabId?: number) {
	return new Promise<number>((resolve, reject) => {
		defaultTabId
			? resolve(defaultTabId)
			: chrome.devtools.inspectedWindow.tabId
			? resolve(chrome.devtools.inspectedWindow.tabId)
			: chrome.tabs.getCurrent().then((tab) => {
					if (!tab || !tab.id) {
						return reject("Could not retrieve current tab id");
					}
					resolve(tab.id);
			  });
	});
}

export function getLocation(location?: ChromeLocation) {
	if (Reflect.has(chrome, "background")) {
		return ChromeLocation.Background;
	}

	if (Reflect.has(chrome, "content")) {
		return ChromeLocation.Content;
	}

	if (chrome.devtools?.inspectedWindow?.tabId) {
		return ChromeLocation.Devtools;
	}

	if (!location) throw new Error("Location not specified.");

	return location;
}

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
