import { AbstractRouteFactory, ChromeLocation, ChromeRequest, MessageRouter, RouteGenerators } from "@core";
import { chrome } from "jest-chrome";

const factory = new (class extends AbstractRouteFactory<any> {
	get targets(): RouteGenerators<any> {
		return {
			test: {},
			testObject: { obj: true },
			testFunction: () => ({
				add: (a: number, b: number) => a + b,
				hello: (name: string) => Promise.resolve("hello " + name),
				minus: () => {
					throw new Error("Test apply payload error");
				},
				reject: () => Promise.reject("Test apply payload reject"),
			}),
		};
	}
})();
describe("core", () => {
	describe("AbstractRouteFactory", () => {
		describe("RouteFactory.validate", () => {
			const message: ChromeRequest<any> = {
				target: "test",
				payload: { fn: "add", args: [1, 2] },
				from: ChromeLocation.Popup,
			};
			it("with no target", () => {
				expect(() => {
					factory.validate({ ...message, target: undefined });
				}).toThrow("Message without target received");
			});
			it("with target not exists", () => {
				expect(() => {
					factory.validate({ ...message, target: "Random123" });
				}).toThrow("Could not retrieve target route: Random123");
			});
			it("with no payload", () => {
				expect(() => {
					const _message = { ...message };
					Reflect.deleteProperty(_message, "payload");
					factory.validate(_message);
				}).toThrow("Message without payload received");
			});
			it("with no payload:fn", () => {
				expect(() => {
					const _payload = { ...message.payload };
					Reflect.deleteProperty(_payload, "fn");
					factory.validate({ ...message, payload: _payload });
				}).toThrow("Message payload:fn no specified.");
			});
			it("with no payload:args", () => {
				expect(() => {
					const _payload = { ...message.payload };
					Reflect.deleteProperty(_payload, "args");
					factory.validate({ ...message, payload: _payload });
				}).toThrow("Message payload:args illegal.");
			});
			it("with no tabId", () => {
				expect(() => {
					factory.validate({ ...message, from: ChromeLocation.Devtools, tabId: undefined });
				}).toThrow("Could not retrieve tabId");

				expect(() => {
					factory.validate({ ...message, from: ChromeLocation.Content, tabId: undefined });
				}).toThrow("Could not retrieve tabId");
			});

			it("success", () => {
				expect(factory.validate({ ...message, from: ChromeLocation.Background })).toBeTruthy();
				expect(factory.validate({ ...message, from: ChromeLocation.Options })).toBeTruthy();
				expect(factory.validate({ ...message, from: ChromeLocation.Popup })).toBeTruthy();
				expect(factory.validate({ ...message, from: ChromeLocation.Content, tabId: 1 })).toBeTruthy();
				expect(factory.validate({ ...message, from: ChromeLocation.Devtools, tabId: 2 })).toBeTruthy();

				Reflect.set(chrome, "content", {});
				expect(factory.validate({ ...message, from: ChromeLocation.Content })).toBeTruthy();
				Reflect.deleteProperty(chrome, "content");
			});
		});

		describe("RouteFactory.createRoute", () => {
			const message: ChromeRequest<any> = {
				target: "test_no_exists",
				payload: { fn: "add", args: [1, 2] },
				from: ChromeLocation.Popup,
			};
			it("with target no exists", () => {
				expect(() => {
					factory.createRoute({ ...message, target: "test_no_exists" });
				}).toThrow("Could not retrieve target route: test_no_exists");
			});
			it("object route generator", () => {
				const route = factory.createRoute({ ...message, target: "testObject" });
				expect(route).toHaveProperty("obj", true);
			});
			it("function route generator", () => {
				const route = factory.createRoute({ ...message, target: "testFunction" });
				expect(route).toHaveProperty("add", expect.any(Function));
			});
		});
	});
	describe("MessageRouter", () => {
		const router = new MessageRouter(factory);
		const message: ChromeRequest<any> = {
			target: "test",
			payload: { fn: "add", args: [1, 2] },
			from: ChromeLocation.Popup,
		};

		it("transform", () => {
			expect(router.transform(message, {})).toEqual(message);

			expect(() => {
				router.transform({ ...message, from: ChromeLocation.Content }, {});
			}).toThrow("Could not retrieve tab:id");

			expect(() => {
				router.transform({ ...message, from: ChromeLocation.Content }, { tab: {} as chrome.tabs.Tab });
			}).toThrow("Could not retrieve tab:id");

			const sender: chrome.runtime.MessageSender = {
				tab: {
					id: 11,
				} as chrome.tabs.Tab,
			};
			expect(router.transform(message, sender)).toEqual(message);
			expect(router.transform({ ...message, from: ChromeLocation.Content }, sender)).toHaveProperty("tabId", 11);
		});

		describe("apply", () => {
			it("apply reject", () => {
				expect(router.apply({} as ChromeRequest<any>)).rejects.toThrow();
				expect(router.apply(message)).rejects.toThrow(`Method[${message.payload.fn}] does not exist on target:${message.target}`);
			});

			it("apply payload error", () => {
				const _message: ChromeRequest<any> = {
					target: "testFunction",
					payload: { fn: "minus", args: [2, 1] },
					from: ChromeLocation.Popup,
				};
				expect(router.apply(_message)).rejects.toThrow("Test apply payload error");
			});

			it("apply payload from content with no tabId", () => {
				const _message: ChromeRequest<any> = {
					target: "testFunction",
					payload: { fn: "hello", args: ["cfy"] },
					from: ChromeLocation.Content,
				};
				expect(router.apply(_message)).rejects.toThrow("Could not retrieve tabId");
			});

			it("apply payload success", () => {
				const _message: ChromeRequest<any> = {
					target: "testFunction",
					payload: { fn: "add", args: [2, 1] },
					from: ChromeLocation.Popup,
				};
				expect(router.apply(_message)).resolves.toEqual(3);

				const _message1: ChromeRequest<any> = {
					target: "testFunction",
					payload: { fn: "hello", args: ["cfy"] },
					from: ChromeLocation.Content,
					tabId: 22,
				};
				expect(router.apply(_message1)).resolves.toEqual("hello cfy");
			});
		});

		describe("callMessage", () => {
			const callback = jest.fn();
			it("not match with no target", () => {
				const _message = { ...message };
				Reflect.deleteProperty(_message, "target");
				const result = router.callMessage(_message, callback);
				expect(result).toBeUndefined();
				expect(callback).not.toBeCalled();
			});
			it("not match with no payload", () => {
				const _message = { ...message };
				Reflect.deleteProperty(_message, "payload");
				const result = router.callMessage(_message, callback);
				expect(result).toBeUndefined();
				expect(callback).not.toBeCalled();
			});
			it("not match with no from", () => {
				const _message = { ...message };
				Reflect.deleteProperty(_message, "from");
				const result = router.callMessage(_message, callback);
				expect(result).toBeUndefined();
				expect(callback).not.toBeCalled();
			});
			it("apply resolve", (done) => {
				const _message: ChromeRequest<any> = {
					target: "testFunction",
					payload: { fn: "add", args: [2, 1] },
					from: ChromeLocation.Popup,
				};
				const result = router.callMessage(
					_message,
					jest.fn((args) => {
						expect(args).toEqual({ status: true, data: 3 });
						done();
					})
				);
				expect(result).toBeTruthy();
			});
			it("apply catch error", (done) => {
				const _message: ChromeRequest<any> = {
					target: "testFunction",
					payload: { fn: "minus", args: [2, 1] },
					from: ChromeLocation.Popup,
				};
				const result = router.callMessage(
					_message,
					jest.fn((args) => {
						expect(args).toEqual({ status: false, message: "Test apply payload error" });
						done();
					})
				);
				expect(result).toBeTruthy();
			});
			it("apply catch reject", (done) => {
				const _message: ChromeRequest<any> = {
					target: "testFunction",
					payload: { fn: "reject", args: [] },
					from: ChromeLocation.Popup,
				};
				const result = router.callMessage(
					_message,
					jest.fn((args) => {
						expect(args).toEqual({ status: false, message: "Test apply payload reject" });
						done();
					})
				);
				expect(result).toBeTruthy();
			});
		});

		describe("MessageRouter.onMessage", () => {
			beforeAll(() => {
				router.onMessage();
			});

			it("onMessage", (done) => {
				const _message: ChromeRequest<any> = {
					target: "testFunction",
					payload: { fn: "add", args: [2, 1] },
					from: ChromeLocation.Popup,
				};
				chrome.runtime.onMessage.callListeners(
					_message,
					{},
					jest.fn((response) => {
						expect(response).toEqual({ status: true, data: 3 });
						done();
					})
				);
			});
		});
	});
});
