<template>
  <main>
    <OpenAIForm />
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OpenAIForm from "./components/OpenAIForm.vue";

export default defineComponent({
  name: "App",
  components: {
    OpenAIForm,
  },
});
</script>

<style>
main {
  font-family: Arial, sans-serif;
  padding: 20px;
}
</style>