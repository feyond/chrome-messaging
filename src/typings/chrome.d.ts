import {BackgroundContext} from "../background";
import {ContentContext} from "../content";

declare global {
	namespace chrome {
		declare let background: BackgroundContext;
		declare let content: ContentContext;
	}
}
