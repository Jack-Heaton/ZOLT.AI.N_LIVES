<script lang="ts">
	import type { Schema } from '../../amplify/data/resource';

	export let data;
	export let newFortunes: Partial<Schema['Fortune']>[];

	//Just a helper function for type assignment
	function concatFortuneLists(oldFortunes: any[]) {
		return [
			...(newFortunes as Partial<Schema['Fortune']>[]),
			...(oldFortunes as Partial<Schema['Fortune']>[])
		] as any[];
	}
</script>

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
