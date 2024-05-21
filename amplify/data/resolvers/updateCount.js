import { util } from '@aws-appsync/utils';

export function request() {
	//This is the JavaScript resolver way of putting an item.
	return {
		operation: 'UpdateItem',
		key: util.dynamodb.toMapValues({ id: 'GLOBAL' }),
		update: {
			expression: `SET #count = if_not_exists(#count, :zero) + :incr,
				#updatedAt = :updatedAt,
				#createdAt = :createdAt,
				#typename = :typename
			`,
			expressionNames: {
				'#count': 'count',
				'#updatedAt': 'updatedAt',
				'#createdAt': 'createdAt',
				'#typename': '__typename'
			},
			expressionValues: util.dynamodb.toMapValues({
				':incr': 1,
				':zero': 0,
				':updatedAt': util.time.nowISO8601(),
				':createdAt': util.time.nowISO8601(),
				':typename': 'Count'
			})
		}
	};
}

export function response(ctx) {
	//We'll pass on the the fortune record.
	return {
		...ctx.prev.result,
		globalCount: ctx.result.count
	};
}
