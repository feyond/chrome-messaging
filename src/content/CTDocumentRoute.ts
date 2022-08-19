import { Route, ContentTarget } from "@core";
import { ICTDocument } from "@client";

export class CTDocumentRoute extends Route<ContentTarget> implements ICTDocument {
	click() {
		// document.dispatchEvent(new CustomEvent(""));
	}
}
