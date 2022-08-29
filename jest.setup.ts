import { chrome } from "jest-chrome";
import debug from "debug";

debug.enable("chrome-messaging:*");
Object.assign(global, { chrome });

declare global {
	interface BackgroundTargetRoutes {
		iTest: IBGTest;
	}

	interface ContentTargetRoutes {
		cTest: ICTTest;
	}
}

export interface IBGTest {
	add(x: number, y: number): number;
}

export interface ICTTest {
	findEle(selector: string): string;
}
