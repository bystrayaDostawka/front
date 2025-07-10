<template>
    <div class="flex items-center space-x-2">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-2 py-1 rounded border disabled:opacity-50">
            &lt;
        </button>
        <span>Стр. {{ currentPage }} из {{ totalPages }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-2 py-1 rounded border disabled:opacity-50">
            &gt;
        </button>
    </div>
</template>

<script setup>
defineProps({
    currentPage: Number,
    totalPages: Number,
});
const emit = defineEmits(["update:page"]);
function changePage(page) {
    emit("update:page", page);
}
</script>
