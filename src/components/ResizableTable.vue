<template>
  <div>
    <div class="flex items-center justify-end space-x-2 mb-2">
      <div class="flex items-center space-x-2">
        <select v-model="pageSize" class="border rounded px-2 py-1">
          <option v-for="opt in [10, 25, 50]" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <TableFilterButton :columns="columns" :default-columns="columnsConfig" @update:columns="handleColumnsUpdate" />
      </div>
    </div>
    
    <table class="min-w-full bg-white shadow-md rounded mb-6 w-full">
      <thead>
        <tr class="bg-gray-100">
          <th style="width: 40px" class="py-2 px-4 font-semibold relative text-left border-r border-gray-200">
            <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
          </th>
          <th v-for="(col, idx) in columns" :key="col.name" :class="[
            'py-2 px-4 font-semibold relative text-left border-r border-gray-200',
            { hidden: !col.visible },
            { 'bg-gray-300 text-gray-900': sortKey === col.name },
            'cursor-pointer',
          ]" :style="{ width: col.size ? col.size + 'px' : 'auto' }" @dblclick.prevent="sortBy(col.name)">
            <span>{{ col.label }}</span>
            <span v-if="sortKey === col.name" class="ml-1">
              <i v-if="sortOrder === 1" class="fas fa-sort-up"></i>
              <i v-else class="fas fa-sort-down"></i>
            </span>
            <span v-else class="ml-1 text-gray-300">
              <i class="fas fa-sort"></i>
            </span>
            <span v-if="col.visible" class="resize-handle absolute top-0 right-0 h-full w-1 cursor-col-resize"
              @mousedown.prevent="startResize($event, idx)"></span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="sortedData.length === 0" class="text-center">
          <td :colspan="columns.length + 1" class="py-4 text-gray-400">Нет данных</td>
        </tr>
        <tr v-for="(item, i) in pagedData" :key="i" @click="(e) => rowClick(item, e)"
          class="cursor-pointer hover:bg-gray-100 transition"
          :class="{ 'border-b border-gray-300': i !== sortedData.length - 1 }">
          <td class="py-1 px-2 border-r border-gray-100 table-checkbox-cell" style="width: 40px">
            <input type="checkbox" :checked="selectedIds.includes(item.id)" @change="toggleSelect(item.id)" />
          </td>
          <td v-for="(col, j) in columns" :key="`${j}_${i}`"
            :class="[{ hidden: !col.visible }, 'py-1 px-2 border-r border-gray-100']"
            :style="{ width: col.size ? col.size + 'px' : 'auto' }">
            <template v-if="col.component">
              <component :is="col.component" v-bind="typeof col.props === 'function' ? col.props(item) : col.props" />
            </template>
            <template v-else>
              <slot :name="`cell-${col.name}`" :item="item">
                <span v-if="col.html" v-html="itemMapper(item, col.name)"></span>
                <span v-else>{{ itemMapper(item, col.name) }}</span>
              </slot>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex items-center justify-between mt-4">
      <Pagination :current-page="currentPage" :total-pages="totalPages" @update:page="changePage" />
      <div>
        <span>Всего: {{ sortedData.length }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import TableFilterButton from "./TableFilterButton.vue";
import Pagination from "./Pagination.vue";
export default {
  name: "ResizableTable",
  components: { TableFilterButton, Pagination },
  props: {
    tableKey: { type: String, required: true },
    columnsConfig: { type: Array, required: true },
    tableData: { type: Array, required: true },
    itemMapper: { type: Function, default: (item, key) => item[key] },
    onRowClick: { type: Function },
  },
  data() {
    return {
      columns: [],
      selectedIds: [],
      sortKey: null,
      sortOrder: 1,
      resizing: false,
      resizingColumn: null,
      startX: 0,
      startWidth: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  computed: {
    sortedData() {
      if (!this.sortKey) return this.tableData;

      const sortCol = this.columns.find((c) => c.name === this.sortKey);

      if (sortCol && sortCol.type === 'date') {
        return [...this.tableData].sort((a, b) => {
          const va = a[this.sortKey];
          const vb = b[this.sortKey];
          if (!va && !vb) return 0;
          if (!va) return 1 * this.sortOrder;
          if (!vb) return -1 * this.sortOrder;
          return (new Date(va) - new Date(vb)) * this.sortOrder;
        });
      }

      const vaNum = (a) => parseFloat(this.itemMapper(a, this.sortKey));
      if (
        this.tableData.length > 0 &&
        !isNaN(vaNum(this.tableData[0]))
      ) {
        return [...this.tableData].sort((a, b) => {
          return (vaNum(a) - vaNum(b)) * this.sortOrder;
        });
      }

      return [...this.tableData].sort((a, b) => {
        const va = this.itemMapper(a, this.sortKey) ?? "";
        const vb = this.itemMapper(b, this.sortKey) ?? "";
        return va.toString().localeCompare(vb.toString()) * this.sortOrder;
      });
    },

    allSelected() {
      return (
        this.pagedData.length > 0 &&
        this.pagedData.every((row) => this.selectedIds.includes(row.id))
      );
    },
    pagedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.sortedData.slice(start, start + this.pageSize);
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.sortedData.length / this.pageSize));
    },
  },
  methods: {
    loadColumns() {
      const saved = localStorage.getItem(`tableColumns_${this.tableKey}`);
      if (saved) {
        const savedColumns = JSON.parse(saved);
        this.columns = savedColumns.map((savedCol) => {
          const original = this.columnsConfig.find(c => c.name === savedCol.name) || {};
          return {
            ...savedCol,
            component: original.component,
            props: original.props,
          };
        });
      } else {
        this.columns = this.columnsConfig.map((col, idx) => ({
          ...col,
          sort_index: idx,
          visible: true,
          size: col.size ?? null,
        }));
      }
    },
    resetColumns() {
      this.columns = this.columnsConfig.map((col, idx) => ({
        ...col,
        sort_index: idx,
        visible: true,
        size: col.size ?? null,
      }));
      this.saveColumns();
    },
    saveColumns() {
      localStorage.setItem(`tableColumns_${this.tableKey}`, JSON.stringify(this.columns));
    },
    toggleVisible(index) {
      this.columns[index].visible = !this.columns[index].visible;
      this.saveColumns();
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = -this.sortOrder;
      } else {
        this.sortKey = key;
        this.sortOrder = 1;
      }
      localStorage.setItem(
        `tableSort_${this.tableKey}`,
        JSON.stringify({ key: this.sortKey, order: this.sortOrder })
      );
    },
    rowClick(item, event) {
      if (
        event &&
        (event.target.closest(".status-dropdown") ||
          event.target.closest(".table-checkbox-cell"))
      )
        return;
      this.onRowClick?.(item);
    },

    startResize(e, idx) {
      this.resizing = true;
      this.resizingColumn = idx;
      this.startX = e.clientX;
      this.startWidth = e.target.parentElement.offsetWidth;
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.stopResize);
    },
    onMouseMove(e) {
      if (!this.resizing) return;
      const dx = e.clientX - this.startX;
      const newWidth = Math.max(10, this.startWidth + dx);
      this.columns[this.resizingColumn].size = newWidth;
    },
    stopResize() {
      if (!this.resizing) return;
      this.resizing = false;
      this.saveColumns();
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.stopResize);
    },
    handleColumnsUpdate(newColumns) {
      this.columns = newColumns.map((col) => {
        const original = this.columnsConfig.find(c => c.name === col.name) || {};
        return {
          ...col,
          component: original.component,
          props: original.props,
        };
      });
      this.saveColumns && this.saveColumns();
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    },
    toggleSelect(id) {
      if (this.selectedIds.includes(id)) {
        this.selectedIds = this.selectedIds.filter((i) => i !== id);
      } else {
        this.selectedIds.push(id);
      }
    },
    toggleSelectAll(e) {
      if (e.target.checked) {
        this.selectedIds = this.pagedData.map((row) => row.id);
      } else {
        this.selectedIds = [];
      }
    },
  },
  mounted() {
    this.loadColumns();
    const saved = localStorage.getItem(`tableSort_${this.tableKey}`);
    if (saved) {
      try {
        const { key, order } = JSON.parse(saved);
        this.sortKey = key;
        this.sortOrder = order;
      } catch { }
    }
    const savedPageSize = localStorage.getItem(`tablePageSize_${this.tableKey}`);
    if (savedPageSize) {
      this.pageSize = parseInt(savedPageSize, 10);
    }
  },
  beforeUnmount() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.stopResize);
  },
  watch: {
    pageSize(val) {
      this.currentPage = 1;
      localStorage.setItem(`tablePageSize_${this.tableKey}`, val);
    },
  },
};
</script>

<style scoped>
.resize-handle {
  transition: background 0.15s;
}

.resize-handle:hover {
  background: rgba(0, 0, 0, 0.15);
}
</style>
