import { chrome } from "jest-chrome";
import { setDefaultLevel } from "@feyond/console-logging";
import { onBackgroundMessage } from "@background";
import { ChromeLocation, ChromeResponse } from "@core";

declare global {
	interface BackgroundTargetRoutes {
		iTest: ITest;
	}
}

interface ITest {
	add(x: number, y: number): number;
}

beforeAll(() => {
	setDefaultLevel("debug");
	onBackgroundMessage({
		iTest: () =>
			new (class implements ITest {
				add(x: number, y: number): number {
					return x + y;
				}
			})(),
	});
});

describe("@feyond/chrome-messaging-background", () => {
	test("chrome message mismatch", () => {
		const sendResponseSpy = jest.fn();
		chrome.runtime.onMessage.callListeners({ greeting: "hello" }, {}, sendResponseSpy);
		expect(sendResponseSpy).not.toBeCalled();
	});

	describe("chrome message match", () => {
		beforeEach(() => {
			Reflect.set(chrome.devtools.inspectedWindow, "tabId", 1);
		});
		afterEach(() => {
			Reflect.deleteProperty(chrome.devtools.inspectedWindow, "tabId");
		});
		test("Could not retrieve target", (done) => {
			const sendResponse = (response: ChromeResponse) => {
				expect(response).not.toBeNull();
				expect(response).toMatchObject({
					status: false,
					message: "Could not retrieve target route: hello.",
				});
				done();
			};
			chrome.runtime.onMessage.callListeners(
				{ payload: { fn: "add", args: [1, 2] }, target: "hello", from: ChromeLocation.Devtools, tabId: 1 },
				{},
				sendResponse
			);
		});
		test("Message payload:fn no specified", (done) => {
			const sendResponse = (response: ChromeResponse) => {
				expect(response).toMatchObject({
					status: false,
					message: "Message payload:fn no specified.",
				});
				done();
			};
			chrome.runtime.onMessage.callListeners(
				{
					payload: { args: [1, 2] },
					target: "iTest",
					from: ChromeLocation.Devtools,
					tabId: 1,
				},
				{},
				sendResponse
			);
		});
		test("Message payload:args illegal.", (done) => {
			const sendResponse = (response: ChromeResponse) => {
				expect(response).toMatchObject({
					status: false,
					message: "Message payload:args illegal.",
				});
				done();
			};
			chrome.runtime.onMessage.callListeners(
				{
					payload: { fn: "add" },
					target: "iTest",
					from: ChromeLocation.Devtools,
					tabId: 1,
				},
				{},
				sendResponse
			);
		});
		test("Method not exists.", (done) => {
			const fn = "minus",
				target = "iTest";
			const sendResponse = (response: ChromeResponse) => {
				expect(response).toMatchObject({
					status: false,
					message: `Method[${fn}] does not exist on target:${target}`,
				});
				done();
			};
			chrome.runtime.onMessage.callListeners(
				{
					payload: { fn, args: [1, 2] },
					target,
					from: ChromeLocation.Devtools,
					tabId: 1,
				},
				{},
				sendResponse
			);
		});

		// test("Method payload:args type illegal.", (done) => {
		// 	const fn = "add",
		// 		target = "iTest";
		// 	const sendResponse = (response: ChromeResponse) => {
		// 		expect(response).toMatchObject({
		// 			status: false,
		// 			message: expect.any(String),
		// 		});
		// 		done();
		// 	};
		// 	chrome.runtime.onMessage.callListeners({ payload: { fn, args: [1] }, target, from: ChromeLocation.Devtools, tabId: 1 }, {}, sendResponse);
		// });
		test("message response success.", (done) => {
			const fn = "add",
				target = "iTest";
			const sendResponse = (response: ChromeResponse) => {
				expect(response).toMatchObject({
					status: true,
					data: 3,
				});
				done();
			};
			chrome.runtime.onMessage.callListeners(
				{
					payload: { fn, args: [1, 2] },
					target,
					from: ChromeLocation.Devtools,
					tabId: 1,
				},
				{},
				sendResponse
			);
		});
	});
});
