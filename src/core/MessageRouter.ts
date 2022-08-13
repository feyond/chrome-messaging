import { getLogger } from "@feyond/console-logging";
import { BackgroundTarget, ChromeTarget, ContentTarget, IBGContent } from "./route";
import { ChromeLocation, ChromeRequest, ChromeResponse } from "./types";
import { RouteFactory } from "./RouteFactory";

const log = getLogger({ module: "chrome-messaging" });

export class MessageRouter<T extends ChromeTarget> {
	constructor(public factory: RouteFactory<T>) {}

	callMessage(message: ChromeRequest<T>, sendResponse: (response: ChromeResponse) => void, sender?: chrome.runtime.MessageSender) {
		if (this.match(message)) {
			log.debug("chrome message is matched", message);
			this.apply(message, sender)
				.then((value) => {
					log.debug("chrome message response", value);
					sendResponse({ status: true, data: value });
				})
				.catch((reason) => {
					log.error("", reason);
					sendResponse({
						status: false,
						message: reason instanceof Error ? reason.message : reason,
					});
				});
			return true;
		}
		log.debug("chrome message mismatch", message);
	}

	onMessage() {
		chrome.runtime.onMessage.addListener(
			(message: ChromeRequest<T>, sender: chrome.runtime.MessageSender, sendResponse: { (response: ChromeResponse): void }) => {
				const _message = this.transform(message, sender);
				return this.callMessage(_message, sendResponse, sender);
			}
		);
	}

	match(message: ChromeRequest<T>) {
		return message.target && message.payload && message.from;
	}

	getRoute(message: ChromeRequest<T>, sender?: chrome.runtime.MessageSender) {
		return this.factory.createRoute(message, sender);
	}

	apply(message: ChromeRequest<T>, sender?: chrome.runtime.MessageSender) {
		return new Promise<unknown>((resolve) => {
			this.factory.validate(message);
			const route = this.getRoute(message, sender);
			const { fn, args } = message.payload;
			if (!Reflect.has(route, fn)) {
				throw new Error(`Method[${fn}] does not exist on target:${message.target}`);
			}
			const method = Reflect.get(route, fn);
			//TODO 校验 method入参类型 与 args 是否一致
			const result = Reflect.apply(method, route, args);
			log.debug("chrome message apply result:", result);
			return result instanceof Promise ? result.then(resolve) : resolve(result);
		});
	}

	transform(message: ChromeRequest<T>, sender: chrome.runtime.MessageSender): ChromeRequest<T> {
		if (message.from === ChromeLocation.Content) {
			if (!sender.tab || !sender.tab.id) throw new Error("Could not retrieve tab:id");
			return {
				...message,
				tabId: sender.tab.id,
			};
		}
		return message;
	}
}

declare global {
	export interface IBackgroundContext {
		router?: MessageRouter<BackgroundTarget>;
		content: IBGContent;
		callMessage(request: ChromeRequest<BackgroundTarget>, callback: (response: ChromeResponse) => void): void;
	}

	export interface IContentContext {
		router?: MessageRouter<ContentTarget>;
		callMessage(request: ChromeRequest<ContentTarget>, callback: (response: ChromeResponse) => void): void;
	}
}
