<template>
    <teleport to="body">
        <transition name="modal-slide">
            <div v-if="show" class="fixed inset-0 z-40 flex justify-end" @mousedown.self="tryClose">
                <div class="bg-white rounded-l-xl shadow-lg relative w-full max-w-md h-full" @mousedown.stop>
                    <button @click="tryClose"
                        class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl z-50" type="button">
                        &times;
                    </button>
                    <slot ref="formSlot"></slot>
                    <AlertDialog :dialog="showConfirmDialog" @confirm="confirmClose" @leave="showConfirmDialog = false"
                        descr="Вы действительно хотите закрыть? Несохранённые изменения будут потеряны." />
                </div>
            </div>
        </transition>
    </teleport>
</template>
<script>
import AlertDialog from '@/components/AlertDialog.vue';
export default {
    components: { AlertDialog },
    props: {
        show: { type: Boolean, default: false },
        onclose: { type: Function, required: true },
        formRef: { type: String, default: 'formComponent' }
    },
    data() {
        return {
            showConfirmDialog: false,
            pendingClose: false,
        };
    },
    methods: {
        tryClose() {
            // Получаем форму из $parent по переданному имени ref
            const formComponent = this.$parent?.$refs?.[this.formRef];
            if (formComponent && formComponent.isDirty && formComponent.isDirty()) {
                this.showConfirmDialog = true;
                this.pendingClose = true;
            } else {
                this.onclose();
            }
        },
        confirmClose() {
            this.showConfirmDialog = false;
            this.pendingClose = false;
            this.onclose();
        }
    }
};
</script>

<style scoped>
.modal-slide-enter-active,
.modal-slide-leave-active {
    transition: opacity 0.25s, transform 0.25s;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

.modal-slide-enter-to,
.modal-slide-leave-from {
    opacity: 1;
    transform: translateX(0);
}
</style>
