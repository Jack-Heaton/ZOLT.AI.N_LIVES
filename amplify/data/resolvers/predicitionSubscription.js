export function request() {
	return {};
}

export function response(ctx) {
	return {
		userCount: ctx.result?.userCount,
		globalCount: ctx.result?.globalCount
	};
}
