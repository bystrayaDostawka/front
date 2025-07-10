<template>
  <div ref="dropdownRef" class="relative status-dropdown">
    <div
      class="p-2 rounded cursor-pointer flex items-center justify-between"
      :style="selectedStyle"
      @click="toggleDropdown"
    >
      <span class="truncate">{{ selectedStatus?.title || "—" }}</span>
      <i class="fas fa-chevron-down text-xs ml-2 text-gray-600"></i>
    </div>
    <ul
      v-if="isOpen"
      class="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto"
    >
      <li
        v-for="s in statuses"
        :key="s.id"
        class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
        @click="selectStatus(s.id)"
        :style="{ backgroundColor: s.color || '#eee', color: '#000' }"
      >
        <span>{{ s.title }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import api from "@/api/api";
export default {
  props: {
    orderId: {
      type: [String, Number],
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    statuses: {
      type: Array,
      required: true,
      default: () => [],
    },
    onChanged: Function,
  },

  data() {
    return { isOpen: false };
  },
  computed: {
    selectedStatus() {
      return Array.isArray(this.statuses)
        ? this.statuses.find((s) => s.id == this.value)
        : undefined;
    },
    selectedStyle() {
      const color = this.selectedStatus?.color;
      return color ? { backgroundColor: color + "22", color: "#000" } : {};
    },
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    async selectStatus(newId) {
      if (newId === this.value) {
        this.isOpen = false;
        return;
      }
      await api.patch(`/orders/${this.orderId}/status`, { order_status_id: newId });
      this.onChanged?.(newId);
      this.isOpen = false;
    },
    handleClickOutside(e) {
      if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(e.target)) {
        this.isOpen = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>
