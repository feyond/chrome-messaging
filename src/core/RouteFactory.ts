import { BackgroundTarget, ChromeLocation, ChromeRequest, ChromeTarget, ContentTarget } from "./types";

export type BackgroundRouteGenerators = RouteGenerators<BackgroundTarget>;
export type ContentRouteGenerators = RouteGenerators<ContentTarget>;

type TargetRoute<T extends ChromeTarget> = T extends BackgroundTarget ? BackgroundTargetRoutes[T] : T extends ContentTarget ? ContentTargetRoutes[T] : never;
type RouteGenerator<T extends ChromeTarget> = (message: ChromeRequest<T>, sender?: chrome.runtime.MessageSender) => TargetRoute<T>;
export type RouteGenerators<T extends ChromeTarget> = {
	[index in T]: TargetRoute<T> | RouteGenerator<T>;
};

export interface RouteFactory<T extends ChromeTarget> {
	createRoute(message: ChromeRequest<T>, sender?: chrome.runtime.MessageSender): TargetRoute<T>;

	validate(message: ChromeRequest<T>): boolean;
}

export abstract class AbstractRouteFactory<T extends ChromeTarget> implements RouteFactory<T> {
	abstract get targets(): RouteGenerators<T>;

	validate(message: ChromeRequest<T>): boolean {
		if (!message.target) {
			throw new Error("Message without target received");
		}

		if (!(message.target in this.targets)) {
			throw new Error(`Could not retrieve target route: ${message.target}.`);
		}

		if (!message.payload) {
			throw new Error("Message without payload received");
		}

		if (!message.payload.fn) {
			throw new Error("Message payload:fn no specified.");
		}

		if (!message.payload.args) {
			throw new Error("Message payload:args illegal.");
		}

		if (message.from === ChromeLocation.Devtools || message.from === ChromeLocation.Content) {
			if (!message.tabId && !chrome.content) {
				throw new Error("Could not retrieve tabId");
			}
		}

		return true;
	}

	createRoute(message: ChromeRequest<T>, sender?: chrome.runtime.MessageSender) {
		const target = message.target;
		if (!(target in this.targets)) {
			throw new Error(`Could not retrieve target route: ${target}.`);
		}
		const generator = this.targets[target];
		if (generator instanceof Function) {
			return generator(message, sender);
		}
		return generator as TargetRoute<T>;
	}
}
