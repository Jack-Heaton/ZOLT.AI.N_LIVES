<script lang="ts">
  import { tellFortune, fetchFortunes } from '../lib/fortune-teller';

  let tellingFortune = tellFortune();
  let fetchingFortunes = fetchFortunes();
  let fortunesList = [];
  fetchingFortunes.then((fortunes) => {
    fortunesList = fortunes;
  });

{#await tellingFortune}
    <p><em>ZoltAIn is consulting the spirits!</em></p>
  {:then fortune}
    <p>
      <button on:click={() => (tellingFortune = tellFortune())}
        >Ascertain my future, oh powerful ZoltAIn</button
      >
    </p>

    {#if fortune}
      <p>{fortune}</p>
    {/if}
  {:catch error}
    <p>"The spirits have failed to answer your plee."</p>
    <p>{JSON.stringify(error)}</p>
  {/await}

  <hr />
  Previous predictions:
  {#await fetchingFortunes}
    <p><em>Fetching your previous fortunes ...</em></p>
  {:then fortunes}
    <ul>
      {#each fortunesList as f}
        <li>{f}</li>
      {/each}
    </ul>
  {/await}