# ZOLT.AI.N LIVES!
### An AWS Amplify Gen2 Demo

## Overview 

*Author’s notes:*
*Amplify Gen2 is still in preview and anything and everything here is subject to change. That being said, it is in very good shape as is.

*This demo is written from the perspective of a full-stack TypeScript developer who spends most of their time working with AWS Cloud Development Kit and AppSync. I’ll be running down some rabbit-holes that a frontend developer probably won’t care about.*

*Amplify has features like hosting and deployment support that will not be covered in this demo.*

*This demo assumes at least a beginner level of experience coding with Typescript and familiarity with common tools like NPM.

*I’m using SvelteKit here, which is an awesome, modern JavaScript frontend framework built for performance and great developer experience. I won’t go deep into the details of, but you can find out everything you need to know at[svelte.dev](https://svelte.dev/).

*This demo is named after the ZOLTAN fortune telling vending machine made famous in the movie “Big”.*

Amplify AWS's Developer Experience (DX) platform that focuses on allowing frontend (or really, all) developers to quickly build and deploy cloud-powered apps. It offers SDKs for all the most popular web and mobile frameworks. This overview will focus on TypeScript/JavaScript and SvelteKit ( which is not officially supported, but seems to work fine).

In my opinion, on the Ts/Js side, the original Amplify offered a robust enough set of libraries to accomplish the mission of allowing frontend developers to create apps, however, in my opinion, had a couple of nagging issues:

* The backend AWS services were abstracted a little too far and I would frequently find myself painted into a corner if I wanted to do something Amplify didn't support. "Breaking the glass" out of Amplify would often mean ripping out or hacking around Amplify implementations using the "regular" SDK.

* Backend config and codegen was done though following command-line prompts, which I have a sort of unjustified hate of.

**Enter Amplify Gen2.** The biggest changes with Gen2 is the adoption of the code-first approach for setting up your core application infrastructure and the ability to easily drop down into Cloud Development Kit (CDK) (and, by extension Cloud Formation Templates (CFTs)) all from the comfort of your frontend development environment.

Code-first means you’ll simply(ish) write TypeScript code that defines your application data schema, authentication schemes, storage, etc, and Amplify will auto-magically create that AWS backend infrastructure for you and will also create all your types for your front end code and any Lambda functions you may right. This is super powerful and a huge time saver!

The ability to drop down into CDK means that you can easily configure and deploy AWS services not directly supported by Amplify. Since Amplify’s data API uses AppSync and AppSync supports HTTP and Lambda data sources, this means your can incorporate **ANY** AWS service and basically any external service into your application without the mental cost of breaking out of frontend development mode.

Learn more:
[AWS Amplify Overview](https://aws.amazon.com/amplify/)
[AWS Amplify Gen2 Docs](https://docs.amplify.aws/javascript/)

## Getting Set Up

You’ll need an AWS account and a developer profile set up with appropriate permissions. You can get instructions for that [here](https://docs.amplify.aws/javascript/start/account-setup/). Note: **this demo will generate charges** beyond the Free Tier for using AWS Bedrock. It shouldn’t be more than a few cents though, and you can tear everything down after you’ve completed the demo.

### Create a SvelteKit app

We’re using the SvelteKit framework here. SvelteKit is a modern JavaScript framework built for speed and great DX.

Run this commands to create your app. Select Skeleton app, Typescript syntax, and add Prettier and Eslint support.

`npm create svelte@latest zoltain_lives`

Go into your directory:

`cd zoltain_lives`

Install everything:

`npm install`

Start your application locally:

`npm run dev`

Note the url it spits out. Open this in your browser:

`  ➜  Local:   http://localhost:5175/`

### Add your Amplify Gen2 backend

Run this command from your application’s root directory. Use the default where to install option:

`npm create amplify@latest`

Deploy your personal development sandbox. Note the change of output directory. We need the Amplify output file in a spot where SvelteKit can find it. This is where all your AWS resources will be spun up. It will take a few minutes for the first deployment:

`npx ampx sandbox --outputs-out-dir ./src/lib`

At this point, you now have a fully functional dev environment with both frontend and backend hot reloading. Nice!


## Having A Look Around

Dig into to the `./amplify` directory. You’ll note the auth and data directories have already been created with a corresponding resource file in it.

Auth has the `defineAuth()` function preset. If you hop into the AWS web console and navigate to Cognito, you’ll see that a user pool has been created.

We’ll be doing most of our work on the “data” side. Here you’ll see a sample “Todo” schema has been created. In the web console, you’ll find a DynamoDB table has been created **and** and AppSync GraphQL API has been created to handle your requests.

Note, this is all automatic!

## Let’s Talk Requirements

I guess we should decide what this app is going to do, so we can make some sensible decisions about how to design it:

This will be a fortune telling app where a user clicks a button and receives a mysterious prediction from the spirits.
By “spirits” we mean an LLM.
Login is not required (nor supported).
We want to track the user’s first and most recent prediction date.
The user should be able to see their last few days of predictions, assuming they don’t clear session cookies.
We want to collect and display a real-time count of all the fortunes created by the app by all users. 

Based off these requirements, we can leave the auth alone and just use the “guest access” that comes built into Cognito.

Let’s get started on configuring our data.

## Schema Setup
Amplify’s data is backed by AppSync which is a serverless GraphQL API. If you’ve worked with GQL, you’ll know it’s highly schema dependent and it’s own skill set to write. Gen2 does a fine job of abstracting that away into TypeScript code and handles building out the API and all of your types for you.

Check out the edited data resource file to see how this is set up:

```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

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
		.authorization((allow) => [allow.publicApiKey()]),

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
		.authorization((allow) => [allow.publicApiKey()]),

	Count: a
		.model({
			count: a.integer().default(0)
		})
		.authorization((allow) => [allow.publicApiKey()])
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
```

By way of a quick explanation, we’re setting up `User` and `Fortune` GQL/TypeScript types here with their associated properties. We’re modeling them with a one-to-many relationship (each User may have many Fortunes).  The `Count` type will be used for the global count of all fortunes.

We’ve also set up public access using an API key to protect the API and each model (not very secure, but we’ll suspend disbelief since this is a toy app. AppSync allows fine grained access control all the way down to the field level and this is supported within Gen2.

The magic part is, if we stop here, Amplify has already generated our AppSync API and schema, all our TypeScript types, and has created list/get/set methods for us. Let’s start implementing the front end.

## The Load Function

We can put everything we need for our initial page load in the +page.ts file. We’ll do our initial setup and connection to the API here:

Grab the user’s session info using the ```Auth.fetchAuthSession()``` function., 
Load up the user’s record using the ```client.models.User.get()``` method Gen2 created for us.
Get the stats for the app by using ```client.models.Stats.list()``` (Note: we’re using list because we don’t have a way of knowing the record id. Another option would be a shared dummy id.).
Get the user’s previous fortunes using ```Fortune.list()``` filtered to the user’s session Id. So the app can start loading ASAP, we’ll return this as an unawaited Promise. SvelteKit can then handle that as part of the UX.

```typescript
import { Amplify } from 'aws-amplify';
import outputs from '$lib/amplify_outputs.json';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import { fetchAuthSession } from 'aws-amplify/auth';

//Generate our data client. This is a global so we can use it with all functions here.
const client = generateClient<Schema>();

export async function load() {
	//Configure Amplify based on outputs
	Amplify.configure(outputs);

	//Get the current user's session ID
	const identityId = (await fetchAuthSession()).identityId || '';

	//Get user record
	const user = (await client.models.User.get({ identityId })).data;

	//Get current stats
	const count = (await client.models.Count.list()).data[0] || { count: 0 };

	//Lazy load API for any of the user's previous fortunes
	const fortunes = client.models.Fortune.list({
		filter: {
			identityId: {
				eq: identityId
			}
		},
		limit: 10,
		selectionSet: [`fortune`, `ts`]
	});

	return {
		client,
		identityId,
		user,
		count,
		streams: {
			fortunes
		}
	};
}
```

Opening +page.svelte, we’ll see our main Svelte component for requesting and displaying fortunes. Note this piece for requesting fortunes:

```typescript
import type { Schema } from '../../amplify/data/resource';
import Stats from './Stats.svelte';
import HeaderImage from './HeaderImage.svelte';
import '../app.css';
import History from './History.svelte';

export let data;

let newFortunes: Partial<Schema['Fortune']>[] = [];

let gettingFortune: Promise<string | undefined>;

//Dummy function for fetching fortune. We'll do this the ugly way.
async function getFortune() {
  //Add new fortune to datastore
  const fortuneCreate = await data.client.models.Fortune.create({
    identityId: data.identityId,
    fortune: 'You will be rich!'
  });

  //Add new fortune to the UX list
  if (fortuneCreate.data && fortuneCreate.data.id) {
    newFortunes = [
      {
        id: fortuneCreate.data.id,
        fortune: fortuneCreate.data.fortune
      } as Partial<Schema['Fortune']>,
      ...newFortunes
    ];
  }

  //Create or update the user record
  await data.client.models.User[data.user?.identityId ? 'update' : 'create']({
    identityId: data.user?.identityId || data.identityId,
    mostRecent: Math.floor(Date.now() / 1000),
    fortuneCount: (data.user?.fortuneCount || 0) + 1
  });

  //Create or update the stats
  await data.client.models.Count[data.count?.id ? 'update' : 'create']({
    id: data.count?.id,
    count: (data.count?.count || 0) + 1
  });

  return fortuneCreate.data?.fortune as string;
}
```

The ```getFortune()``` function handles creating a new dummy fortune record and then updating the user and global stats per our requirements. This is all done using the create/update methods that Gen2 created for us, and this would be absolutely fine for a working demo, however, there are some issues though:

It’s not a real fortune!
We’re allowing the user to do direct writes to our data store with no guardrails. They might be lying about who they are!
You have three round trips to the API to accomplish one function.

We’ll be back to clean this up in a bit.

Let’s poke our head into the Stats Svelte Component. This handles establishing real-time subscriptions to the ```Count``` and ```User``` models and will update the display as that data changes. Syncing is using an underlying AppSync functionality that is absolutely magical, and it’s exposed here using the ```observeQuery()``` method. We won’t need to touch this again, but we will be changing how data makes its way here.

```typescript
import { onDestroy, onMount } from 'svelte';

export let data;

let countSync: any;
let userSync: any;

///Subscript to our User and Stats data
onMount(async () => {
  countSync = data.client.models.Count.observeQuery({
    filter: { id: { eq: data.count.id } }
  }).subscribe({
    next: (event: any) => {
      data.count = event.items?.[0];
    }
  });

  userSync = data.client.models.User.observeQuery({
    filter: { identityId: { eq: data.identityId } }
  }).subscribe({
    next: (event: any) => {
      data.user = event.items?.[0];
    }
  });
});

//Good practice to always tear down your persistent connections 
//when you unmount a component
onDestroy(() => {
  countSync?.unsubscribe();
  userSync?.unsubscribe();
});
````
The last component, History, is just a display wrapper and helper for displaying previous fortunes.

## Connecting ZOLT.AI.N with the Spirits!

Let’s go back and implement a real ```getFortune()``` function. 

We know we’ll want to call out to an LLM. Since we’re in AWS land, that will mean using the Bedrock service, and we **could** do that by just having the client make an HTTP call out, however that would require opening up public access (and a giant can of worms). Plus, we’d be getting data from the LLM to the client, only to write it from the client back to the datastore, which adds additional round trips and more potential for malfeasance.

This tells us we’re going to have to implement some sort of backend logic to handle these steps in a sane manner. Luckily, Amplify (via AppSync) gives us some great options:

AppSync JavaScript resolvers. These are snippets of JavaScript code that handle a request, perform a single operation on a datasource (basically, another service) and then return a response. They support a limited but usable subset of the normal JavaScript command set and they allow manipulation of the request and response. JavaScript resolvers are built into AppSync and are “free” as part of the AppSync request and do not suffer cold starts.

Lamda resolvers. If you’re familiar with Lambda functions, you’ll know that they are the serverless Swiss-army knife of compute. You can use them to do pretty much everything and anything. Lambdas incur (a small) additional cost and may encounter cold starts.

Pipeline resolvers allow you to chain JavaScript and/or Lambda resolvers together so that they will be run one-after-another and pass requests and results along the way. This allows the implementation of sophisticated business logic.

For kicks, we’ll be doing a pipeline that uses JavaScript resolvers to get our fortune from the LLM and then put them into the Fortune table.

JavaScript resolvers require a datasource to connect to. This allows us to write our first bit of CDK code! To keep things clean, we’re creating a resolvers ```directory``` under our ```amplify/data``` directory and creating our resolvers and datasources there.

In ```bedrockDatasource.ts``` we’ll be creating a way for AppSync to talk to the Claude Instant LLM on Bedrock. This will be via an authenticated HTTP request. All of this is configured via CDK code.

```typescript
import { Backend } from '@aws-amplify/backend';
import { BackendAuth } from '@aws-amplify/backend-auth';
import { AmplifyGraphqlApi } from '@aws-amplify/graphql-api-construct';
import { ConstructFactory } from '@aws-amplify/plugin-types';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

// This will add Claude instant as an HTTP datasource for
// our JavaScript resolvers to use
export default function addBedrockClaudeInstantDataSource(
	backend: Backend<{
		auth: ConstructFactory<BackendAuth>;
		data: ConstructFactory<AmplifyGraphqlApi>;
	}>
) {
	// Model ID. Get this from the Bedrock web console.
	const MODEL_ID = 'anthropic.claude-instant-v1';

	// CDK code to add the Bedrock HTTP datasource
	const bedrockDataSource = backend.data.addHttpDataSource(
		'BedrockDataSource',
		'https://bedrock-runtime.us-east-1.amazonaws.com',
		{
			authorizationConfig: {
				signingRegion: 'us-east-1',
				signingServiceName: 'bedrock'
			}
		}
	);

	// CKD code to add the Bedrock HTTP datasource to the IAM policy
	bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
		new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['bedrock:InvokeModel'],
			resources: [`arn:aws:bedrock:us-east-1::foundation-model/${MODEL_ID}`]
		})
	);

	// Inject the Model ID as an environment variable for the resolvers
	backend.data.resources.cfnResources.cfnGraphqlApi.environmentVariables = {
		MODEL_ID
	};
}
```

Update ```backend.ts``` to add the datasource:

```typescript
export function request(ctx) {
	// Define a system prompt that creates our fortune teller character
	// and gives them guidelines for their predictions
	const prompt = `
  
System:
Your name is Zoltain and you are a fortune teller who speaks with the spirits and provides short, randomized fortunes to those who seek your guidance. 

Instructions
- Your predictions come from the spirits
- You will refer to yourself as Zoltain
- Predictions should be extremely sarcastic, negative, and unhelpful
- Your predictions should around 25 words long
- Predictions should be highly randomized
- Responses should be delivered as spoken monologues
- Do not include any place setting phrases
- Do not include an accent or dialect

Human: What do the spirits say about my future?

Assistant:`;

	// Make the HTTP request to invoke the generative AI model
	return {
		resourcePath: `/model/${ctx.env.MODEL_ID}/invoke`,
		method: 'POST',
		params: {
			headers: {
				'Content-Type': 'application/json'
			},
			body: {
				anthropic_version: 'bedrock-2023-05-31',
				prompt,
				max_tokens_to_sample: 300,
				temperature: 1.0
			}
		}
	};
}

// Parse the response and return the generated fortune
export function response(ctx) {
	return JSON.parse(ctx.result.body).completion;
}
```

We’ll then pass the prediction we got to ```saveFortune.js``` to be saved:

```typescript
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

// Parse the response and return the generated haiku
export function response(ctx) {
	//We'll pass on the the record we added.
	return ctx.result;
}
```

Now we’ll register this as a mutation in our data resolver, and attach our datasources. While we’re in there, we’ll also prevent public users from doing anything except for reading:

```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

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

  //This is our mutation that predicts a fortune then saves it to DynamoDB.
	PredictFortune: a
		.mutation()
		.returns(a.ref('Fortune'))
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
			})
		])
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
```

And lastly, we’ll reimplement our ```getFortune()``` function in +page.svelte:

```typescript
 //Calls our PredictFortune mutation
