<template>
    <div class="flex flex-col h-full overflow-hidden">
        <div class="tabs mb-4">
            <button
                :class="['tab', { active: activeTab === 'form' }]"
                @click="activeTab = 'form'"
            >Форма</button>
        </div>
        <div v-if="activeTab === 'form'" class="flex-1 overflow-auto p-4">
            <h2 class="text-lg font-bold mb-4">
                {{ editingItem ? 'Редактировать акт-отчет' : 'Сформировать акт-отчет' }}
            </h2>
            <div class="space-y-4">
                <!-- Банк -->
                <div>
                    <label class="required">Банк</label>
                    <select
                        v-model="formData.bank_id"
                        :disabled="editingItem"
                        required
                    >
                        <option value="" disabled>Выберите банк...</option>
                        <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                </div>

                <!-- Период -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="required">Период с</label>
                        <input
                            v-model="formData.period_from"
                            :disabled="editingItem"
                            type="date"
                            required
                        />
                    </div>
                    <div>
                        <label class="required">Период по</label>
                        <input
                            v-model="formData.period_to"
                            :disabled="editingItem"
                            type="date"
                            required
                        />
                    </div>
                </div>

                <!-- Кнопка загрузки заказов -->
                <div v-if="!editingItem">
                    <PrimaryButton
                        :onclick="loadOrders"
                        :disabled="!canLoadOrders || loadingOrders"
                        :is-loading="loadingOrders"
                        icon="fas fa-download"
                    >
                        Загрузить заказы за период
                    </PrimaryButton>
                </div>

                <!-- Таблица заказов -->
                <div v-if="orders.length > 0" class="mt-6">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-md font-semibold">Заказы за период:</h3>
                        <div class="flex gap-2">
                            <button
                                @click="selectAllOrders"
                                class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Выбрать все
                            </button>
                            <button
                                @click="deselectAllOrders"
                                class="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Снять выбор
                            </button>
                        </div>
                    </div>
                    <div class="overflow-x-auto border rounded-lg">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-3 py-2 text-left border-b w-12">
                                        <input
                                            type="checkbox"
                                            :checked="allOrdersSelected"
                                            @change="toggleAllOrders"
                                            class="cursor-pointer"
                                        />
                                    </th>
                                    <th class="px-3 py-2 text-left border-b">№</th>
                                    <th class="px-3 py-2 text-left border-b">Номер заказа</th>
                                    <th class="px-3 py-2 text-left border-b">Продукт</th>
                                    <th class="px-3 py-2 text-left border-b">Клиент</th>
                                    <th class="px-3 py-2 text-left border-b">Адрес</th>
                                    <th class="px-3 py-2 text-left border-b">Дата доставки</th>
                                    <th class="px-3 py-2 text-left border-b">Курьер</th>
                                    <th class="px-3 py-2 text-left border-b">Стоимость доставки, руб.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr 
                                    v-for="(order, index) in orders" 
                                    :key="order.id" 
                                    :class="['hover:bg-gray-50', { 'bg-gray-100': !order.selected }]"
                                >
                                    <td class="px-3 py-2 border-b">
                                        <input
                                            type="checkbox"
                                            v-model="order.selected"
                                            @change="recalculateTotal"
                                            class="cursor-pointer"
                                        />
                                    </td>
                                    <td class="px-3 py-2 border-b">{{ index + 1 }}</td>
                                    <td class="px-3 py-2 border-b">{{ order.order_number }}</td>
                                    <td class="px-3 py-2 border-b">{{ order.product }}</td>
                                    <td class="px-3 py-2 border-b">
                                        {{ order.surname }} {{ order.name }} {{ order.patronymic }}
                                    </td>
                                    <td class="px-3 py-2 border-b">{{ order.address || '-' }}</td>
                                    <td class="px-3 py-2 border-b">{{ formatDate(order.delivery_at) }}</td>
                                    <td class="px-3 py-2 border-b">{{ order.courier || '-' }}</td>
                                    <td class="px-3 py-2 border-b">
                                        <input
                                            v-model.number="order.delivery_cost"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            @input="recalculateTotal"
                                            :disabled="!order.selected"
                                            :class="['w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500', { 'bg-gray-200 cursor-not-allowed': !order.selected }]"
                                            placeholder="0.00"
                                            required
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-if="orders.length > 0" class="mt-2 text-sm text-gray-600">
                        Выбрано заявок: {{ selectedOrdersCount }} из {{ orders.length }}
                    </div>
                </div>

                <!-- Общая стоимость -->
                <div v-if="selectedOrdersCount > 0" class="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-lg font-semibold">Итого стоимость доставки:</span>
                            <p class="text-xs text-gray-600 mt-1">Сумма высчитывается автоматически при вводе стоимости доставки для каждого выбранного заказа</p>
                        </div>
                        <span class="text-xl font-bold text-blue-700">{{ formatCurrency(totalCost) }} руб.</span>
                    </div>
                </div>

                <!-- Примечания -->
                <div>
                    <label>Примечания</label>
                    <textarea
                        v-model="formData.notes"
                        class="w-full"
                        rows="3"
                        placeholder="Дополнительная информация..."
                    ></textarea>
                </div>
            </div>
        </div>
        <div class="mt-4 flex space-x-2 bg-[#edf4fb] p-4 rounded-xl">
            <PrimaryButton
                icon="fas fa-save"
                :onclick="save"
                :is-loading="saveLoading"
            >
                {{ editingItem ? 'Сохранить' : 'Сформировать акт' }}
            </PrimaryButton>
        </div>
    </div>
