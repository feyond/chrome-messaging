declare global {
	namespace chrome {
		let background: IBackgroundContext;
		let content: IContentContext;
	}
}

export {};
