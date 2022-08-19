import { chrome } from "jest-chrome";
import { ChromeLocation, ChromeRequest, ContentTarget } from "@core";
import { ICTTest } from "../jest.setup";
import { content, onContentMessage } from "@content";

beforeAll(() => {
	onContentMessage({
		cTest: new (class implements ICTTest {
			findEle(selector: string): any {
				return `ELE: ${selector}`;
			}
		})(),
	});
});

describe("content", () => {
	const message: ChromeRequest<ContentTarget> = {
		target: "cTest",
		payload: {
			fn: "findEle",
			args: ["#test"],
		},
		from: ChromeLocation.Popup,
	};
	test("on content:listener message", () => {
		chrome.runtime.onMessage.callListeners(
			message,
			{},
			jest.fn((response) => {
				expect(response).toEqual({ status: true, data: "ELE: #test" });
			})
		);
	});
	test("on content:router call message", () => {
		content.callMessage(message, (response) => {
			expect(response).toEqual({ status: true, data: "ELE: #test" });
		});
	});

	test("CTDocumentRoute", (done) => {
		const message: ChromeRequest<ContentTarget> = {
			target: "document",
			payload: {
				fn: "click",
				args: [],
			},
			from: ChromeLocation.Popup,
		};

		chrome.runtime.onMessage.callListeners(
			message,
			{},
			jest.fn((response) => {
				expect(response).toEqual({ status: true, data: undefined });
				done();
			})
		);
	});
});
