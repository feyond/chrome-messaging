import { AbstractRoute, ContentTarget } from "@core";
import { ICTDocument } from "@client";

export class CTDocumentRoute extends AbstractRoute<ContentTarget> implements ICTDocument {
	click() {
		document.dispatchEvent(new CustomEvent(""));
	}
}
