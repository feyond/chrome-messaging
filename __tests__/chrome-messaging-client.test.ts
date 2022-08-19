import { chrome } from "jest-chrome";
import { getLocation, useBackground } from "@client";
import { BackgroundTarget, ChromeLocation, ChromeRequest, ChromeResponse } from "@core";

describe("@feyond/chrome-messaging-client", () => {
	const route = useBackground("iTest");

	describe("test location", () => {
		test("location can not retrieve", () => {
			expect(() => getLocation()).toThrow();
			expect(() => getLocation()).toThrow(new Error("Could not retrieve location."));
			expect(() => getLocation()).toThrow("retrieve");
			expect(() => getLocation()).toThrowError(/retrieve/);
			expect(() => getLocation()).toThrowError("retrieve");
			expect(() => getLocation()).toThrowError(Error);
			expect(() => getLocation()).toThrowError(new Error("Could not retrieve location."));
			expect(route.add(1, 2)).rejects.toMatchObject(new Error("Could not retrieve location."));
		});

		test("location:background", () => {
			Reflect.set(chrome, "background", {});
			expect(getLocation()).toEqual(ChromeLocation.Background);
			Reflect.deleteProperty(chrome, "background");
		});

		test("location:content", () => {
			Reflect.set(chrome, "content", {});
			expect(getLocation()).toEqual(ChromeLocation.Content);
			Reflect.deleteProperty(chrome, "content");
		});

		test("location:devtools", () => {
			Reflect.set(chrome.devtools.inspectedWindow, "tabId", 1);
			expect(getLocation()).toEqual(ChromeLocation.Devtools);
			Reflect.deleteProperty(chrome.devtools.inspectedWindow, "tabId");
		});
	});

	describe("ITest.add", () => {
		beforeEach(() => {
			Reflect.set(chrome.devtools.inspectedWindow, "tabId", 1);
		});
		afterEach(() => {
			Reflect.deleteProperty(chrome.devtools.inspectedWindow, "tabId");
		});
		test("ITest.add success", async () => {
			const mock = (message: ChromeRequest<BackgroundTarget>, callback: (response: ChromeResponse) => void) => {
				callback({
					status: true,
					data: 3,
				});
			};
			chrome.runtime.sendMessage.mockImplementation(mock as typeof chrome.runtime.sendMessage);
			await expect(route.add(1, 2)).resolves.toEqual(3);
			expect(chrome.runtime.sendMessage).toBeCalled();
			expect(chrome.runtime.sendMessage).toBeCalledWith(
				{
					payload: { fn: "add", args: [1, 2] },
					target: "iTest",
					from: ChromeLocation.Devtools,
					tabId: 1,
				},
				expect.any(Function)
			);
		});
		test("ITest.add fail", async () => {
			const mock = (message: ChromeRequest<BackgroundTarget>, callback: (response: ChromeResponse) => void) => {
				callback({
					status: false,
					message: "something error",
				});
			};
			chrome.runtime.sendMessage.mockImplementation(mock as typeof chrome.runtime.sendMessage);
			await expect(route.add(1, 2)).rejects.toMatch("something error");
		});
	});
});
