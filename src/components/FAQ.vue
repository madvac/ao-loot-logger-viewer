<template>
  <article>
    <h1 id="faq" class="text-center">
      <a href="#faq">Frequent Asked Questions</a>
    </h1>

    <section>
      <h2 id="files">
        <a href="#files">Which files can I upload?</a>
      </h2>

      <p>
        There a few types of files that you can upload:

        <ul>
          <li>Loot log files exported from external tools (contact me if you if know of any other tool available):
             <ul>
                <li><a href="https://github.com/matheussampaio/ao-loot-logger" target="_blank">matheussampaio's AO Loot Logger</a></li>
                <li><a href="https://github.com/Triky313/AlbionOnline-StatisticsAnalysis" target="_blank">Triky313's Albion Online - Statistics Analysis Tool</a></li>
              </ul>

          </li>
          <li>Chest logs exported from Albion Online. The logs will be used to mark some items as resolved. Check <a href="#how-to-chest-logs">here</a> and <a href="#how-to-guilds-chest-logs"
          >here</a> for instructions.</li>
          <li>A file containing the players that you want to filter from the list. Check <a href="#filter-players">here</a> for instructions.</li>
        </ul>
      </p>
    </section>

    <section>
      <h2 id="upload-files">
        <a href="#upload-files">How can I upload the files?</a>
      </h2>

      <p>
        Use the input on the home page to upload all your files or <b>quickly drag
        the files from your file system and drop them into the site</b>.
      </p>

      <p><small><b>NOTE:</b> The order in which you upload the files is not important.</small></p>
    </section>

    <section>
      <h2 id="items-colors">
        <a href="#items-colors">What the item's colors mean?</a>
      </h2>

      <p>Items can be displayed in red when the item was lost, green when the item was deposited, gray when the item is marked as resolved, and normal colors otherwise.</p>

      <p>See below for details and some examples.</p>

      <p>
        Items in red signal items looted from that player's corpse. This is helpful to understand when the player picked up something but lost right after.
      </p>

      <img
        loading="lazy"
        src="assets/lost-items.png"
        alt="Lost items in red"
        class="rounded"
      />

      <p>Items in green signal items deposited in a chest.</p>

      <img
        loading="lazy"
        src="assets/donated-items.png"
        alt="Donated items in green"
        class="rounded"
      />

      <p>Items in grayscale signal resolved items. This means the items were either lost or already deposited in a chest.</p>

      <img
        loading="lazy"
        src="assets/resolved-items.png"
        alt="Resolved items in gray"
        class="rounded"
      />

      <p><b>TIP:</b> You can always hover over the item to see more details.</p>

      <img
        loading="lazy"
        src="assets/items-details.png"
        alt="Hover the item to see the details"
        class="rounded"
      />

    </section>

    <section>
      <h2 id="filter-players">
        <a href="#filter-players">How do I filter the players?</a>
      </h2>

      <p>
        <a href="#upload-files">Upload</a> to AO Loot Logger Viewer a file with
        the list of players that you want to see. The file should contain one
        username per line.
      </p>

      <p>
        To quickly create a list with all members in your guild follow
        <a href="#export-guilds-members-list">those steps</a>.
      </p>
    </section>

    <section>
      <h2 id="players-in-red">
        <a href="#players-in-red">Why some player's names are in red?</a>
      </h2>

      <p>
        Because those players died while you're collecting the logs. We know
        that because the logs contain people grabbing loot from their corpses.
      </p>
    </section>

    <section>
      <h2 id="how-to-chest-logs">
        <a href="#how-to-chest-logs">How do I get the chest logs?</a>
      </h2>

      <p>
        In the chest that you want to collect the logs from, click on
        <b>Actions</b>, then <b>Chest Log</b>, and click on
        <b>Copy to clipboard</b> button.
      </p>

      <p>
        After copying the logs, create a new file on your computer and paste the
        content of the logs there. Save it and
        <a href="#upload-files">upload</a> it to the AO Loot Logger Viewer whenever
        you want.
      </p>

      <img
        loading="lazy"
        src="assets/logs-from-normal-chest.png"
        alt="How to collect logs from normal chest"
        class="rounded"
      />
    </section>

    <section>
      <h2 id="how-to-guilds-chest-logs">
        <a href="#how-to-guilds-chest-logs"
          >How do I get the guild's chest logs?</a
        >
      </h2>

      <p>
        In the chest that you want to collect the logs from, click on
        <b>Actions</b>, then <b>Manage</b>, and open the chest logs of the tab
        that you want to collect logs from. In the Chest Logs window, click on
        <b>Copy to clipboard</b> button.
      </p>

      <p>
        After copying the logs, create a new file on your computer and paste the
        content of the logs there. Save it and
        <a href="#upload-files">upload</a> it to the AO Loot Logger Viewer whenever
        you want.
      </p>

      <img
        loading="lazy"
        src="assets/logs-from-guild-chest.png"
        alt="How to collect logs from the guild's chest"
        class="rounded"
      />
    </section>

    <section>
      <h2 id="export-guilds-members-list">
        <a href="#export-guilds-members-list">
          How do I collect the guild's members list?</a
        >
      </h2>

      <p>
        Press <kbd>G</kbd> to open the Guild UI, select the <b>Members</b> tab,
        open the <b>Guild Logs</b>, and click on
        <b>Copy to clipboard</b> button.
      </p>

      <p>
        After copying the list members, create a new file on your computer and
        paste the content there. Save it and
        <a href="#upload-files">upload</a> it to the AO Loot Logger Viewer whenever
        you want.
      </p>

      <img
        loading="lazy"
        src="assets/guilds-members-list.png"
        alt="How to collect the guild's member list"
        class="rounded"
      />
    </section>

    <section>
      <h2 id="bug">
        <a href="#bug">
          I found a bug, where should I report?</a
        >
      </h2>

      <p>
        Send me a message on discord (<a href="https://discord.gg/fvNMF2abXr" target="_blank" rel="noopener noreferrer">https://discord.gg/fvNMF2abXr</a>), or create a GitHub <a href="https://github.com/matheussampaio/ao-loot-logger-viewer/issues/new" target="_blank" rel="noopener">issue</a>.
      </p>
    </section>

    <section>
      <h2 id="suggestion-or-fq">
        <a href="#suggestion-or-fq">
          I have a suggestion/feature request, where should I send?</a
        >
      </h2>

      <p>
        Send me a message on discord: <a href="https://discord.gg/fvNMF2abXr" target="_blank" rel="noopener noreferrer">https://discord.gg/fvNMF2abXr</a>.
      </p>
    </section>

    <section>
      <h2 id="donations">
        <a href="#donations">
          Where can I donate to the project?</a
        >
      </h2>

      <p>
        Feel free to use the <a href="https://github.com/sponsors/matheussampaio" target="_blank" rel="noopener">Github Sponsor</a> program or <a href="https://www.buymeacoffee.com/matheussampaio" target="_blank" rel="noopener">Buy me a Coffee</a>.
      </p>
    </section>
  </article>
</template>

<script>
export default {
  name: 'FAQ'
}
</script>

<style scoped lang="scss">
article {
  max-width: 1240px;
  margin-top: 100vh;
  position: absolute;
  padding-bottom: 5rem;
  top: 20%;
}

h1 {
  margin-bottom: 3rem;
}

h1,
h2 {
  padding-top: 1rem;
}

p {
  margin-bottom: 0;
}

p + p {
  margin-top: 1rem;
}

p + img {
  margin-top: 1rem;
}

section {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
}

img {
  align-self: center;
  max-width: 100%;
  margin-bottom: 1rem;
  height: auto;
  // border: 2px solid rgba(0, 0, 0, 0.7);
  transition: transform 500ms ease-out;
}

img:hover {
  transform: scale(102%);
}

ul {
  margin-bottom: 0;
}
</style>