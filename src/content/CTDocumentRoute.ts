import { AbstractRoute } from "../messaging";
import { ICTDocument } from "../types";

export class CTDocumentRoute extends AbstractRoute<ContentTarget> implements ICTDocument {
	click() {}
}

declare global {
	interface ContentTargetMap {
		document: ICTDocument;
	}
}
