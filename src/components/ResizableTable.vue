<template>
  <div>
    <div class="flex items-center justify-between md:justify-end space-x-2 mb-2">
      <div class="flex items-center space-x-2">
        <select v-model="pageSize" class="border rounded px-2 py-1">
          <option v-for="opt in [10, 25, 50]" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <!-- Кнопка настроек только для десктопа -->
        <div class="desktop-settings-button">
          <TableFilterButton :columns="columns" :default-columns="columnsConfig" @update:columns="handleColumnsUpdate" />
        </div>
      </div>
    </div>

    <!-- Desktop table view -->
    <div class="desktop-table-container overflow-x-auto">
      <!-- Debug info -->
      <div v-if="sortedData.length === 0" class="text-center py-8 text-gray-400">
        Нет данных для отображения ({{ sortedData.length }} записей, {{ columns.length }} колонок)
      </div>
      <table v-else class="min-w-full bg-white shadow-md rounded mb-6 w-full table-auto">
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
    </div>

    <!-- Mobile card view -->
    <div class="md:hidden space-y-3 mb-6 overflow-x-auto">
      <!-- Mobile header with select all -->
      <div class="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
        <div class="flex items-center space-x-2">
          <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
          <span class="text-sm font-medium">Выбрать все</span>
        </div>
        <div class="text-sm text-gray-500">
          {{ pagedData.length }} из {{ sortedData.length }}
        </div>
      </div>

      <!-- Mobile cards -->
      <div v-if="sortedData.length === 0" class="text-center py-8 text-gray-400">
        Нет данных
      </div>
      
      <div v-for="(item, i) in pagedData" :key="i" 
           @click="(e) => rowClick(item, e)"
           class="mobile-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow">
        <!-- Card header with checkbox -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-2">
            <input type="checkbox" 
                   :checked="selectedIds.includes(item.id)" 
                   @change="toggleSelect(item.id)"
                   @click.stop />
            <span class="text-sm font-medium text-gray-600">#{{ i + 1 }}</span>
          </div>
          <div class="text-xs text-gray-400">
            ID: {{ item.id }}
          </div>
        </div>

        <!-- Card content -->
        <div class="space-y-2">
          <div v-for="(col, j) in visibleColumns" :key="`${j}_${i}`" 
               class="flex flex-col">
            <div class="text-xs font-medium text-gray-500 mb-1">
              {{ col.label }}:
            </div>
            <div class="text-sm text-gray-900 break-words">
              <template v-if="col.component">
                <component :is="col.component" v-bind="typeof col.props === 'function' ? col.props(item) : col.props" />
              </template>
              <template v-else>
                <slot :name="`cell-${col.name}`" :item="item">
                  <span v-if="col.html" v-html="itemMapper(item, col.name)"></span>
                  <span v-else>{{ itemMapper(item, col.name) }}</span>
                </slot>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 mt-4">
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
import { markRaw } from 'vue';
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
      columns: this.columnsConfig.map(col => col.component ? { ...col, component: markRaw(col.component) } : { ...col }),
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
    visibleColumns() {
      return this.columns.filter(col => col.visible);
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
            html: original.html,
            component: original.component ? markRaw(original.component) : original.component,
            props: original.props,
          };
        });
      } else {
        this.columns = this.columnsConfig.map((col, idx) => ({
          ...col,
          sort_index: idx,
          visible: true,
          size: col.size ?? null,
          component: col.component ? markRaw(col.component) : col.component,
        }));
      }
    },
    resetColumns() {
      this.columns = this.columnsConfig.map((col, idx) => ({
        ...col,
        sort_index: idx,
        visible: true,
        size: col.size ?? null,
        component: col.component ? markRaw(col.component) : col.component,
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
          html: original.html,
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
      } catch (e) {
        // Failed to parse saved sort settings
      }
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
    columnsConfig: {
      handler() {
        this.loadColumns();
      },
      deep: true,
    }
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

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .resize-handle {
    display: none;
  }
  
  /* Hide desktop table on mobile */
  .desktop-table-container {
    display: none !important;
  }
  
  /* Hide desktop settings button on mobile */
  .desktop-settings-button {
    display: none !important;
  }
}

@media (max-width: 480px) {
  /* Hide desktop table on small mobile */
  .desktop-table-container {
    display: none !important;
  }
  
  /* Hide desktop settings button on small mobile */
  .desktop-settings-button {
    display: none !important;
  }
}

/* Desktop table styles */
.desktop-table-container {
  display: none;
}

.desktop-settings-button {
  display: none;
}

@media (min-width: 769px) {
  .desktop-table-container {
    display: block;
  }
  
  .desktop-settings-button {
    display: block;
  }
  
  .desktop-table-container table {
    font-size: 14px;
    border-collapse: collapse;
    table-layout: auto;
    display: table !important;
  }
  
  .desktop-table-container th, 
  .desktop-table-container td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: table-cell !important;
  }
  
  .desktop-table-container th {
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .desktop-table-container tbody tr:hover {
    background-color: #f9fafb;
  }
  
  .desktop-table-container tbody tr {
    transition: background-color 0.2s ease;
    display: table-row !important;
  }
  
}

/* Mobile card styles */
@media (max-width: 768px) {
  .mobile-card {
    transition: all 0.2s ease;
  }
  
  .mobile-card:hover {
    transform: translateY(-1px);
  }
  
  .mobile-card:active {
    transform: translateY(0);
  }
}
</style>
