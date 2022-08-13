import { AbstractRouteFactory, BackgroundRouteGenerators, BackgroundTarget, IBGContent } from "@core";

export type UserBackgroundRouteGenerators = Omit<BackgroundRouteGenerators, "content">;

export class BackgroundRouteFactory extends AbstractRouteFactory<BackgroundTarget> {
	targets: BackgroundRouteGenerators;

	constructor(content: IBGContent, _targets: UserBackgroundRouteGenerators) {
		super();
		this.targets = {
			..._targets,
			content,
		};
	}
}
