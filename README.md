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


Based off these requirements, we can leave the auth alone and just use the “guest access” that comes built into Cognito.


Let’s get started on configuring our data.


## Schema Setup
We can see a good application of a one-to-many relationship between a user (and their metadata) and their predictions.


Check out the edited resources file to see how this is set up.


## SvelteKit Scaffolding

We’ll create a quick UX scaffold for our app. This consists of our “homepage” where we’ll interact with ZOLT.AI.N and a “page module” that will handle requesting and loading data.


I won’t do a full write up on this, but you can see the documentation inline in the following files:


The page module contains our first calls to our backend. We’ll do an `Auth.fetchAuthSession()` call to get the session ID of our current user. This is “guest access” … the user isn’t logged in, but we are still tracking them with a unique identifier stored as a cookie. We’ll use this later to match the user with their fortunes.


Also note, we did ZERO configuration. It just works.














