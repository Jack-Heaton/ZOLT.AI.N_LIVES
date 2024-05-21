<script lang="ts">
	import type { Schema } from '../../amplify/data/resource';
	import Stats from './Stats.svelte';
	import HeaderImage from './HeaderImage.svelte';
	import '../app.css';
	import History from './History.svelte';

	export let data;

	let newFortunes: Partial<Schema['Fortune']>[] = [];

	let gettingFortune: Promise<string | undefined>;

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
</script>

<div class="container">
	<HeaderImage />

	<div class="row justify-content-center">
		<div class="col-6" style="font-size:1rem">
			<div class="text-center mb-5">
				{#await gettingFortune}
					<div class="creepster-regular" style="font-size:4rem">
						<div><em>ZOLT.AI.N CONSULTS THE SPIRITS!</em></div>
					</div>
				{:then fortune}
					{#if fortune}
						<div class="creepster-regular mb-5" style="font-size:2rem">
							{fortune}
						</div>
					{/if}

					<p>
						<button
							on:click={() => (gettingFortune = getFortune())}
							class="btn btn-outline-light btn-lg"
							>Ascertain my future, oh powerful <span class="creepster-regular">ZOLT.AI.N</span
							></button
						>
					</p>
				{/await}
			</div>

			<hr />
			<div class="text-center">
				<p>
					<Stats {data} />
				</p>
			</div>

			<hr />
			<History {data} {newFortunes} />
		</div>
	</div>
</div>
