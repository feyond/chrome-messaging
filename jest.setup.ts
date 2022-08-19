import { chrome } from "jest-chrome";
import { setDefaultLevel } from "@feyond/console-logging/levels";

Object.assign(global, { chrome });
setDefaultLevel("debug");
