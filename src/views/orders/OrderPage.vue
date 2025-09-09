<template>
    <div>
        <div class="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow mb-4">
            <div class="relative">
                <input
                    v-model="search"
                    @keyup.enter="fetchItems"
                    type="text"
                    placeholder="Поиск (номер заказа, имя, телефон)"
                    class="border rounded-lg px-3 py-2 w-96 focus:ring-2 focus:ring-blue-200"
                />
            </div>
            <div>
                <select v-model="filterStatus" @change="fetchItems" class="border rounded-lg px-3 py-2 min-w-[140px]">
                    <option value="">Все статусы</option>
                    <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.title }}</option>
                </select>
            </div>
            <div v-if="user.role !== 'bank'">
                <select v-model="filterBank" @change="fetchItems" class="border rounded-lg px-3 py-2 min-w-[140px]">
                    <option value="">Все банки</option>
                    <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
            </div>
            <div v-if="user.role !== 'bank'">
                <select v-model="filterCourier" @change="fetchItems" class="border rounded-lg px-3 py-2 min-w-[140px]">
                    <option value="">Все курьеры</option>
                    <option value="none">Без курьера</option>
                    <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
            </div>
            <div>
                <select v-model="filterDateType" @change="onDateTypeChange" class="border rounded-lg px-3 py-2 min-w-[140px]">
                    <option value="">Любая дата</option>
                    <option value="today">Сегодня</option>
                    <option value="yesterday">Вчера</option>
                    <option value="this_week">На этой неделе</option>
                    <option value="this_month">В этом месяце</option>
                    <option value="range">Диапазон дат</option>
                    <option value="date">Конкретная дата</option>
                </select>
            </div>
            <div v-if="filterDateType === 'range'" class="flex items-center gap-1">
                <input v-model="filterDateFrom" @change="fetchItems" type="date" class="border rounded-lg px-3 py-2 min-w-[120px]" placeholder="c" />
                <span>-</span>
                <input v-model="filterDateTo" @change="fetchItems" type="date" class="border rounded-lg px-3 py-2 min-w-[120px]" placeholder="по" />
            </div>
            <div v-else-if="filterDateType === 'date'">
                <input v-model="filterDate" @change="fetchItems" type="date" class="border rounded-lg px-3 py-2 min-w-[120px]" />
            </div>
            <button @click="resetFilters" class="ml-2 text-blue-600 hover:underline flex items-center gap-1">
                <i class="fas fa-times-circle"></i> Сбросить
            </button>
        </div>
        <div class="flex justify-between items-center mb-4">
            <PrimaryButton v-if="canAddOrder" :onclick="() => { showModal(null); }" icon="fas fa-plus">
                Добавить заявку
            </PrimaryButton>
            <PrimaryButton v-if="canImportExcel" :onclick="openImportDialog" icon="fas fa-file-excel" class="ml-2 bg-green-600 hover:bg-green-700">
                Импорт из Excel
            </PrimaryButton>
            <input ref="importInput" type="file" accept=".xlsx,.xls" class="hidden" @change="handleImportFile" />
        </div>
        <div v-if="importErrors.length" class="import-errors">
            <div v-for="err in importErrors" :key="err.row + err.attribute">
                <b>Строка {{ err.row }}</b>, <b>{{ err.attribute }}</b>: {{ err.errors.join(', ') }}
            </div>
        </div>
        <div class="mb-4">
            <button v-if="canImportExcel" @click="showImportExample = !showImportExample" class="text-blue-600 underline mb-2">
                {{ showImportExample ? 'Скрыть пример' : 'Показать пример Excel-файла' }}
            </button>
            <button v-if="canImportExcel" @click="downloadExcelTemplate" class="text-green-700 underline ml-4 mb-2">
                Скачать шаблон Excel
            </button>
            <div v-if="showImportExample && canImportExcel" class="bg-gray-50 border p-4 rounded">
                <div class="font-semibold mb-2">Структура Excel-файла для импорта:</div>
                <table class="w-full text-xs border mb-2">
                    <thead>
                        <tr>
                            <th class="border px-2 py-1">product</th>
                            <th class="border px-2 py-1">name</th>
                            <th class="border px-2 py-1">surname</th>
                            <th class="border px-2 py-1">patronymic</th>
                            <th class="border px-2 py-1">phone</th>
                            <th class="border px-2 py-1">address</th>
                            <th class="border px-2 py-1">delivery_at</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="border px-2 py-1">Кредит</td>
                            <td class="border px-2 py-1">Иван</td>
                            <td class="border px-2 py-1">Иванов</td>
                            <td class="border px-2 py-1">Иванович</td>
                            <td class="border px-2 py-1">+79991234567</td>
                            <td class="border px-2 py-1">г. Москва, ул. Пушкина, д. 1</td>
                            <td class="border px-2 py-1">2025-08-01 14:00</td>
                        </tr>
                    </tbody>
                </table>
                <div class="text-xs text-gray-500">В первой строке должны быть именно такие <b>английские</b> названия столбцов: product, name, surname, patronymic, phone, address, delivery_at.<br>Дата доставки — в формате ГГГГ-ММ-ДД ЧЧ:ММ (например, 2025-08-01 14:00).</div>
            </div>
        </div>

        <transition name="fade" mode="out-in">
            <div v-if="!loading" key="table">
                <ResizableTable tableKey="orders" :columnsConfig="columnsConfig" :tableData="orders"
                    :itemMapper="itemMapper" :onRowClick="showModal" itemKey="id" />
            </div>
            <div v-else key="loader" class="flex justify-center items-center h-64">
                <i class="fas fa-spinner fa-spin text-2xl"></i>
            </div>
        </transition>

        <AppModal :show="modalDialog" :onclose="closeModal">
            <OrderCreatePage ref="formComponent" @saved="handleSaved" @saved-error="handleSavedError"
                @deleted="handleDeleted" @deleted-error="handleDeletedError" :editingItem="editingItem" />
        </AppModal>
        <AlertDialog :dialog="modalCloseDialog" @confirm="confirmModalClose" @leave="modalCloseDialog = false"
            descr="Вы действительно хотите закрыть? Несохранённые изменения будут потеряны." />
        <NotificationToast :title="notificationTitle" :subtitle="notificationSubtitle" :show="notification"
            :is-danger="notificationIsDanger" />
        <AppModal :show="showStatusReasonModal" :onclose="cancelStatusReason">
            <div class="p-4">
                <h3 class="text-lg font-bold mb-4">
                    {{ Number(statusChangeId) === 5 ? 'Перенос заявки' : 'Отмена заявки' }}
                </h3>
                <div v-if="Number(statusChangeId) === 5">
                    <div class="mb-4">
                        <label class="required">Причина переноса</label>
                        <input type="text" v-model="statusReason" class="w-full border rounded p-2" required />
                    </div>
                    <div class="mb-4">
                        <label class="required">Новая дата доставки</label>
                        <input type="datetime-local" v-model="statusNewDate" class="w-full border rounded p-2" required />
                    </div>
                </div>
                <div v-else>
                    <div class="mb-4">
                        <label class="required">Причина отмены</label>
                        <input type="text" v-model="statusReason" class="w-full border rounded p-2" required />
                    </div>
                </div>
                <div class="flex justify-end space-x-2">
                    <button @click="cancelStatusReason" class="px-4 py-2 rounded bg-gray-200">Отмена</button>
                    <button @click="confirmStatusReason" class="px-4 py-2 rounded bg-green-500 text-white">Сохранить</button>
                </div>
            </div>
        </AppModal>
    </div>
