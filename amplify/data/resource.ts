import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
	//Users based on guest access session id
	User: a
		.model({
			//Session Id, which we'll get from the user's guest session
			identityId: a.id().required(),

			//First fortune timestamp with a default value defined.
			firstFortuneTimestamp: a.timestamp().default(Date.now() / 1000),

			//Last prediction timestamp
			mostRecent: a.timestamp(),

			//Users may have many fortunes
			fortunes: a.hasMany('Fortune', 'identityId')
		})
		.authorization((allow) => [allow.publicApiKey()]),

	Fortune: a
		.model({
			//Fortune Id
			fortuneId: a.id().required(),

			//Fortune string
			fortune: a.string(),

			//Users may have many fortunes
			user: a.belongsTo('User', 'identityId'),

			//The user the fortune belongs to
			identityId: a.id().required(),

			//Fortune timestamp with a default value defined.
			ts: a.timestamp().default(Date.now() / 1000)
		})
		.authorization((allow) => [allow.publicApiKey()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
	schema,
	authorizationModes: {
		defaultAuthorizationMode: 'apiKey',
		apiKeyAuthorizationMode: { expiresInDays: 30 }
	}
});
