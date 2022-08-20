import { chrome } from "jest-chrome";
import { getLocation, useBackground, useContent, useTab } from "@client";
import { BackgroundTarget, ChromeLocation, ChromeRequest, ChromeResponse } from "@core";

describe("client", () => {
	describe("getLocation", () => {
		it("not specified.", () => {
			expect(() => getLocation()).toThrow("Location not specified.");
		});
		it("background", () => {
			Reflect.set(chrome, "background", {});
			expect(getLocation()).toEqual(ChromeLocation.Background);
			Reflect.deleteProperty(chrome, "background");
		});
		describe("content", () => {
			Reflect.set(chrome, "content", {});
			expect(getLocation()).toEqual(ChromeLocation.Content);
			Reflect.deleteProperty(chrome, "content");
		});
		describe("devtools", () => {
			Reflect.set(chrome.devtools.inspectedWindow, "tabId", 10);
			expect(getLocation()).toEqual(ChromeLocation.Devtools);
			Reflect.deleteProperty(chrome.devtools.inspectedWindow, "tabId");
		});
		it("Specified.", () => {
			expect(getLocation(ChromeLocation.Popup)).toEqual(ChromeLocation.Popup);
		});
	});

	describe("useTab", () => {
		it("when devtools", () => {
			Reflect.set(chrome.devtools.inspectedWindow, "tabId", 10);
			expect(useTab()).resolves.toEqual(10);
			Reflect.deleteProperty(chrome.devtools.inspectedWindow, "tabId");
		});

		it("user specified", () => {
			expect(useTab(11)).resolves.toEqual(11);
		});

		it("current window current tab error", (done) => {
			const tabPromise = Promise.resolve({} as chrome.tabs.Tab);
			const mockGetCurrent = jest.fn(() => tabPromise);
			chrome.tabs.getCurrent.mockImplementation(mockGetCurrent as typeof chrome.tabs.getCurrent);
			useTab().catch((reason) => {
				expect(reason).toEqual("Could not retrieve current tab id");
				done();
			});
			expect(mockGetCurrent).toBeCalled();
			expect(mockGetCurrent).toReturnWith(tabPromise);
		});

		it("current window current tab", () => {
			const tabPromise = Promise.resolve({ id: 12 } as chrome.tabs.Tab);
			const mockGetCurrent = jest.fn(() => tabPromise);
			chrome.tabs.getCurrent.mockImplementation(mockGetCurrent as typeof chrome.tabs.getCurrent);
			expect(useTab()).resolves.toEqual(12);
			expect(mockGetCurrent).toBeCalled();
			expect(mockGetCurrent).toReturnWith(tabPromise);
		});
	});

	describe("useBackground", () => {
		it("from background", (done) => {
			const route = useBackground("iTest");
			Reflect.set(chrome, "background", {
				callMessage: jest.fn((request, callback) => {
					expect(request).toEqual({
						target: "iTest",
						from: ChromeLocation.Background,
						tabId: undefined,
						payload: {
							fn: "add",
							args: [1, 2],
						},
					});
					callback({ status: true, data: 3 });
					done();
				}),
			});
			expect(route.add(1, 2)).resolves.toEqual(3);
			Reflect.deleteProperty(chrome, "background");
		});
		it("from popup", (done) => {
			const route = useBackground("iTest", ChromeLocation.Popup);

			const mockSendMessage = (message: ChromeRequest<BackgroundTarget>, callback: (response: ChromeResponse) => void) => {
				expect(message).toEqual({
					target: "iTest",
					from: ChromeLocation.Popup,
					tabId: undefined,
					payload: {
						fn: "add",
						args: [1, 2],
					},
				});
				// callback({ status: true, data: 3 });
				callback({ status: false, message: "test background error" });
			};
			chrome.runtime.sendMessage.mockImplementation(mockSendMessage as typeof chrome.runtime.sendMessage);
			// expect(route.add(1, 2)).rejects.toThrowError("test background error");
			route.add(1, 2).catch((reason) => {
				expect(reason).toEqual("test background error");
				done();
			});
		});
	});
	describe("useContent", () => {
		it("from content", (done) => {
			const route = useContent("cTest");
			Reflect.set(chrome, "content", {
				callMessage: jest.fn((request, callback) => {
					expect(request).toEqual({
						target: "cTest",
						from: ChromeLocation.Content,
						tabId: undefined,
						payload: {
							fn: "findEle",
							args: ["#id"],
						},
					});
					callback({ status: true, data: "ELE: #id" });
					done();
				}),
			});
			expect(route.findEle("#id")).resolves.toEqual("ELE: #id");
			Reflect.deleteProperty(chrome, "content");
		});
		it("from devtools", (done) => {
			const route = useContent("cTest");
			Reflect.set(chrome.devtools.inspectedWindow, "tabId", 10);

			const mockSendMessage = (message: ChromeRequest<BackgroundTarget>, callback: (response: ChromeResponse) => void) => {
				callback({ status: true, data: { status: false, message: "test content error" } });
			};
			chrome.runtime.sendMessage.mockImplementation(mockSendMessage as typeof chrome.runtime.sendMessage);
			route.findEle("#id").catch((reason) => {
				expect(reason).toEqual("test content error");
				done();
				Reflect.deleteProperty(chrome.devtools.inspectedWindow, "tabId");
			});
			// expect(actual).rejects.toThrowError("test content error");
		});
		it("forward error", (done) => {
			const route = useContent("cTest");
			Reflect.set(chrome.devtools.inspectedWindow, "tabId", 10);

			const mockSendMessage = (message: ChromeRequest<BackgroundTarget>, callback: (response: ChromeResponse) => void) => {
				callback({ status: false, message: "test forward error" });
			};
			chrome.runtime.sendMessage.mockImplementation(mockSendMessage as typeof chrome.runtime.sendMessage);
			route.findEle("#id").catch((reason) => {
				expect(reason).toEqual("test forward error");
				done();
				Reflect.deleteProperty(chrome.devtools.inspectedWindow, "tabId");
			});
			// expect(actual).rejects.toThrowError("test content error");
		});
	});
});
