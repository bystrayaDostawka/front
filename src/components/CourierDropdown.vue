<template>
  <div ref="dropdownRef" class="relative courier-dropdown">
    <div
      class="p-2 rounded cursor-pointer flex items-center justify-between"
      :style="selectedStyle"
      @click.stop="toggleDropdown"
    >
      <span class="truncate">{{ selectedCourier?.name || "—" }}</span>
      <i class="fas fa-chevron-down text-xs ml-2 text-gray-600"></i>
    </div>
    
    <!-- Используем Teleport для рендеринга в body -->
    <Teleport to="body">
      <ul
        v-if="isOpen"
        ref="dropdownList"
        class="fixed z-50 bg-white border rounded shadow-lg max-h-60 overflow-auto"
        :style="dropdownStyle"
        style="background-color: white !important; z-index: 9999 !important;"
      >
        <li
          v-for="courier in filteredCouriers"
          :key="courier.id"
          class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
          @click.stop="selectCourier(courier.id, $event)"
          :style="{ 
            backgroundColor: '#fff', 
            color: '#000',
            position: 'relative',
            zIndex: 10000
          }"
        >
          <span class="truncate">{{ courier.name }}</span>
        </li>
        <li
          class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center border-t"
          @click.stop="selectCourier(null, $event)"
          :style="{ 
            backgroundColor: '#fff', 
            color: '#000',
            position: 'relative',
            zIndex: 10000
          }"
        >
          <span class="truncate text-gray-500">Без курьера</span>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<style scoped>
.courier-dropdown {
  position: relative;
}

/* Стили для выпадающего списка */
.courier-dropdown :deep(.fixed) {
  background-color: white !important;
  z-index: 9999 !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid #e5e7eb !important;
}

.courier-dropdown :deep(.fixed li) {
  background-color: inherit !important;
  position: relative !important;
  z-index: 10000 !important;
}
</style>

<script>

export default {
  props: {
    orderId: {
      type: [String, Number],
      required: true,
    },
    value: {
      type: [String, Number],
      default: null,
    },
    couriers: {
      type: Array,
      required: true,
      default: () => [],
    },
    onChanged: Function,
  },

  data() {
    return { 
      isOpen: false,
      dropdownStyle: {}
    };
  },
  computed: {
    user() {
      return JSON.parse(localStorage.getItem('user') || '{}');
    },
    selectedCourier() {
      if (!this.value && this.value !== 0) return null;
      return Array.isArray(this.couriers)
        ? this.couriers.find((c) => c.id == this.value)
        : undefined;
    },
    selectedStyle() {
      return { backgroundColor: "#f3f4f6", color: "#000" };
    },
    filteredCouriers() {
      // Фильтруем только активных курьеров
      return this.couriers.filter(c => c.is_active);
    },
  },
  methods: {
    toggleDropdown(event) {
      if (event) {
        event.stopPropagation();
      }
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.$nextTick(() => {
          this.updateDropdownPosition();
          // Дополнительное обновление позиции после рендеринга
          setTimeout(() => {
            this.updateDropdownPosition();
          }, 0);
        });
      }
    },
    updateDropdownPosition() {
      if (!this.$refs.dropdownRef || !this.$refs.dropdownList) return;
      
      const rect = this.$refs.dropdownRef.getBoundingClientRect();
      const dropdown = this.$refs.dropdownList;
      
      // Получаем размеры выпадающего списка
      const dropdownHeight = dropdown.offsetHeight || 200; // fallback height
      const dropdownWidth = Math.max(120, rect.width);
      
      // Вычисляем позицию относительно viewport (без учета scroll)
      let top = rect.bottom;
      let left = rect.left;
      
      // Проверяем, помещается ли снизу
      if (top + dropdownHeight > window.innerHeight) {
        // Если не помещается снизу, показываем сверху
        top = rect.top - dropdownHeight;
      }
      
      // Проверяем, помещается ли справа
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 10;
      }
      
      // Убеждаемся, что позиция не выходит за левую границу
      if (left < 10) {
        left = 10;
      }
      
      // Убеждаемся, что позиция не выходит за верхнюю границу
      if (top < 10) {
        top = 10;
      }
      
      this.dropdownStyle = {
        top: `${top}px`,
        left: `${left}px`,
        width: `${dropdownWidth}px`,
        minWidth: '120px',
        maxWidth: '200px',
        zIndex: '9999',
        backgroundColor: 'white'
      };
    },
    async selectCourier(newId, event) {
      if (event) {
        event.stopPropagation();
      }
      if (newId === this.value || (newId === null && this.value === null)) {
        this.isOpen = false;
        return;
      }
      this.onChanged?.(newId);
      this.isOpen = false;
    },
    handleClickOutside(e) {
      if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(e.target) &&
          this.$refs.dropdownList && !this.$refs.dropdownList.contains(e.target)) {
        this.isOpen = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    window.addEventListener("resize", this.updateDropdownPosition);
    window.addEventListener("scroll", this.updateDropdownPosition, true);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    window.removeEventListener("resize", this.updateDropdownPosition);
    window.removeEventListener("scroll", this.updateDropdownPosition, true);
  },
};
</script>
