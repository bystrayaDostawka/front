<template>
    <transition name="fade">
        <div v-if="show" :class="['fixed top-4 right-4 p-4 rounded shadow-lg z-100',
            isDanger ? 'bg-[#EE4F47] text-white' : 'bg-[#5CB85C] text-white']">
            <h3 class="font-bold ">{{ title }}</h3>
            <p class="" v-if="subtitle">{{ subtitle }}</p>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'NotificationToast',
    props: {
        title: { type: String, required: true },
        subtitle: { type: String, required: false, default: '' },
        isDanger: { type: Boolean, default: false },
        show: { type: Boolean, default: false }
    }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
