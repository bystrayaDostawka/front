<template>
    <div>
        <!-- Фильтры -->
        <div class="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 bg-white p-4 rounded-xl shadow mb-4">
            <div class="relative w-full md:w-auto">
                <input
                    v-model="search"
                    @keyup.enter="fetchItems"
                    type="text"
                    placeholder="Поиск (номер акта, банк)"
                    class="border rounded-lg px-3 py-2 w-full md:w-96 focus:ring-2 focus:ring-blue-200"
                />
            </div>
            <div class="w-full md:w-auto">
                <select v-model="filterStatus" @change="fetchItems" class="border rounded-lg px-3 py-2 w-full md:min-w-[140px]">
                    <option value="">Все статусы</option>
                    <option v-for="status in reportStatuses" :key="status.id" :value="status.id">
                        {{ status.title }}
                    </option>
                </select>
            </div>
            <div v-if="user.role !== 'bank'" class="w-full md:w-auto">
                <select v-model="filterBank" @change="fetchItems" class="border rounded-lg px-3 py-2 w-full md:min-w-[140px]">
                    <option value="">Все банки</option>
                    <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
            </div>
            <div class="w-full md:w-auto">
                <select v-model="filterDateType" @change="onDateTypeChange" class="border rounded-lg px-3 py-2 w-full md:min-w-[140px]">
                    <option value="">Любая дата</option>
                    <option value="today">Сегодня</option>
                    <option value="yesterday">Вчера</option>
                    <option value="this_week">На этой неделе</option>
                    <option value="this_month">В этом месяце</option>
                    <option value="range">Диапазон дат</option>
                    <option value="date">Конкретная дата</option>
                </select>
            </div>
            <div v-if="filterDateType === 'range'" class="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                <input v-model="filterDateFrom" @change="fetchItems" type="date" class="border rounded-lg px-3 py-2 w-full sm:min-w-[120px]" placeholder="с" />
                <span class="hidden sm:block">-</span>
                <input v-model="filterDateTo" @change="fetchItems" type="date" class="border rounded-lg px-3 py-2 w-full sm:min-w-[120px]" placeholder="по" />
            </div>
            <div v-else-if="filterDateType === 'date'" class="w-full md:w-auto">
                <input v-model="filterDate" @change="fetchItems" type="date" class="border rounded-lg px-3 py-2 w-full md:min-w-[120px]" />
            </div>
            <button @click="resetFilters" class="text-blue-600 hover:underline flex items-center gap-1 justify-center md:justify-start">
                <i class="fas fa-times-circle"></i> Сбросить
            </button>
        </div>

        <div class="flex justify-between items-center mb-4">
            <PrimaryButton :onclick="() => { showModal(null) }" icon="fas fa-plus">
                Сформировать акт
            </PrimaryButton>
        </div>

        <transition name="fade" mode="out-in">
            <div v-if="!loading" key="table">
                <ResizableTable 
                    tableKey="agent-reports" 
                    :columnsConfig="columnsConfig" 
                    :tableData="reports" 
                    :itemMapper="itemMapper"
                    :onRowClick="handleRowClick"
                />
            </div>
            <div v-else key="loader" class="flex justify-center items-center h-64">
                <i class="fas fa-spinner fa-spin text-2xl"></i>
            </div>
        </transition>

        <AppModal :show="modalDialog" :onclose="closeModal">
            <AgentReportCreateModal
                ref="formComponent"
                :editingItem="editingItem"
                @saved="handleSaved"
                @saved-error="handleSavedError"
                @notification="handleNotification"
            />
        </AppModal>
        <AlertDialog
            :dialog="modalCloseDialog"
            @confirm="confirmModalClose"
            @leave="modalCloseDialog = false"
            descr="Вы действительно хотите закрыть? Несохранённые изменения будут потеряны."
        />
        <NotificationToast
            :title="notificationTitle"
            :subtitle="notificationSubtitle"
            :show="notification"
            :is-danger="notificationIsDanger"
        />
    </div>
</template>

