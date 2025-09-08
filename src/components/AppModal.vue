<template>
    <teleport to="body">
        <transition name="modal-slide">
            <div v-if="show" class="fixed inset-0 z-40 flex justify-end" @mousedown.self="tryClose" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
                <div class="bg-white rounded-l-xl shadow-lg relative w-full max-w-md h-full" @mousedown.stop>
                    <button @click="tryClose"
                        class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl z-50" type="button">
                        &times;
                    </button>
                    <!-- Подсказка для мобильных устройств -->
                    <div class="absolute top-2 left-2 text-gray-400 text-xs md:hidden">
                        ← Свайп для закрытия
                    </div>
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
            touchStartX: 0,
            touchStartY: 0,
            touchCurrentX: 0,
            touchCurrentY: 0,
            isDragging: false,
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
        },
        
        handleTouchStart(e) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.isDragging = false;
        },
        
        handleTouchMove(e) {
            if (!this.touchStartX || !this.touchStartY) return;
            
            this.touchCurrentX = e.touches[0].clientX;
            this.touchCurrentY = e.touches[0].clientY;
            
            const deltaX = this.touchCurrentX - this.touchStartX;
            const deltaY = this.touchCurrentY - this.touchStartY;
            
            // Если движение вправо больше чем вниз/вверх, считаем это свайпом
            if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
                this.isDragging = true;
                e.preventDefault(); // Предотвращаем скролл страницы
            }
        },
        
        handleTouchEnd(e) {
            if (!this.isDragging) return;
            
            const deltaX = this.touchCurrentX - this.touchStartX;
            
            // Если свайп вправо больше 100px, закрываем модалку
            if (deltaX > 100) {
                this.tryClose();
            }
            
            // Сбрасываем состояние
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchCurrentX = 0;
            this.touchCurrentY = 0;
            this.isDragging = false;
        },
        
        handleKeydown(e) {
            if (e.key === 'Escape') {
                this.tryClose();
            }
        }
    },
    mounted() {
        document.addEventListener('keydown', this.handleKeydown);
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.handleKeydown);
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
