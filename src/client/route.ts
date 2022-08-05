import { ChromeRequest, ChromeResponse, Location, PromiseFunctionReturnConverter } from "../types";

type MessagingHandler<T extends BackgroundTarget | ContentTarget> = (request: ChromeRequest<T>, callback: (response: ChromeResponse) => void) => void;

export function useBackground<T extends BackgroundTarget = BackgroundTarget>(target: T): PromiseFunctionReturnConverter<BackgroundTargetMap[T]> {
	return useRoute<BackgroundTargetMap[T], BackgroundTarget>(target, (request, callback) => {
		chrome.runtime.sendMessage(request, callback);
	});
}

export function useContent<T extends ContentTarget = ContentTarget>(target: T, tabId?: number): PromiseFunctionReturnConverter<ContentTargetMap[T]> {
	const contentRoute = !chrome.background ? useBackground("content") : chrome.background.content;
	return useRoute<ContentTargetMap[T], ContentTarget>(target, (request, callback) => {
		useTab(tabId).then((_tabId) => contentRoute.forward(_tabId, request).then(callback));
	});
}

function useRoute<IRoute, Target extends BackgroundTarget | ContentTarget>(target: Target, sendRequest: MessagingHandler<Target>) {
	const proxy = {} as PromiseFunctionReturnConverter<IRoute>;
	return new Proxy(proxy, {
		get(_, fn: string) {
			return (...args: any[]) =>
				new Promise((resolve, reject) => {
					let callback = (response: ChromeResponse) => {
						// TODO log print request response error
						// console.debug("content message response:", response);
						if (response.status) {
							resolve(response.data);
						} else {
							reject(response.message);
						}
					};
					const request: ChromeRequest<Target> = { payload: { fn, args }, target, from: getLocation(), tabId: chrome.devtools.inspectedWindow.tabId };
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

export function getLocation(): Location {
	if (chrome.background) {
		return Location.Background;
	}

	if (chrome.content) {
		return Location.Content;
	}

	if (chrome.devtools.inspectedWindow.tabId) {
		return Location.Devtools;
	}

	throw new Error("Could not retrieve location.");
}
