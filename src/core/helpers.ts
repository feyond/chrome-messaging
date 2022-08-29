import debug from "debug";

export const _debug = (id: string) => debug("chrome-messaging").extend(id);
export const _error = (id: string) => debug("chrome-messaging").extend(id);

// eslint-disable-next-line no-console
_error.log = console.error;