async function getFortune() {
  const fortune = (
    await data.client.mutations.PredictFortune({
      identityId: data.identityId
    })
  )?.data;

  newFortunes = [fortune as Partial<Schema['Fortune']>, ...newFortunes];

  return fortune?.fortune || undefined;
}
```

If you try now, you’ll see we’re now getting fortunes as told by Claude Instant.

### One Last Thing

You’ll note that we broke our stats! Since we aren’t updating the ```User``` and ```Count``` types via the frontend anymore, the real time stats aren’t coming through. We can add a custom subscription to fix this:

Let’s add pipeline steps to update these tables. Remember, pipelines run in order, so make sure you’re passing any information downstream:

```typescript
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
```

```typescript
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
```

This handles updating the tables, and we can easily pass this data to the client who made the request, but what do we do about updating other clients? For that, we can set up a custom subscription that watches our PredictFortune mutation. In our ```data/resources.ts``` file:

```typescript
PredictionSubscription: a
	.subscription()
	// subscribes to the PredictFortune mutation
	.for(a.ref('PredictFortune'))
	// subscription handler to modify data and set filters
	.handler(a.handler.custom({ entry: './resolvers/predicitionSubscription.js' }))
	.authorization((allow) => [allow.publicApiKey()])
```

This then uses the predictionSubscription resolver, which is just a passthrough:

```typescript
export function request() {
	return {};
}