</template>

<script>
import AgentReportsController from '@/api/AgentReportsController';
import BanksController from '@/api/BanksController';
import FormModalMixin from '@/mixins/FormModalMixin';
import PrimaryButton from '@/components/PrimaryButton.vue';

export default {
    name: 'AgentReportCreateModal',
    components: {
        PrimaryButton,
    },
    mixins: [FormModalMixin],
    data() {
        return {
            banks: [],
            orders: [],
            loadingOrders: false,
            activeTab: 'form',
            formData: {
                bank_id: '',
                period_from: '',
                period_to: '',
                notes: '',
                status: 'formed',
            },
        };
    },
    computed: {
        canLoadOrders() {
            return this.formData.bank_id && this.formData.period_from && this.formData.period_to;
        },
        canSave() {
            return this.selectedOrdersCount > 0 && this.totalCost > 0;
        },
        totalCost() {
            return this.orders
                .filter(order => order.selected)
                .reduce((sum, order) => sum + (parseFloat(order.delivery_cost) || 0), 0);
        },
        selectedOrdersCount() {
            return this.orders.filter(order => order.selected).length;
        },
        allOrdersSelected() {
            return this.orders.length > 0 && this.orders.every(order => order.selected);
        },
    },
    created() {
        this.fetchBanks();
    },
    methods: {
        async fetchBanks() {
            try {
                this.banks = await BanksController.getItems();
            } catch (error) {
                console.error('Ошибка при загрузке банков:', error);
            }
        },
        async loadOrders() {
            if (!this.canLoadOrders) return;

            this.loadingOrders = true;
            try {
                const orders = await AgentReportsController.getOrdersForPeriod(
                    this.formData.bank_id,
                    this.formData.period_from,
                    this.formData.period_to
                );
                
                if (!orders || orders.length === 0) {
                    this.$emit('notification', { title: 'Ошибка', message: 'Заказов за выбранный период не найдено', isError: true });
                    this.orders = [];
                    return;
                }
                
                this.orders = orders.map(order => ({
                    id: order.id,
                    order_number: order.order_number,
                    product: order.product,
                    name: order.name,
                    surname: order.surname,
                    patronymic: order.patronymic,
                    phone: order.phone,
                    address: order.address,
                    delivery_at: order.delivery_at,
                    delivered_at: order.delivered_at,
                    courier: order.courier,
                    delivery_cost: parseFloat(order.delivery_cost) || 0,
                    selected: false, // По умолчанию заявки не выбраны
                }));
            } catch (error) {
                console.error('Ошибка при загрузке заказов:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Не удалось загрузить заказы за период';
                this.$emit('notification', { title: 'Ошибка', message: errorMessage, isError: true });
                this.orders = [];
            } finally {
                this.loadingOrders = false;
            }
        },
        async setFormFromItem(item) {
            if (!item) {
                this.clearForm();
                return;
            }

            // Загружаем полные данные отчета через API, если есть ID
            let fullItem = item;
            if (item.id) {
                try {
                    fullItem = await AgentReportsController.getItem(item.id);
                } catch (error) {
                    console.error('Ошибка при загрузке данных отчета:', error);
                    // Используем данные из item, если не удалось загрузить
                }
            }

            // Заполняем форму данными
            this.formData.bank_id = fullItem.bank_id || '';
            this.formData.notes = fullItem.notes || '';
            this.formData.status = fullItem.status || 'formed';

            // Форматируем даты для input type="date" (YYYY-MM-DD)
            if (fullItem.period_from) {
                const periodFrom = new Date(fullItem.period_from);
                this.formData.period_from = periodFrom.toISOString().split('T')[0];
            } else {
                this.formData.period_from = '';
            }

            if (fullItem.period_to) {
                const periodTo = new Date(fullItem.period_to);
                this.formData.period_to = periodTo.toISOString().split('T')[0];
            } else {
                this.formData.period_to = '';
            }

            // Загружаем заказы из акта
            if (fullItem.report_orders && fullItem.report_orders.length > 0) {
                this.orders = fullItem.report_orders.map(ro => ({
                    id: ro.order?.id || ro.order_id,
                    order_number: ro.order?.order_number || '',
                    product: ro.order?.product || '',
                    name: ro.order?.name || '',
                    surname: ro.order?.surname || '',
                    patronymic: ro.order?.patronymic || '',
                    phone: ro.order?.phone || '',
                    address: ro.order?.address || '',
                    delivery_at: ro.order?.delivery_at || '',
                    delivered_at: ro.order?.delivered_at || '',
                    courier: ro.order?.courier?.name || null,
                    delivery_cost: parseFloat(ro.delivery_cost || ro.pivot?.delivery_cost || 0),
                    selected: true, // При редактировании все заказы уже выбраны
                }));
            } else if (fullItem.orders && fullItem.orders.length > 0) {
                // Альтернативная структура данных
                this.orders = fullItem.orders.map(order => ({
                    id: order.id,
                    order_number: order.order_number || '',
                    product: order.product || '',
                    name: order.name || '',
                    surname: order.surname || '',
                    patronymic: order.patronymic || '',
                    phone: order.phone || '',
                    address: order.address || '',
                    delivery_at: order.delivery_at || '',
                    delivered_at: order.delivered_at || '',
                    courier: order.courier?.name || null,
                    delivery_cost: parseFloat(order.pivot?.delivery_cost || 0),
                    selected: true, // При редактировании все заказы уже выбраны
                }));
            } else {
                this.orders = [];
            }
        },
        clearForm() {
            this.formData.bank_id = '';
            this.formData.period_from = '';
            this.formData.period_to = '';
            this.formData.notes = '';
            this.formData.status = 'formed';
            this.orders = [];
        },
        _getFormState() {
            return {
                bank_id: this.formData.bank_id,
                period_from: this.formData.period_from,
                period_to: this.formData.period_to,
                notes: this.formData.notes,
                status: this.formData.status,
                orders_count: this.orders.length,
            };
        },
        recalculateTotal() {
            // Автоматически пересчитывается через computed totalCost
        },
        async save() {
            if (!this.canSave) return;

            this.saveLoading = true;
            try {
                // Отправляем только выбранные заявки
                const selectedOrders = this.orders.filter(order => order.selected);
                
                const data = {
                    bank_id: this.formData.bank_id,
                    period_from: this.formData.period_from,
                    period_to: this.formData.period_to,
                    delivery_cost: this.totalCost,
                    notes: this.formData.notes,
                    orders: selectedOrders.map(order => ({
                        order_id: order.id,
                        delivery_cost: parseFloat(order.delivery_cost) || 0,
                    })),
                };

                if (this.editingItem) {
                    const result = await AgentReportsController.update(this.editingItem.id, data);
                    this.$emit('saved', result);
                } else {
                    const result = await AgentReportsController.create(data);
                    this.$emit('saved', result);
                }

                this.clearForm();
            } catch (error) {
                this.$emit('saved-error', this.getApiErrorMessage(error));
            } finally {
                this.saveLoading = false;
            }
        },
        selectAllOrders() {
            this.orders.forEach(order => {
                order.selected = true;
            });
        },
        deselectAllOrders() {
            this.orders.forEach(order => {
                order.selected = false;
            });
        },
        toggleAllOrders(event) {
            const checked = event.target.checked;
            this.orders.forEach(order => {
                order.selected = checked;
            });
        },
        formatDate(date) {
            if (!date) return '-';
            return new Date(date).toLocaleDateString('ru-RU');
        },
        formatCurrency(amount) {
            if (!amount) return '0.00';
            return new Intl.NumberFormat('ru-RU', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        },
    },
};
</script>

<style scoped>
.required::after {
    content: ' *';
    color: red;
}
.tabs {
    display: flex;
    gap: 8px;
    padding: 0 16px;
}
.tab {
    padding: 6px 16px;
    border: none;
    background: #f3f4f6;
    cursor: pointer;
    border-radius: 6px 6px 0 0;
}
.tab.active {
    background: #fff;
    border-bottom: 2px solid #3b82f6;
    font-weight: bold;
}
</style>

