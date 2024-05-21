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

Fortunes told: {data.count?.count || 0}, Fortunes told to you: {data.user?.fortuneCount || 0}
