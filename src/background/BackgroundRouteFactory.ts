import { BackgroundTargets } from "../types";
import { AbstractRouteFactory } from "../messaging";
import { BGContentRoute } from "./BGContentRoute";

export type UserBackgroundTargets = Omit<BackgroundTargets, "content">;
export class BackgroundRouteFactory extends AbstractRouteFactory<BackgroundTarget> {
	targets: BackgroundTargets;
	constructor(_targets: UserBackgroundTargets) {
		super();
		this.targets = {
			..._targets,
			content: () => new BGContentRoute(),
		};
	}
}
