<template>
    <div class="flex flex-col h-full overflow-hidden">
        <div class="tabs mb-4">
            <button
                :class="['tab', { active: activeTab === 'form' }]"
                @click="activeTab = 'form'"
            >Форма</button>
            <button
                v-if="user.role !== 'bank' && user.role !== 'manager'"
                :class="['tab', { active: activeTab === 'log' }]"
                @click="activeTab = 'log'"
                :disabled="!editingItem"
            >Лог</button>
        </div>
        <div v-if="activeTab === 'form'" class="flex-1 overflow-auto p-4">
            <h2 class="text-lg font-bold mb-4">{{ editingItem ? 'Редактировать заявку' : 'Создать заявку' }}</h2>
            <div class="mb-4 space-y-3">
                <div v-if="!isBank">
                    <label class="required">Банк</label>
                    <select v-model="bank_id" required>
                        <option value="" disabled>Выберите банк...</option>
                        <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                </div>
                <div>
                    <label class="required">Продукт</label>
                    <input type="text" v-model="product" required />
                </div>
                <div>
                    <label class="required">Фамилия клиента</label>
                    <input type="text" v-model="surname" required />
                </div>
                <div>
                    <label class="required">Имя клиента</label>
                    <input type="text" v-model="name" required />
                </div>
                <div>
                    <label class="required">Отчество клиента</label>
                    <input type="text" v-model="patronymic" required />
                </div>
                <div>
                    <label class="required">Телефон клиента</label>
                    <input type="text" v-model="phone" required />
                </div>
                <div>
                    <label class="required">Адрес клиента</label>
                    <input type="text" v-model="address" required />
                </div>
                <div>
                    <label class="required">Дата и время доставки</label>
                    <input type="datetime-local" v-model="delivery_at" required />
                </div>
                <div v-if="!isBank">
                    <label>Курьер</label>
                    <select v-model="courier_id">
                        <option value="" disabled>Без курьера</option>
                        <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                </div>
                <div v-if="showStatusSelect">
                    <label class="required">Статус</label>
                    <select v-model="order_status_id" required>
                        <option value="" disabled>Выберите статус...</option>
                        <option v-for="s in filteredStatuses" :key="s.id" :value="s.id">{{ s.title }}</option>
                    </select>
                </div>
                <div v-if="isTransferOrCancelled">
                    <label class="required">Причина отмены</label>
                    <input type="text" v-model="declined_reason" required />
                </div>
                <div v-if="isTransfer">
                    <label class="required">Новая дата доставки</label>
                    <input type="datetime-local" v-model="delivery_at" required />
                </div>
                <div>
                    <label>Комментарий</label>
                    <textarea v-model="note" class="w-full border rounded px-3 py-2 resize-y min-h-[80px]" placeholder="Введите комментарий..."></textarea>
                </div>
            </div>

            <!-- Фотографии заказа -->
            <div v-if="editingItem" class="mt-6">
                <OrderPhotos
                    :order-id="editingItem.id"
                    :can-upload="false"
                    @error="showNotification"
                />
            </div>
        </div>
        <div v-if="activeTab === 'log'" class="p-4 flex-1 overflow-auto">
            <div v-if="logLoading">Загрузка...</div>
            <div v-else-if="activityLog.length === 0">Нет записей</div>
            <div v-else class="timeline">
                <div v-for="log in activityLog" :key="log.date + log.description" class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <b>{{ log.description }}</b>
                            <span class="text-xs text-gray-500 ml-2">{{ log.date }}</span>
                            <span v-if="log.user" class="text-xs text-gray-400 ml-2">({{ log.user }})</span>
                        </div>
                        <ul v-if="log.changes && Object.keys(log.changes).length" class="ml-2 mt-1">
                            <li v-for="(val, key) in log.changes" :key="key" class="text-xs">
                                <b>{{ key }}:</b>
                                <span v-if="val.old !== undefined && val.old !== null && val.old !== val.new && val.old !== ''">
                                    <span class="line-through text-gray-400">{{ val.old }}</span>
                                    <span class="mx-1 text-gray-500">→</span>
                                    <span class="font-semibold text-green-700">{{ val.new }}</span>
                                </span>
                                <span v-else>
                                    {{ val.new }}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-4 flex space-x-2 bg-[#edf4fb] p-4 rounded-xl">
            <PrimaryButton v-if="editingItem" :onclick="showDeleteDialog" :is-danger="true" :is-loading="deleteLoading"
                icon="fas fa-remove">Удалить</PrimaryButton>
            <PrimaryButton icon="fas fa-save" :onclick="save" :is-loading="saveLoading">Сохранить</PrimaryButton>
        </div>
        <AlertDialog :dialog="deleteDialog" @confirm="deleteItem" @leave="closeDeleteDialog"
            :descr="'Подтвердите удаление заявки'" :confirm-text="'Удалить'" :leave-text="'Отмена'" />
    </div>
</template>

<script>
import PrimaryButton from '@/components/PrimaryButton.vue';
import AlertDialog from '@/components/AlertDialog.vue';
import OrderPhotos from '@/components/OrderPhotos.vue';

import BanksController from '@/api/BanksController';
import UsersController from '@/api/UsersController';
import OrderStatusesController from '@/api/OrderStatusesController';
import OrdersController from '@/api/OrdersController';
import api from '@/api/api';

import FormModalMixin from '@/mixins/FormModalMixin';

export default {
    components: { PrimaryButton, AlertDialog, OrderPhotos },
    mixins: [FormModalMixin],
    props: { editingItem: { type: Object, default: null } },
    data() {
        return {
            bank_id: '',
            product: '',
            surname: '',
            name: '',
            patronymic: '',
            phone: '',
            address: '',
            delivery_at: '',
            courier_id: '',
            order_status_id: '',
            note: '',
            banks: [],
            couriers: [],
            statuses: [],
            declined_reason: '',
            activeTab: 'form',
            activityLog: [],
            logLoading: false,
        };
    },
    emits: ['saved', 'saved-error', 'deleted', 'deleted-error'],
    mounted() {
        this.loadDictionaries();
    },
    watch: {
        activeTab(newTab) {
            if (newTab === 'log' && this.editingItem) {
                this.loadActivityLog();
            }
        }
    },
    computed: {
        isTransfer() {
            return Number(this.order_status_id) === 5;
        },
        isCancelled() {
            return Number(this.order_status_id) === 6;
        },
        isTransferOrCancelled() {
            return this.isTransfer || this.isCancelled;
        },
        showStatusSelect() {
            return this.editingItem !== null;
        },
        user() {
            return JSON.parse(localStorage.getItem('user') || '{}');
        },
        isBank() {
            return this.user.role === 'bank';
        },
        filteredStatuses() {
            if (this.isBank) {
                // Только статус "Отменено" (id=6)
                return this.statuses.filter(s => Number(s.id) === 6);
            }
            return this.statuses;
        },
    },
    methods: {
        async loadDictionaries() {
            try {
                const [banks, couriers, statuses] = await Promise.all([
                    BanksController.getItems(),
                    UsersController.getCouriers(),
                    OrderStatusesController.getItems(),
                ]);
                this.banks = banks;
                this.couriers = couriers;
                this.statuses = statuses;
            } catch (error) {
                console.error('Ошибка при загрузке справочников:', error);
            }
        },
        async loadActivityLog() {
            this.logLoading = true;
            try {
                const logsByOrder = await OrdersController.getActivityLogsBatch([this.editingItem.id]);
                this.activityLog = logsByOrder[this.editingItem.id] || [];
            } catch {
                this.activityLog = [];
            } finally {
                this.logLoading = false;
            }
        },

        async save() {
            this.saveLoading = true;
            try {
                // Валидация для Перенос и Отмена
                if (this.isTransferOrCancelled && !this.declined_reason) {
                    this.$emit('saved-error', 'Причина отмены обязательна для выбранного статуса');
                    this.saveLoading = false;
                    return;
                }
                if (this.isTransfer && !this.delivery_at) {
                    this.$emit('saved-error', 'Новая дата обязательна для переноса');
                    this.saveLoading = false;
                    return;
                }
                const payload = {
                    bank_id: this.bank_id,
                    product: this.product,
                    surname: this.surname,
                    name: this.name,
                    patronymic: this.patronymic,
                    phone: this.phone,
                    address: this.address,
                    delivery_at: this.delivery_at,
                    courier_id: this.courier_id,
                    note: this.note,
                    declined_reason: this.isTransferOrCancelled ? this.declined_reason : undefined,
                };
                if (this.editingItem) {
                    payload.order_status_id = this.order_status_id;
                }

                const resp = this.editingItem
                    ? await api.put(`/orders/${this.editingItem.id}`, payload)
                    : await api.post(`/orders`, payload);

                this.$emit('saved', resp.data);
                this.clearForm();
            } catch (e) {
                this.$emit('saved-error', this.getApiErrorMessage(e));
            } finally {
                this.saveLoading = false;
            }
        },

        async _deleteItemApi(id) {
            return api.delete(`/orders/${id}`);
        },

        setFormFromItem(item) {
            if (!item) {
                this.bank_id = '';
                this.product = '';
                this.surname = '';
                this.name = '';
                this.patronymic = '';
                this.phone = '';
                this.address = '';
                this.delivery_at = this._getNowDateTimeLocal();
                this.courier_id = '';
                this.order_status_id = '';
                this.note = '';
                this.declined_reason = '';
            } else {
                this.bank_id = item.bank_id || item.bank?.id || '';
                this.product = item.product || '';
                this.surname = item.surname || '';
                this.name = item.name || '';
                this.patronymic = item.patronymic || '';
                this.phone = item.phone || '';
                this.address = item.address || '';
                this.delivery_at = item.delivery_at
                    ? item.delivery_at.slice(0, 16)
                    : this._getNowDateTimeLocal();
                this.courier_id = item.courier_id || item.courier?.id || '';
                this.order_status_id = item.order_status_id || item.status?.id || '';
                this.note = item.note || '';
                this.declined_reason = item.declined_reason || '';
            }
        },

        clearForm() {
            this.bank_id = '';
            this.product = '';
            this.surname = '';
            this.name = '';
            this.patronymic = '';
            this.phone = '';
            this.address = '';
            this.delivery_at = '';
            this.courier_id = '';
            this.order_status_id = '';
            this.note = '';
            this.declined_reason = '';
        },

        _getFormState() {
            return {
                bank_id: this.bank_id,
                product: this.product,
                surname: this.surname,
                name: this.name,
                patronymic: this.patronymic,
                phone: this.phone,
                address: this.address,
                delivery_at: this.delivery_at,
                courier_id: this.courier_id,
                order_status_id: this.order_status_id,
                note: this.note,
            };
        },

        _getNowDateTimeLocal() {
            const now = new Date();
            const offset = now.getTimezoneOffset();
            const local = new Date(now.getTime() - offset * 60 * 1000);
            return local.toISOString().slice(0, 16);
        },
    },
};
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
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
.tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timeline {
  position: relative;
  margin-left: 20px;
  padding-left: 20px;
  border-left: 2px solid #e5e7eb;
}
.timeline-item {
  position: relative;
  margin-bottom: 24px;
  padding-left: 16px;
}
.timeline-dot {
  position: absolute;
  left: -30px;
  top: 8px;
  width: 14px;
  height: 14px;
  background: #3b82f6;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #e5e7eb;
}
.timeline-content {
  background: #f9fafb;
  border-radius: 8px;
  padding: 10px 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.line-through {
  text-decoration: line-through;
}
</style>
