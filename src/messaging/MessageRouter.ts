import { ChromeRequest, ChromeResponse, Location, RouteFactory } from "../types";

export class MessageRouter<T extends BackgroundTarget | ContentTarget> {
	constructor(public factory: RouteFactory<T>) {}
	onMessage() {
		chrome.runtime.onMessage.addListener(
			(message: ChromeRequest<T>, sender: chrome.runtime.MessageSender, sendResponse: { (response: ChromeResponse): void }) => {
				// console.debug(
				// 	`${!!chrome.background ? "background" : "content"} message:`,
				// 	message
				// );
				const _message = this.transform(message, sender);
				if (this.match(_message)) {
					this.apply(_message, sender)
						.then((value) => sendResponse({ status: true, data: value }))
						.catch((reason) =>
							sendResponse({
								status: false,
								message: reason instanceof Error ? reason.message : reason,
							})
						);

					return true;
				}
			}
		);
	}

	match(message: ChromeRequest<T>) {
		if (!message.target || !message.payload || !message.source) return false;
		return this.factory.validate(message);
	}

	getRoute(message: ChromeRequest<T>, sender: chrome.runtime.MessageSender) {
		return this.factory.createRoute(message, sender);
	}

	apply(message: ChromeRequest<T>, sender: chrome.runtime.MessageSender) {
		return new Promise<any>((resolve) => {
			const route = this.getRoute(message, sender);
			const { fn, args } = message.payload;
			const method = Reflect.get(route, fn);
			let result = Reflect.apply(method, route, args);
			return result instanceof Promise ? result.then(resolve) : resolve(result);
		});
	}

	transform(message: ChromeRequest<T>, sender: chrome.runtime.MessageSender): ChromeRequest<T> {
		if (message.source.location === Location.Content) {
			return {
				...message,
				source: { location: Location.Content, tabId: sender.tab!.id! },
			};
		}
		return message;
	}
}
