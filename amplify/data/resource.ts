import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
	//Users based on guest access session id
	User: a
		.model({
			//Session Id
			identiyId: a.id(),

			//First prediction
			first: a.string(),

			//Last recent prediction
			mostRecent: a.string(),

			//Users may have many fortunes
			fortunes: a.hasMany('Fortune', 'identityId')
		})
		.authorization((allow) => [allow.ownerDefinedIn('identityId')]),

	Fortune: a
		.model({
			//Fortune Id
			fortuneId: a.id().required(),

			//Belongs to user
			identityId: a.id().required(),

			//Fortune string
			fortune: a.string(),

			//Users may have many fortunes
			user: a.belongsTo('User', 'identityId')
		})
		.authorization((allow) => [allow.ownerDefinedIn('identityId')]),

	predictFortune: a
		.query()
		.arguments({
			identityId: a.id().required()
		})
		.returns(a.string())
		.authorization((allow) => [allow.publicApiKey()])
		.handler([
			a.handler.custom({
				dataSource: 'BedrockDataSource',
				entry: './resolvers/predictFortune.js'
			}),
			a.handler.custom({
				dataSource: 'FortuneDataSource',
				entry: './resolvers/saveFortune.js'
			})
		])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
	schema,
	authorizationModes: {
		defaultAuthorizationMode: 'apiKey',
		apiKeyAuthorizationMode: { expiresInDays: 30 }
	}
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
