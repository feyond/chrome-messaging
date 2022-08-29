import { ChromeLocation, ChromeRequest, ChromeResponse, ChromeTarget } from "./types";
import { RouteFactory } from "./RouteFactory";
import { _debug, _error } from "@core/helpers";

const debug = _debug("core");
const error = _error("core");
export abstract class Route<T extends ChromeTarget> {
	constructor(public context: ChromeRequest<T>, public readonly sender?: chrome.runtime.MessageSender) {}
}

export class MessageRouter<T extends ChromeTarget> {
	constructor(public factory: RouteFactory<T>) {}

	callMessage(message: ChromeRequest<T>, sendResponse: (response: ChromeResponse) => void, sender?: chrome.runtime.MessageSender) {
		if (this.match(message)) {
			debug("message is matched %O", message);
			this.apply(message, sender)
				.then((value) => {
					debug("message response %O", value);
					sendResponse({ status: true, data: value });
				})
				.catch((reason) => {
					error("catch", reason);
					sendResponse({
						status: false,
						message: reason instanceof Error ? reason.message : reason,
					});
				});
			return true;
		}
		debug("message mismatch %O", message);
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
		return new Promise<unknown>((resolve, reject) => {
			this.factory.validate(message);
			const route = this.getRoute(message, sender);
			const { fn, args } = message.payload;
			if (!Reflect.has(route, fn)) {
				throw new Error(`Method[${fn}] does not exist on target:${message.target}`);
			}
			const method = Reflect.get(route, fn);
			//TODO 校验 method入参类型 与 args 是否一致
			const result = Reflect.apply(method, route, args);
			return result instanceof Promise ? result.then(resolve).catch(reject) : resolve(result);
		});
	}

	transform(message: ChromeRequest<T>, sender: chrome.runtime.MessageSender): ChromeRequest<T> {
		if (message.from === ChromeLocation.Content) {
			if (!sender?.tab?.id) throw new Error("Could not retrieve tab:id");
			return {
				...message,
				tabId: sender.tab.id,
			};
		}
		return message;
	}
}
