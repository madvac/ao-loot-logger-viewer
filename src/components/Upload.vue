<template>
  <div>
    <input
      class="form-control upload-input"
      type="file"
      id="upload-input"
      name="file-upload"
      accept=".txt,.csv"
      multiple
      @change="(e) => $emit('change', e)"
      :hidden="popup"
      :disabled="disabled"
    />
    <label for="upload-input" v-if="popup"
      ><svg
        aria-hidden="true"
        focusable="false"
        data-icon="upload"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"
        ></path></svg
    ></label>
  </div>
</template>

<script>
export default {
  name: 'Upload',
  props: {
    popup: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped lang="scss">
.upload-input {
  max-width: 350px;
  margin-top: 3rem;
  margin-bottom: 2rem;
}

label {
  background-color: var(--primary-color);
  border-radius: 50%;
  bottom: 2rem;
  color: var(--background-color);
  cursor: pointer;
  margin: 0;
  padding: 12px;
  position: fixed;
  right: 2rem;
  transition: background-color 300ms ease-in;
}

label:hover {
  background-color: var(--secondary-color);
}

svg {
  width: 2rem;
}
</style>