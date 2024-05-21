import { util } from '@aws-appsync/utils';

export function request(ctx) {
	//Get our fortune from the last step
	const newFortune = {
		fortune: ctx.prev.result,
		identityId: ctx.arguments.identityId,
		ts: util.time.nowEpochSeconds(),
		createdAt: util.time.nowISO8601(),
		updatedAt: util.time.nowISO8601(),
		__typename: 'Fortune'
	};

	//This is the JavaScript resolver way of putting an item.
	return {
		operation: 'PutItem',
		key: util.dynamodb.toMapValues({ id: util.autoId() }),
		attributeValues: util.dynamodb.toMapValues(newFortune)
	};
}

export function response(ctx) {
	//We'll pass on the the record we added.
	return ctx.result;
}
