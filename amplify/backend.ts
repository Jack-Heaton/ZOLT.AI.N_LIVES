import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import addBedrockClaudeInstantDataSource from './data/resolvers/bedrockDatasource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
	auth,
	data
});

addBedrockClaudeInstantDataSource(backend);
