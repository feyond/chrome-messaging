import { ContentTargets } from "../types";
import { CTDocumentRoute } from "./CTDocumentRoute";
import { AbstractRouteFactory } from "../messaging";

export type UserContentTargets = Omit<ContentTargets, "document">;
export class ContentRouteFactory extends AbstractRouteFactory<ContentTarget> {
	targets: ContentTargets;
	constructor(_targets: UserContentTargets) {
		super();
		this.targets = {
			..._targets,
			document: (message, sender) => new CTDocumentRoute(message, sender),
		};
	}
}
