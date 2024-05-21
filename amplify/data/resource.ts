import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';

const schema = a.schema({
	//Users based on guest access session id
	User: a
		.model({
			//Session Id, which we'll get from the user's guest session
			identityId: a.id().required(),

			//First fortune timestamp with a default value defined.
			firstFortuneTimestamp: a.timestamp().default(Math.floor(Date.now() / 1000)),

			//Last prediction timestamp
			mostRecent: a.timestamp(),

			//Number of fortunes requested
			fortuneCount: a.integer().default(0),

			//Users may have many fortunes
			fortunes: a.hasMany('Fortune', 'identityId')
		})
		.identifier(['identityId'])
		//Public can now only read
		//.authorization((allow) => [allow.publicApiKey())
		.authorization((allow) => [allow.publicApiKey().to(['read'])]),

	Fortune: a
		.model({
			//Fortune string
			fortune: a.string(),

			//Users may have many fortunes
			user: a.belongsTo('User', 'identityId'),

			//The user the fortune belongs to
			identityId: a.id(),

			//Fortune timestamp with a default value defined.
			ts: a.timestamp().default(Math.floor(Date.now() / 1000))
		})
		//Public can now only read
		//.authorization((allow) => [allow.publicApiKey())
		.authorization((allow) => [allow.publicApiKey().to(['read'])]),

	Count: a
		.model({
			count: a.integer().default(0)
		})
		//Public can now only read
		//.authorization((allow) => [allow.publicApiKey())
		.authorization((allow) => [allow.publicApiKey().to(['read'])]),

	PredictionResponse: a.customType({
		fortune: a.string(),
		userCount: a.integer(),
		globalCount: a.integer()
	}),

	//This is our mutation that predicts a fortune then saves it to DynamoDB.
	PredictFortune: a
		.mutation()
		.returns(a.ref('PredictionResponse'))
		.arguments({
			identityId: a.string().required()
		})
		.authorization((allow) => [allow.publicApiKey()])

		//This is our pipeline. It will run each of the resolvers in the order that they
		//are defined in the array.
		.handler([
			//Note we're using our BedrockDataSource here
			a.handler.custom({
				dataSource: 'BedrockDataSource',
				entry: './resolvers/predictFortune.js'
			}),

			//We're cheating and using the datasource that Gen2 already created for us.
			a.handler.custom({
				dataSource: 'FortuneTable',
				entry: './resolvers/saveFortune.js'
			}),

			//Update stats
			a.handler.custom({
				dataSource: 'UserTable',
				entry: './resolvers/updateUser.js'
			}),
			a.handler.custom({
				dataSource: 'CountTable',
				entry: './resolvers/updateCount.js'
			})
		]),

	// Subscribe to fortune predictions
	PredictionSubscription: a
		.subscription()
		// subscribes to the 'publish' mutation
		.for(a.ref('PredictFortune'))
		// subscription handler to modify data and set filters
		.handler(a.handler.custom({ entry: './resolvers/predicitionSubscription.js' }))
		.authorization((allow) => [allow.publicApiKey()])
});

export const updateStatsFunction = defineFunction({
	name: 'updateStats',
	entry: './resolvers/updateStats.ts'
});

//Export our schema
export type Schema = ClientSchema<typeof schema>;

//Define our data resource
export const data = defineData({
	schema,
	authorizationModes: {
		defaultAuthorizationMode: 'apiKey',
		apiKeyAuthorizationMode: { expiresInDays: 30 }
	}
});