export function response(ctx) {
	return {
		userCount: ctx.result?.userCount,
		globalCount: ctx.result?.globalCount
	};
}
```

Now we just need to update our ```Stats.svelte``` component to use the new subscription:

```typescript
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	export let data;

	let statsSync: any;

	///Subscript to our User and Stats data
	onMount(async () => {
		data.client.subscriptions.PredictionSubscription().subscribe({
			next: (event: Record<string, number>) => {
				if (event.globalCount) {
					data.count.count = event.globalCount;
				}
				if (event.userCount) {
					data.user.fortuneCount = event.userCount;
				}
			}
		});
	});

	//Good practice to always tear down your persistent connections
	//when you unmount a component
	onDestroy(() => {
		statsSync?.unsubscribe();
	});
</script>
```

That’s it! You now have a functioning fortune teller app written in TypeScript, with a full backend, and you should have never had to open the AWS web console or CLI once!

## Takeaways

AWS Amplify Gen2 hit general availability earlier this month and it it looks like a very good start to a useful toolchain. I could see it being immediately and immensely useful to anyone doing rapid prototyping of apps.

Gen2 marries being a fast (and fun!) developer experience with the power to pull in the big guns of CDK when you need it. Also, breaking into CDK doesn’t ruin the experience . . . you never feel painted into a corner.

I did run into a few cyclical dependency issues while doing some fairly heinous stuff that I ended up cutting from this demo. I expect the would not actually show up in real life and, if they did, they could probably be resolved with some CDK tricks.

Need to check out the mobile libraries next!
