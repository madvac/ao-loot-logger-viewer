<template>
  <article>
    <h1 id="faq" class="text-center">
      <a href="#faq">Frequent asked Questions</a>
    </h1>

    <section>
      <h2 id="upload-files">
        <a href="#upload-files">How can I upload my files?</a>
      </h2>

      <p>
        Use the input in the home page to upload all your files or quickly drag
        the files from your file system and drop them into the site.

        <br />

        <small>NOTE: The order of the files is not important.</small>
      </p>
    </section>

    <!-- @TODO: Add anchor links to each sections h2 -->
    <section>
      <h2 id="items-colors">
        <a href="#items-colors">What the item's colors means?</a>
      </h2>

      <!-- TODO: explain each color code -->
      <p></p>
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
        <a href="#create-guilds-members-list">those steps</a>.
      </p>
    </section>

    <section>
      <h2 id="players-in-red">
        <a href="#players-in-red">Why some player's name are in red?</a>
      </h2>

      <p>
        Because those players died while you're collecting the logs. We know
        that because the logs contains people grabbing loot from their corpses.
      </p>
    </section>

    <section>
      <h2 id="how-to-chest-logs">
        <a href="#how-to-chest-logs"> How do I get the chest logs?</a>
      </h2>

      <p>
        In the chest that you want to collect the logs from, click on
        <b>Actions</b>, then <b>Chest Log</b>, and click on
        <b>Copy to clipboard</b> button.
      </p>

      <p>
        After copying the logs, create a new file in your computer and paste the
        content of the logs there. Save it and
        <a href="#upload-files">upload</a> to the AO Loot Logger Viewer whenever
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
        After copying the logs, create a new file in your computer and paste the
        content of the logs there. Save it and
        <a href="#upload-files">upload</a> to the AO Loot Logger Viewer whenever
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
      <h2 id="create-guilds-members-list">
        <a href="#create-guilds-members-list">
          How do I collect the guild's member list?</a
        >
      </h2>

      <p>
        Press <kbd>G</kbd> to open the Guild UI, select the <b>Members</b> tab,
        open the <b>Guild Logs</b>, and click on
        <b>Copy to clipboard</b> button.
      </p>

      <p>
        After copying the list members, create a new file in your computer and
        paste the content there. Save it and
        <a href="#upload-files">upload</a> to the AO Loot Logger Viewer whenever
        you want.
      </p>

      <img
        loading="lazy"
        src="assets/guilds-members-list.png"
        alt="How to collect the guild's member list"
        class="rounded"
      />
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
  max-width: 80%;
  margin-top: 100vh;
  position: absolute;
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
  margin-bottom: 1rem;
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
</style>