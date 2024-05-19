# ZOLT.AI.N LIVES!
## An AWS Amplify Gen2 Demo


*Author’s notes:*
*Amplify Gen2 is still in preview and anything and everything here is subject to change. That being said, it is in very good shape as is.


*This demo is written from the perspective of a full-stack TypeScript developer who spends most of their time working with AWS Cloud Development Kit and AppSync. I’ll be running down some rabbit-holes that a frontend developer probably won’t care about.*


*Amplify has features like hosting and deployment support that will not be covered in this demo.*


*This demo assumes at least a beginner level of experience coding with Typescript and familiarity with common tools like NPM.


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








