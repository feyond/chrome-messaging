import { CTDocumentRoute } from "./CTDocumentRoute";
import { AbstractRouteFactory, ContentRouteGenerators, ContentTarget } from "@core";

export type UserContentRouteGenerators = Omit<ContentRouteGenerators, "document">;

export class ContentRouteFactory extends AbstractRouteFactory<ContentTarget> {
	targets: ContentRouteGenerators;

	constructor(_targets: UserContentRouteGenerators) {
		super();
		this.targets = {
			..._targets,
			document: (message, sender) => new CTDocumentRoute(message, sender),
		};
	}
}
