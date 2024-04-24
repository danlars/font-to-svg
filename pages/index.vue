<template>
  <div class="flex justify-center items-center w-full h-screen">
    <form @submit="onSubmit" class="mb-80 border-solid border-gray-200 border-2 rounded py-8 px-5">
      <h1 class="text-2xl mb-8">Font file to SVG</h1>
      <p>
        Convert all characters in your font file to svg files that can be used as SVGs
      </p>
      <input type="file" accept=".WOFF,.OTF,.TTF" ref="htmlFileRef" @change="onInputFileChange"/><br/>
      <div class="flex justify-end">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" type="submit">Submit</button>
      </div>
    </form>
  </div>
</template>
<script lang="ts" setup>
import type {Ref} from 'vue';

const fontFile = ref() as Ref<undefined | File>;
const onInputFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files as FileList;
  if (files.length === 0) {
    fontFile.value = undefined;
    return;
  }
  fontFile.value = files[0];
}

const onSubmit = async (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  if (!fontFile.value) {
    return;
  }
  const payload = new FormData();
  payload.append('fontFile', fontFile.value);
  const response = await useFetch('/api/font-to-svg', { method: 'POST', body: payload, responseType: 'blob' });
  const fileURL = URL.createObjectURL(response.data.value as Blob)
  const linkElement = document.createElement('a');
  linkElement.href = fileURL;
  linkElement.setAttribute('download', 'output.zip');
  linkElement.setAttribute('target', '_blank');
  document.body.appendChild(linkElement);
  linkElement.click();
  linkElement.remove();
}
</script>
