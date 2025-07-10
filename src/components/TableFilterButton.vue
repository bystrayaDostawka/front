<template>
    <div class="relative inline-block" ref="dropdown">
        <button @click="toggleMenu"
            class="hover:text-blue-500 text-gray-500 p-2 rounded-full hover:bg-gray-100 transition cursor-pointer flex items-center">
            <i class="fas fa-cog text-lg"></i>
        </button>
        <transition name="appear">
            <div v-if="isOpen"
                class="absolute right-0 mt-1 w-60 bg-white shadow-md rounded border border-gray-200 p-2 z-10 min-w-[180px]">
                <ul>
                    <draggable v-if="columns.length" :list="localColumns" handle=".handle" item-key="name"
                        @end="emitUpdate" class="dragArea list-group w-full space-y-1">
                        <template #item="{ element, index }">
                            <li class="flex items-center justify-between hover:bg-gray-100 p-2 rounded cursor-pointer"
                                @click="toggleVisible(index, $event)">
                                <div class="flex items-center space-x-2 select-none">
                                    <i class="handle fas fa-grip-vertical text-gray-300  cursor-grab"></i>
                                    <i
                                        :class="[element.visible ? 'fas fa-circle-check text-[#337AB7]' : 'far fa-circle text-gray-300']"></i>
                                    <span :class="{ 'text-gray-400': !element.visible }">
                                        {{ element.label }}
                                    </span>
                                </div>
                            </li>
                        </template>
                    </draggable>
                </ul>
                <div class="flex flex-row-reverse mt-2">
                    <button @click="reset" class="text-[#337AB7] hover:underline mr-3 cursor-pointer">
                        Сбросить
                    </button>
                    <button @click="toggleMenu" class="text-gray-500 hover:underline mr-3 cursor-pointer">
                        Готово
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import draggable from 'vuedraggable';
export default {
    name: "TableFilterButton",
    components: { draggable },
    props: {
        columns: { type: Array, required: true },
        defaultColumns: { type: Array, required: false, default: () => [] }
    },
    data() {
        return {
            isOpen: false,
            localColumns: JSON.parse(JSON.stringify(this.columns))
        };
    },
    watch: {
        columns: {
            handler(val) {
                this.localColumns = JSON.parse(JSON.stringify(val));
            },
            deep: true
        }
    },
    methods: {
        toggleMenu() {
            this.isOpen = !this.isOpen;
        },
        emitUpdate() {
            const referenceColumns = this.columns.length ? this.columns : this.defaultColumns;
            const result = this.localColumns.map(col => {
                const original = referenceColumns.find(c => c.name === col.name) || {};
                return {
                    ...original,
                    ...col,
                }
            });
            this.$emit('update:columns', result);
        },
        toggleVisible(index, e) {
            if (e.target.classList.contains('handle')) return;
            this.localColumns[index].visible = !this.localColumns[index].visible;
            this.emitUpdate();
        },
        reset() {
            const columns = this.defaultColumns.length
                ? JSON.parse(JSON.stringify(this.defaultColumns))
                : JSON.parse(JSON.stringify(this.columns));
            columns.forEach(col => col.visible = true);
            this.localColumns = columns;
            this.emitUpdate();
        },
        handleClickOutside(event) {
            const dropdown = this.$refs.dropdown;
            if (this.isOpen && dropdown && !dropdown.contains(event.target)) {
                this.isOpen = false;
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    }
};
</script>

<style scoped>
.appear-enter-active,
.appear-leave-active {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.appear-enter-from,
.appear-leave-to {
    transform: scaleY(0);
    opacity: 0;
    transform-origin: top;
}

.appear-enter-to,
.appear-leave-from {
    transform: scaleY(1);
    opacity: 1;
    transform-origin: top;
}
</style>
