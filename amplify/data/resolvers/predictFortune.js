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
