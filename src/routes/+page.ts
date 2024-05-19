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

	//Call the API for any of the user's previous fortunes

	return {
		identityId
	};
}
