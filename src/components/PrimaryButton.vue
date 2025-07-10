<template>
    <button :disabled="isLoading" :class="buttonClasses" @click="onclick" type="button">
        <span v-if="isLoading" class="mr-2">
            <i class="fas fa-spinner fa-spin"></i>
        </span>
        <span v-else-if="icon" class="mr-2">
            <i :class="icon"></i>
        </span>
        <span>
            <slot />
        </span>
    </button>
</template>

<script>
export default {
    name: "PrimaryButton",
    props: {
        icon: String,
        isLoading: Boolean,
        onclick: Function,
        isDanger: Boolean,
        isLight: Boolean,
        isInfo: Boolean,
        isFull: Boolean
    },
    computed: {
        buttonClasses() {
            return [
                'px-3 py-2 rounded mb-4 focus:outline-none focus:shadow-outline transition duration-300 cursor-pointer flex items-center',
                this.isDanger ? 'bg-red-500 hover:bg-red-600 text-white' : '',
                this.isInfo ? 'bg-blue-600 hover:bg-blue-700 text-white' : '',
                this.isLight ? 'bg-white border border-gray-300 text-black hover:bg-gray-100' : '',
                !this.isDanger && !this.isInfo && !this.isLight ? 'bg-green-500 hover:bg-green-600 text-white' : '',
                this.isFull ? 'w-full' : ''
            ];
        }
    }
};
</script>
