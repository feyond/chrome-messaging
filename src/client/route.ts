import { getLogger } from "@feyond/console-logging";
import { BackgroundTarget, ChromeTarget, ContentTarget, ChromeLocation, ChromeRequest, ChromeResponse, PromiseFunctionReturnConverter } from "@core";

const log = getLogger({ module: "chrome-messaging-client" });
type MessagingHandler<T extends ChromeTarget> = (request: ChromeRequest<T>, callback: (response: ChromeResponse) => void) => void;

export function useBackground<T extends BackgroundTarget>(target: T, from?: ChromeLocation): PromiseFunctionReturnConverter<BackgroundTargetRoutes[T]> {
	return useRoute<BackgroundTargetRoutes[T], BackgroundTarget>(
		target,
		(request, callback) => {
			if (chrome.background) {
				return chrome.background.callMessage(request, callback);
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
	const contentRoute = !chrome.background ? useBackground("content") : chrome.background.content;
	return useRoute<ContentTargetRoutes[T], ContentTarget>(
		target,
		(request, callback) => {
			if (chrome.content) {
				return chrome.content.callMessage(request, callback);
			}
			useTab(tabId).then((_tabId) => contentRoute.forward(_tabId, request).then(callback));
		},
		location
	);
}

function useRoute<IRoute, Target extends BackgroundTarget | ContentTarget>(target: Target, sendRequest: MessagingHandler<Target>, location?: ChromeLocation) {
	const proxy = {} as PromiseFunctionReturnConverter<IRoute>;
	return new Proxy(proxy, {
		get(_, fn: string) {
			return (...args: unknown[]) =>
				new Promise((resolve, reject) => {
					const callback = (response: ChromeResponse) => {
						if (response.status) {
							resolve(response.data);
						} else {
							reject(response.message);
						}
					};
					const request: ChromeRequest<Target> = {
						payload: { fn, args },
						target,
						from: getLocation(location),
						tabId: chrome.devtools?.inspectedWindow?.tabId,
					};
					log.debug("chrome request.", request);
					sendRequest(request, callback);
				});
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
						return reject("Could not retrieve tab id");
					}
					resolve(tab.id);
			  });
	});
}

export function getLocation(location?: ChromeLocation) {
	if (chrome.background) {
		return ChromeLocation.Background;
	}

	if (chrome.content) {
		return ChromeLocation.Content;
	}

	if (chrome.devtools?.inspectedWindow?.tabId) {
		return ChromeLocation.Devtools;
	}

	if (!location) throw new Error("From Location not specified");

	return location;
}
