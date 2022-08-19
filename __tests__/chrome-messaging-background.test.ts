import { chrome } from "jest-chrome";
import { background, onBackgroundMessage } from "@background";
import { BackgroundTarget, ChromeLocation, ChromeRequest, ChromeResponse, ContentTarget } from "@core";
import { IBGTest } from "../jest.setup";

beforeAll(() => {
	onBackgroundMessage({
		iTest: new (class implements IBGTest {
			hello(): string {
				throw new Error("test route throw error");
			}

			add(x: number, y: number): number {
				return x + y;
			}
		})(),
	});
});

describe("background", () => {
	test("on background:listener message", () => {
		const message: ChromeRequest<BackgroundTarget> = {
			target: "iTest",
			payload: {
				fn: "hello",
				args: [],
			},
			from: ChromeLocation.Popup,
		};
		chrome.runtime.onMessage.callListeners(
			message,
			{},
			jest.fn((response) => {
				expect(response).toEqual({ status: false, message: "test route throw error" });
			})
		);
	});
	test("on background:router call message", () => {
		const message: ChromeRequest<BackgroundTarget> = {
			target: "iTest",
			payload: {
				fn: "add",
				args: [1, 2],
			},
			from: ChromeLocation.Popup,
		};
		background.callMessage(message, (response) => {
			expect(response).toEqual({ status: true, data: 3 });
		});
	});

	test("BGContentRoute", (done) => {
		const toContent: ChromeRequest<ContentTarget> = {
			target: "document",
			payload: {
				fn: "test",
				args: [],
			},
			from: ChromeLocation.Popup,
		};
		const message: ChromeRequest<BackgroundTarget> = {
			target: "content",
			payload: {
				fn: "forward",
				args: [123, toContent],
			},
			from: ChromeLocation.Popup,
		};

		const callback = jest.fn((response) => {
			expect(response).toEqual({ status: true, data: { status: true, data: "DOM Test" } });
			done();
		});
		const sendContent = (tabId: number, message: ChromeRequest<ContentTarget>, responseCallback: (response: ChromeResponse) => void) => {
			expect(tabId).toEqual(123);
			expect(message).toEqual(toContent);
			responseCallback({ status: true, data: "DOM Test" });
		};
		chrome.tabs.sendMessage.mockImplementation(sendContent as typeof chrome.tabs.sendMessage);

		chrome.runtime.onMessage.callListeners(message, {}, callback);
	});
});
