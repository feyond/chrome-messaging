import { chrome } from "jest-chrome";
import { setDefaultLevel } from "@feyond/console-logging/levels";

Object.assign(global, { chrome });
setDefaultLevel("debug");

declare global {
	interface BackgroundTargetRoutes {
		iTest: IBGTest;
	}
}

export interface IBGTest {
	add(x: number, y: number): number;
}
