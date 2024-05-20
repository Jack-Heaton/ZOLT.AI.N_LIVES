<script lang="ts">
	import { Amplify } from 'aws-amplify';
	import outputs from '$lib/amplify_outputs.json';
	import { generateClient } from 'aws-amplify/api';
	import type { Schema } from '../../amplify/data/resource';
	import { fetchAuthSession } from 'aws-amplify/auth';
	import { onMount } from 'svelte';

	// //Configure Amplify based on outputs
	// Amplify.configure(outputs);

	// //Create data client
	// const client = generateClient<Schema>();
	export let data;

	let newFortunes: Schema['Fortune'][] = [];

	let gettingFortune: Promise<string | undefined>;

	//Dummy function for fetching fortune. We'll do this the ugly way.
	async function getFortune() {
		const fortuneCreate = await data.client.models.Fortune.create({
			identityId: data.identityId,
			fortune: 'You will be rich!'
		});

		//Update the user record
		await data.client.models.User.update({
			identityId: data.identityId,
			mostRecent: Math.floor(Date.now() / 1000),

			fortuneCount: (data.user?.fortuneCount || 0) + 1
		});

		//Update the stats
		await data.client.models.Count.update({
			id: data.count.id,
			count: (data.count?.count || 0) + 1
		});

		return fortuneCreate.data?.fortune as string;
	}

	//Just a helper function for type assignment
	function concatFortuneLists(oldFortunes: any[]) {
		return [
			...(newFortunes as Schema['Fortune'][]),
			...(oldFortunes as Schema['Fortune'][])
		] as any[];
	}
</script>

{#await gettingFortune}
	<em>Zolt.AI.n consults the spirits!</em>
{:then fortune}
	{#if fortune}
		<h5>{fortune}</h5>
	{/if}

	<p>
		<button on:click={() => (gettingFortune = getFortune())}
			>Ascertain my future, oh powerful Zolt.AI.n</button
		>
	</p>
{/await}

<hr />
Previous predictions:
{#await data.streams.fortunes}
	<p><em>Fetching your previous fortunes ...</em></p>
{:then oldFortunes}
	{@const fortuneList = concatFortuneLists(oldFortunes.data)}
	<ul>
		{#each fortuneList as f}
			<li>{f.fortune}</li>
		{/each}
	</ul>
{/await}