<script>
import PrimaryButton from '@/components/PrimaryButton.vue';
import ResizableTable from '@/components/ResizableTable.vue';
import AppModal from '@/components/AppModal.vue';
import NotificationToast from '@/components/NotificationToast.vue';
import AlertDialog from '@/components/AlertDialog.vue';
import AgentReportCreateModal from './AgentReportCreateModal.vue';
import AgentReportsController from '@/api/AgentReportsController';
import BanksController from '@/api/BanksController';
import ModalTableMixin from '@/mixins/ModalTableMixin';
import ReportStatusDropdown from '@/components/ReportStatusDropdown.vue';
import { markRaw } from 'vue';

export default {
    components: {
        PrimaryButton,
        ResizableTable,
        AppModal,
        NotificationToast,
        AlertDialog,
        AgentReportCreateModal,
        ReportStatusDropdown,
    },
    mixins: [ModalTableMixin],
    data() {
        return {
            reports: [],
            banks: [],
            search: '',
            filterBank: '',
            filterStatus: '',
            filterDateType: '',
            filterDate: '',
            filterDateFrom: '',
            filterDateTo: '',
            reportStatuses: [
                { id: 'formed', title: 'Сформирован', color: '#3b82f6' },
                { id: 'under_review', title: 'На рассмотрении', color: '#eab308' },
                { id: 'approved', title: 'Одобрен', color: '#22c55e' },
                { id: 'rejected', title: 'Отклонён', color: '#ef4444' },
            ],
        };
    },
    computed: {
        user() {
            return JSON.parse(localStorage.getItem('user') || '{}');
        },
        columnsConfig() {
            return [
                { name: 'created_at', label: 'Дата формирования' },
                { name: 'id', label: 'Номер акта' },
                { name: 'delivery_cost', label: 'Сумма' },
                {
                    name: 'status',
                    label: 'Статус',
                    size: 180,
                    component: markRaw(ReportStatusDropdown),
                    props: (report) => ({
                        reportId: report.id,
                        value: report.status || 'formed',
                        statuses: this.reportStatuses,
                        onChanged: (newStatus) => this.handleStatusChange(report, newStatus),
                    }),
                },
                { name: 'actions', label: 'Действия', html: true },
            ];
        },
    },
    created() {
        this.fetchBanks();
        this.fetchItems();
    },
    methods: {
        async fetchBanks() {
            try {
                this.banks = await BanksController.getItems();
            } catch (error) {
                console.error('Ошибка при загрузке банков:', error);
            }
        },
        async fetchItems() {
            this.loading = true;
            try {
                const params = {};
                if (this.search) params.search = this.search;
                if (this.filterBank) params.bank_id = this.filterBank;
                if (this.filterStatus) params.status = this.filterStatus;

                if (this.filterDateType === 'range') {
                    if (this.filterDateFrom) params.date_from = this.filterDateFrom;
                    if (this.filterDateTo) params.date_to = this.filterDateTo;
                } else if (this.filterDateType === 'date') {
                    if (this.filterDate) {
                        params.date_from = this.filterDate;
                        params.date_to = this.filterDate;
                    }
                } else if (this.filterDateType) {
                    const quickRange = this.getQuickDateRange(this.filterDateType);
                    if (quickRange) {
                        params.date_from = quickRange.from;
                        params.date_to = quickRange.to;
                    }
                } else {
                    if (this.filterDateFrom) params.date_from = this.filterDateFrom;
                    if (this.filterDateTo) params.date_to = this.filterDateTo;
                }

                this.reports = await AgentReportsController.getItems(params);
            } catch (e) {
                this.showNotification('Ошибка загрузки', e.message || '', true);
            } finally {
                this.loading = false;
            }
        },
        resetFilters() {
            this.filterBank = '';
            this.filterStatus = '';
            this.search = '';
            this.filterDateType = '';
            this.filterDate = '';
            this.filterDateFrom = '';
            this.filterDateTo = '';
            this.fetchItems();
        },
        onDateTypeChange() {
            this.filterDate = '';
            this.filterDateFrom = '';
            this.filterDateTo = '';
            this.fetchItems();
        },
        getQuickDateRange(type) {
            const today = new Date();
            const format = (date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            };

            const startOfWeek = () => {
                const day = today.getDay();
                const diff = day === 0 ? 6 : day - 1;
                const date = new Date(today);
                date.setDate(today.getDate() - diff);
                return date;
            };

            const startOfMonth = () => new Date(today.getFullYear(), today.getMonth(), 1);

            switch (type) {
                case 'today':
                    return { from: format(today), to: format(today) };
                case 'yesterday': {
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    return { from: format(yesterday), to: format(yesterday) };
                }
                case 'this_week': {
                    const from = startOfWeek();
                    const to = new Date(from);
                    to.setDate(from.getDate() + 6);
                    return { from: format(from), to: format(to) };
                }
                case 'this_month': {
                    const from = startOfMonth();
                    const to = new Date(from.getFullYear(), from.getMonth() + 1, 0);
                    return { from: format(from), to: format(to) };
                }
                default:
                    return null;
            }
        },
        itemMapper(report, col) {
            switch (col) {
                case 'created_at':
                    return this.formatDate(report.created_at);
                case 'id':
                    return `Акт-${report.id}`;
                case 'delivery_cost':
                    return this.formatCurrency(report.delivery_cost);
                case 'actions':
                    return `<span class="action-buttons" data-report-id="${report.id}">
                        <button class="download-btn text-blue-600 hover:text-blue-800 mr-3" title="Скачать" data-action="download">
                            <i class="fas fa-download"></i>
                        </button>
                    </span>`;
                default:
                    return report[col] || '';
            }
        },
        async handleStatusChange(report, newStatus) {
            try {
                await AgentReportsController.changeStatus(report.id, newStatus);
                this.fetchItems();
                this.showNotification("Статус обновлён", "", false);
            } catch (e) {
                this.showNotification("Ошибка смены статуса", e.message || "", true);
            }
        },
        handleRowClick(report) {
            this.showModal(report);
        },
        formatDate(date) {
            if (!date) return '-';
            return new Date(date).toLocaleDateString('ru-RU');
        },
        formatDateTime(date) {
            if (!date) return '-';
            return new Date(date).toLocaleString('ru-RU');
        },
        formatCurrency(amount) {
            if (!amount) return '0.00';
            return new Intl.NumberFormat('ru-RU', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        },
        getStatusLabel(status) {
            const labels = {
                formed: 'Сформирован',
                under_review: 'На рассмотрении',
                approved: 'Одобрен',
                rejected: 'Отклонён',
            };
            return labels[status] || status;
        },
        getStatusClass(status) {
            const classes = {
                formed: 'bg-blue-100 text-blue-700',
                under_review: 'bg-yellow-100 text-yellow-700',
                approved: 'bg-green-100 text-green-700',
                rejected: 'bg-red-100 text-red-700',
            };
            return classes[status] || 'bg-gray-100 text-gray-700';
        },
        handleActionClick(event) {
            const downloadBtn = event.target.closest('.download-btn');
            if (downloadBtn) {
                event.stopPropagation();
                const actionButtons = downloadBtn.closest('.action-buttons');
                if (actionButtons) {
                    const reportId = parseInt(actionButtons.getAttribute('data-report-id'));
                    this.downloadReport(reportId);
                }
            }
        },
        async downloadReport(id) {
            try {
                await AgentReportsController.download(id);
                this.showNotification('Успешно', 'Акт-отчет скачан', false);
            } catch (error) {
                this.showNotification('Ошибка', error.response?.data?.message || 'Не удалось скачать акт-отчет', true);
            }
        },
        handleNotification({ title, message, isError }) {
            this.showNotification(title, message, isError);
        },
    },
    mounted() {
        // Обработка кликов на кнопки действий в таблице
        this.$nextTick(() => {
            document.addEventListener('click', this.handleActionClick);
        });
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleActionClick);
    },
};
</script>

