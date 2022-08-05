import { ChromeRequest, RouteFactory, Targets } from "../types";

export abstract class AbstractRouteFactory<T extends BackgroundTarget | ContentTarget> implements RouteFactory<T> {
	abstract get targets(): Targets<T>;

	validate(message: ChromeRequest<T>): boolean {
		if (!(message.target in this.targets)) {
			throw new Error(`Could not retrieve target route: ${message.target}.`);
		}

		if (!message.payload.fn) {
			throw new Error(`Message payload:fn no specified.`);
		}

		if (!message.payload.args) {
			throw new Error(`Message payload:args illegal.`);
		}

		if (!message.source.location) {
			throw new Error(`Message source:location no specified.`);
		}
		return true;
	}

	createRoute(
		message: ChromeRequest<T>,
		sender: chrome.runtime.MessageSender
	): T extends BackgroundTarget ? BackgroundTargetMap[T] : T extends ContentTarget ? ContentTargetMap[T] : never {
		let target = message.target;
		if (!(target in this.targets)) {
			throw new Error(`Could not retrieve target route: ${target}.`);
		}
		return this.targets[target](message, sender);
	}
}
