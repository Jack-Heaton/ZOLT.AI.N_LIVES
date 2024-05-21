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
		...(backend.data.resources.cfnResources.cfnGraphqlApi.environmentVariables || {}),
		MODEL_ID
	};
}