</template>
<script>
import OrdersController from "@/api/OrdersController";
import PrimaryButton from "@/components/PrimaryButton.vue";
import AppModal from "@/components/AppModal.vue";
import OrderCreatePage from "./OrderCreatePage.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import AlertDialog from "@/components/AlertDialog.vue";
import ResizableTable from "@/components/ResizableTable.vue";
import OrderStatusesController from "@/api/OrderStatusesController";
import { markRaw } from 'vue';
import { utils, writeFile } from 'xlsx';

import ModalTableMixin from "@/mixins/ModalTableMixin";
import StatusDropdown from "@/components/StatusDropdown.vue";
import api from '@/api/api';

export default {
    components: {
        PrimaryButton,
        AppModal,
        OrderCreatePage,
        NotificationToast,
        AlertDialog,
        ResizableTable,
    },
    mixins: [ModalTableMixin],
    data() {
        return {
            data: null,
            statuses: [],
            banks: [],
            couriers: [],
            search: '',
            filterStatus: '',
            filterBank: '',
            filterCourier: '',
            filterDateType: '',
            filterDate: '',
            filterDateFrom: '',
            filterDateTo: '',
            showStatusReasonModal: false,
            statusReason: '',
            statusNewDate: '',
            statusChangeOrder: null,
            statusChangeId: null,
            deliveryDateChanges: {},
            importLoading: false,
            importErrors: [],
            showImportExample: false,
        };
    },
    created() {
        this.fetchBanks();
        this.fetchCouriers();
        this.fetchItems();
        this.fetchStatuses();
    },
    methods: {
        async fetchItems() {
            this.loading = true;
            try {
                const params = {
                  search: this.search,
                  order_status_id: this.filterStatus,
                  bank_id: this.filterBank,
                  courier_id: this.filterCourier,
                };
                // Дата фильтра
                if (this.filterDateType === 'range') {
                  params.date_from = this.filterDateFrom;
                  params.date_to = this.filterDateTo;
                } else if (this.filterDateType === 'date') {
                  params.delivery_at = this.filterDate;
                } else if (this.filterDateType) {
                  params.delivery_at = this.filterDateType;
                }
                this.data = await OrdersController.getItems(params);
                await this.fetchDeliveryDateChanges();
            } catch (e) {
                this.showNotification("Ошибка загрузки", e.message || "", true);
            } finally {
                this.loading = false;
            }
        },
        async fetchStatuses() {
            try {
                this.statuses = await OrderStatusesController.getItems();
            } catch (e) {
                this.showNotification("Ошибка загрузки статусов", e.message || "", true);
            }
        },
        async fetchBanks() {
            try {
                const response = await api.get('/banks');
                this.banks = response.data;
            } catch {
                this.banks = [];
            }
        },
        async fetchCouriers() {
            try {
                const couriers = await (await import('@/api/UsersController')).default.getCouriers();
                this.couriers = couriers;
            } catch {
                this.couriers = [];
            }
        },
        async fetchDeliveryDateChanges() {
            // Для всех заказов на странице получаем логи батчем и ищем изменения даты доставки
            const orders = this.data || [];
            const ids = orders.map(o => o.id);
            let logsByOrder = {};
            try {
                logsByOrder = await OrdersController.getActivityLogsBatch(ids);
            } catch {
                // ignore errors for batch
            }
            const changes = {};
            for (const order of orders) {
                const log = logsByOrder[order.id] || [];
                // Найти последнее изменение поля 'Дата доставки'
                const dateChange = log.find(l => l.changes && l.changes['Дата доставки'] && l.changes['Дата доставки'].old !== undefined && l.changes['Дата доставки'].old !== l.changes['Дата доставки'].new);
                if (dateChange) {
                    changes[order.id] = {
                        date: dateChange.date,
                        value: dateChange.changes['Дата доставки'].new
                    };
                }
            }
            this.deliveryDateChanges = changes;
        },
        async handleStatusChange(order, newStatusId) {
            if (this.user.role === 'bank' && Number(newStatusId) !== 6) {
                // Банк может менять только на "Отменено"
                return;
            }
            // Если выбран Перенос (5) или Отмена (6) — показать модалку
            if (Number(newStatusId) === 5 || Number(newStatusId) === 6) {
                this.statusChangeOrder = order;
                this.statusChangeId = newStatusId;
                this.statusReason = '';
                this.statusNewDate = '';
                this.showStatusReasonModal = true;
                return;
            }
            // Иначе — обычная смена статуса
            try {
                await OrdersController.changeStatus(order.id, newStatusId);
                this.fetchItems();
                this.showNotification("Статус обновлён", "", false);
            } catch (e) {
                this.showNotification("Ошибка смены статуса", e.message || "", true);
            }
        },
        async confirmStatusReason() {
            if (!this.statusReason) {
                this.showNotification("Укажите причину отмены/переноса", "", true);
                return;
            }
            if (Number(this.statusChangeId) === 5 && !this.statusNewDate) {
                this.showNotification("Укажите новую дату для переноса", "", true);
                return;
            }
            try {
                await OrdersController.changeStatus(
                    this.statusChangeOrder.id,
                    this.statusChangeId,
                    {
                        declined_reason: this.statusReason,
                        delivery_at: this.statusNewDate || this.statusChangeOrder.delivery_at,
                    }
                );
                this.showStatusReasonModal = false;
                this.fetchItems();
                this.showNotification("Статус обновлён", "", false);
            } catch (e) {
                this.showNotification("Ошибка смены статуса", e.message || "", true);
            }
        },
        cancelStatusReason() {
            this.showStatusReasonModal = false;
        },
        itemMapper(order, col) {
            if (col === "client") return `${order.surname} ${order.name} ${order.patronymic}`;
            if (col === "id") {
                let html = order.formatOrderNumber();
                if (order.order_status_id == 6 && order.declined_reason) {
                    html += ` <span title="${order.declined_reason.replace(/\"/g, '&quot;')}" style="display:inline-block;width:10px;height:10px;background:#e53e3e;border-radius:50%;margin-left:4px;vertical-align:middle;cursor:pointer;"></span>`;
                }
                return html;
            }
            if (col === "delivery_at") {
                let html = order.formatDeliveryDate();
                const change = this.deliveryDateChanges[order.id];
                if (change) {
                    html += ` <span title="Дата изменена: ${change.date}" style="display:inline-block;width:10px;height:10px;background:#f59e42;border-radius:50%;margin-left:4px;vertical-align:middle;cursor:pointer;"></span>`;
                }
                return html;
            }
            if (col === "deliveried_at") {
                return order.deliveried_at ? new Date(order.deliveried_at).toLocaleString() : '-';
            }
            if (col === "courier") {
                return order.courier?.name || '-';
            }
            return order[col] || "";
        },
        isSameDateTime(a, b) {
            // Сравниваем до минут
            const da = new Date(a);
            const db = new Date(b);
            return (
                da.getFullYear() === db.getFullYear() &&
                da.getMonth() === db.getMonth() &&
                da.getDate() === db.getDate() &&
                da.getHours() === db.getHours() &&
                da.getMinutes() === db.getMinutes()
            );
        },
        openImportDialog() {
            this.$refs.importInput.value = '';
            this.$refs.importInput.click();
        },
        async handleImportFile(e) {
            const file = e.target.files[0];
            if (!file) return;
            this.importLoading = true;
            this.importErrors = [];
            const formData = new FormData();
            formData.append('file', file);
            try {
                await api.post('/orders/import-excel', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                this.showNotification('Импорт завершён', '', false);
                this.fetchItems();
            } catch (err) {
                if (err.response?.status === 422 && err.response.data.failures) {
                    this.importErrors = err.response.data.failures;
                    this.showNotification('Ошибка импорта', 'Проверьте ошибки ниже', true);
                } else {
                    this.showNotification('Ошибка импорта', err.response?.data?.message || err.message, true);
                }
            } finally {
                this.importLoading = false;
            }
        },
        downloadExcelTemplate() {
            const headers = [
                'product', 'name', 'surname', 'patronymic', 'phone', 'address', 'delivery_at'
            ];
            const example = [
                'Кредит', 'Иван', 'Иванов', 'Иванович', '+79991234567', 'г. Москва, ул. Пушкина, д. 1', '2025-08-01 14:00'
            ];
            const ws = utils.aoa_to_sheet([headers, example]);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, 'Orders');
            writeFile(wb, 'orders_import_template.xlsx');
        },
        onDateTypeChange() {
          // Сбросить значения при смене типа фильтра
          this.filterDate = '';
          this.filterDateFrom = '';
          this.filterDateTo = '';
          this.fetchItems();
        },
        resetFilters() {
            this.search = '';
            this.filterStatus = '';
            this.filterBank = '';
            this.filterCourier = '';
            this.filterDateType = '';
            this.filterDate = '';
            this.filterDateFrom = '';
            this.filterDateTo = '';
            this.fetchItems();
        },
        showModal(item, event) {
            // Банк не может открывать форму редактирования заказа
            if (this.user.role === 'bank') return;
            if (event && event.target && event.target.closest && event.target.closest('.status-dropdown')) {
                return;
            }
            this.editingItem = item;
            this.modalDialog = true;
        },
    },
    computed: {
        orders() {
            return this.data || [];
        },
        user() {
            return JSON.parse(localStorage.getItem('user') || '{}');
        },
        canAddOrder() {
            // Только не courier и не bank
            return !['courier', 'bank'].includes(this.user.role);
        },
        canImportExcel() {
            // Только admin и bank
            return ['admin', 'bank'].includes(this.user.role);
        },
        columnsConfig() {
            const base = [
                { name: "id", label: "ID", html: true },
                { name: "client", label: "ФИО" },
                { name: "delivery_at", label: "Доставка", html: true },
                {
                    name: "status",
                    label: "Статус",
                    component: markRaw(StatusDropdown),
                    props: (order) => ({
                        orderId: order.id,
                        value: order.order_status_id,
                        statuses: this.statuses,
                        onChanged: (newStatusId) => this.handleStatusChange(order, newStatusId),
                    }),
                },
            ];
            if (this.user.role === 'admin' || this.user.role === 'manager') {
                base.push({ name: "deliveried_at", label: "Доставлено в" });
                base.push({ name: "courier", label: "Курьер" });
            }
            return base;
        },
    },
};
</script>

<style scoped>
.import-errors {
  background: #fff0f0;
  border: 1px solid #f87171;
  color: #b91c1c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}
</style>
