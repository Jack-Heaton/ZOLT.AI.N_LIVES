import { util } from '@aws-appsync/utils';

export function request(ctx) {
	//This is the JavaScript resolver way of putting an item.
	return {
		operation: 'UpdateItem',
		key: util.dynamodb.toMapValues({ identityId: ctx.arguments.identityId }),
		update: {
			expression: `SET #fortuneCount = if_not_exists(#fortuneCount, :zero) + :incr,
				#firstFortuneTimestamp = if_not_exists(#firstFortuneTimestamp, :ts),
				#mostRecent = :ts,	
				#updatedAt = :updatedAt,
				#createdAt = if_not_exists(#createdAt, :createdAt),
				#typename = :typename`,
			expressionNames: {
				'#fortuneCount': 'fortuneCount',
				'#firstFortuneTimestamp': 'firstFortuneTimestamp',
				'#mostRecent': 'mostRecent',
				'#updatedAt': 'updatedAt',
				'#createdAt': 'createdAt',
				'#typename': '__typename'
			},
			expressionValues: util.dynamodb.toMapValues({
				':incr': 1,
				':zero': 0,
				':ts': util.time.nowEpochSeconds(),
				':updatedAt': util.time.nowISO8601(),
				':createdAt': util.time.nowISO8601(),
				':typename': 'User'
			})
		}
	};
}

export function response(ctx) {
	//We'll pass on the the fortune record.
	return {
		...ctx.prev.result,
		userCount: ctx.result.fortuneCount
	};
}
