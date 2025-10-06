<template>
    <div class="flex flex-col h-full overflow-hidden">
        <div class="p-4 border-b">
            <h2 class="text-lg font-bold mb-4">{{ editingItem ? 'Редактировать заявку' : 'Создать заявку' }}</h2>
            <div class="tabs">
                <button
                    :class="['tab', { active: activeTab === 'form' }]"
                    @click="activeTab = 'form'"
                >Форма</button>
                <button
                    v-if="editingItem"
                    :class="['tab', { active: activeTab === 'photos' }]"
                    @click="activeTab = 'photos'"
                >Фотографии</button>
                <button
                    :class="['tab', { active: activeTab === 'files' }]"
                    @click="activeTab = 'files'"
                >Файлы</button>
                <button
                    v-if="editingItem && user.role !== 'bank'"
                    :class="['tab', { active: activeTab === 'comments' }]"
                    @click="activeTab = 'comments'"
                >Комментарии</button>
                <button
                    v-if="user.role !== 'bank' && user.role !== 'manager'"
                    :class="['tab', { active: activeTab === 'log' }]"
                    @click="activeTab = 'log'"
                    :disabled="!editingItem"
                >Лог</button>
            </div>
        </div>
        <div v-if="activeTab === 'form'" class="flex-1 overflow-auto p-4">
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
                    
                    <!-- Выбор даты -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Дата доставки</label>
                        <input 
                            type="date" 
                            v-model="delivery_date" 
                            :min="minDate"
                            @change="onDeliveryDateChange"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required 
                        />
                    </div>
                    
                    <!-- Временные слоты -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-3">Выберите время доставки</label>
                        <div class="grid grid-cols-2 gap-3">
                            <div 
                                v-for="slot in timeSlots" 
                                :key="slot.value"
                                :class="[
                                    'border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
                                    delivery_time_range === slot.value 
                                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                                        : 'border-gray-200 hover:border-blue-300'
                                ]"
                                @click="selectTimeSlot(slot.value)"
                            >
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="font-semibold text-gray-900">{{ slot.label }}</div>
                                        <div class="text-sm text-gray-600">{{ slot.description }}</div>
                                    </div>
                                    <div v-if="delivery_time_range === slot.value" class="text-blue-500">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Показываем выбранное время -->
                    <div v-if="delivery_date && delivery_time_range" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-calendar-check text-green-600 mr-2"></i>
                            <span class="text-green-800 font-medium">
                                Выбрано: {{ formatDeliveryDate }} - {{ getTimeSlotLabel(delivery_time_range) }}
                            </span>
                        </div>
                    </div>
                </div>
                <div v-if="!isBank">
                    <label>Курьер</label>
                    <select v-model="courier_id">
                        <option value="" disabled>Без курьера</option>
                        <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                </div>
                <div v-if="showStatusSelect">
                    <label>Статус</label>
                    <select v-model="order_status_id">
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
                    <label>Примечание</label>
                    <textarea v-model="note" class="w-full border rounded px-3 py-2 resize-y min-h-[80px]" placeholder="Введите примечание..."></textarea>
                </div>
            </div>

        </div>
        <div v-if="activeTab === 'photos'" class="p-4 flex-1 overflow-auto">
            <OrderPhotos
                :order-id="editingItem.id"
                :can-upload="false"
                :can-delete="canDeletePhotos"
                @error="showNotification"
            />
        </div>
        <div v-if="activeTab === 'files'" class="p-4 flex-1 overflow-auto">
            <div v-if="editingItem">
                <OrderFiles
                    :order-id="editingItem.id"
                    :can-upload="canUploadFiles"
                    :current-user="currentUser"
                    @error="showNotification"
                />
            </div>
            <div v-else class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="mt-2 text-sm text-gray-500">
                    Сначала сохраните заявку, чтобы загружать файлы
                </p>
            </div>
        </div>
        <div v-if="activeTab === 'comments'" class="p-4 flex-1 overflow-auto">
            <OrderComments
                :order-id="editingItem.id"
            />
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
            <PrimaryButton v-if="editingItem && !isBank" :onclick="showDeleteDialog" :is-danger="true" :is-loading="deleteLoading"
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
import OrderFiles from '@/components/OrderFiles.vue';
import OrderComments from '@/components/OrderComments.vue';

import BanksController from '@/api/BanksController';
import UsersController from '@/api/UsersController';
import OrderStatusesController from '@/api/OrderStatusesController';
import OrdersController from '@/api/OrdersController';
import api from '@/api/api';

import FormModalMixin from '@/mixins/FormModalMixin';

export default {
    components: { PrimaryButton, AlertDialog, OrderPhotos, OrderFiles, OrderComments },
    mixins: [FormModalMixin],
    emits: ['saved', 'saved-error', 'deleted', 'deleted-error', 'notification'],
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
            delivery_date: '',
            delivery_time_range: '',
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
        console.log('OrderCreatePage mounted:', {
            editingItem: this.editingItem,
            isBank: this.isBank,
            user: this.user
        });
        
        this.loadDictionaries();
        // Для банковских пользователей устанавливаем их банк по умолчанию
        if (this.isBank && this.user.bank_id) {
            this.bank_id = this.user.bank_id;
        }
    },
    watch: {
        async activeTab(newTab) {
            console.log('OrderCreatePage activeTab changed to:', newTab);
            if (newTab === 'log' && this.editingItem) {
                this.loadActivityLog();
            }
        },
        delivery_date(newDate) {
            console.log('delivery_date changed to:', newDate);
            this.updateDeliveryDateTime();
        },
        delivery_time_range(newTimeRange) {
            console.log('delivery_time_range changed to:', newTimeRange);
            this.updateDeliveryDateTime();
        }
    },
    computed: {
        isTransfer() {
            return Number(this.order_status_id) === 5;
        },
        isCancelled() {
            return Number(this.order_status_id) === 6;
        },
        isCompleted() {
            // Проверяем, является ли текущий статус заказа "Завершено" (id=4)
            return this.editingItem && Number(this.editingItem.order_status_id) === 4;
        },
        isTransferOrCancelled() {
            return this.isTransfer || this.isCancelled;
        },
        showStatusSelect() {
            // Для банковских сотрудников статус виден только при редактировании
            // и только если текущий статус не "Завершено"
            const result = this.isBank 
                ? (this.editingItem !== null && !this.isCompleted)
                : (this.editingItem !== null);
            
            console.log('showStatusSelect:', {
                isBank: this.isBank,
                editingItem: this.editingItem,
                isCompleted: this.isCompleted,
                result: result
            });
            
            return result;
        },
        user() {
            return JSON.parse(localStorage.getItem('user') || '{}');
        },
        isBank() {
            return this.user.role === 'bank';
        },
        filteredStatuses() {
            if (this.isBank && this.editingItem) {
                // При редактировании банковские пользователи могут менять только на "Отменено" (id=6)
                // и только если текущий статус не "Завершено"
                if (!this.isCompleted) {
                    return this.statuses.filter(s => Number(s.id) === 6);
                }
                return [];
            }
            return this.statuses;
        },
        userBankName() {
            if (this.isBank && this.user.bank) {
                return this.user.bank.name;
            }
            // Если нет объекта bank, но есть bank_id, попробуем найти банк в списке
            if (this.isBank && this.user.bank_id && this.banks.length > 0) {
                const bank = this.banks.find(b => b.id === this.user.bank_id);
                if (bank) {
                    return bank.name;
                }
            }
            return '';
        },
        canUploadFiles() {
            // Все пользователи кроме курьеров могут загружать файлы
            return this.user.role !== 'courier';
        },
        canDeletePhotos() {
            // Админы и менеджеры могут удалять фотографии
            return ['admin', 'manager'].includes(this.user.role);
        },
        currentUser() {
            return this.user;
        },
        timeSlots() {
            return [
                { value: '10-14', label: '10:00 - 14:00', description: 'Утренняя доставка' },
                { value: '12-16', label: '12:00 - 16:00', description: 'Дневная доставка' },
                { value: '14-18', label: '14:00 - 18:00', description: 'Послеобеденная доставка' },
                { value: '16-20', label: '16:00 - 20:00', description: 'Вечерняя доставка' }
            ];
        },
        minDate() {
            // Минимальная дата - сегодня
            return new Date().toISOString().split('T')[0];
        },
        formatDeliveryDate() {
            if (!this.delivery_date) return '';
            const date = new Date(this.delivery_date);
            return date.toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    },
    methods: {
        showNotification(title, message, isError = false) {
            // Эмитим событие для родительского компонента
            this.$emit('notification', { title, message, isError });
        },
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
                // После загрузки банков, если мы банковский пользователь, устанавливаем банк
                if (this.isBank && this.user.bank_id) {
                    this.bank_id = this.user.bank_id;
                }
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
                // Валидация даты и времени доставки
                if (!this.delivery_date) {
                    this.$emit('saved-error', 'Дата доставки обязательна');
                    this.saveLoading = false;
                    return;
                }
                if (!this.delivery_time_range) {
                    this.$emit('saved-error', 'Время доставки обязательно');
                    this.saveLoading = false;
                    return;
                }
                
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
                // Формируем delivery_at из delivery_date и delivery_time_range
                let delivery_at = this.delivery_at;
                if (this.delivery_date && this.delivery_time_range && !delivery_at) {
                    const [startTime] = this.delivery_time_range.split('-');
                    delivery_at = `${this.delivery_date}T${startTime}:00`;
                }

                // Дополнительная валидация delivery_at
                if (!delivery_at) {
                    this.$emit('saved-error', 'Дата и время доставки обязательны');
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
                    delivery_at: delivery_at,
                    delivery_time_range: this.delivery_time_range,
                    note: this.note,
                    declined_reason: this.isTransferOrCancelled ? this.declined_reason : undefined,
                };

                // Банковские пользователи не могут назначать курьера
                if (!this.isBank) {
                    payload.courier_id = this.courier_id;
                }

                if (this.editingItem) {
                    payload.order_status_id = this.order_status_id;
                }

                console.log('OrderCreatePage save payload:', payload);
                console.log('OrderCreatePage editingItem:', this.editingItem);
                console.log('OrderCreatePage isBank:', this.isBank);
                
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
                this.bank_id = this.isBank ? this.user.bank_id : '';
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
                // Для банковских пользователей при редактировании банк остается их банком
                this.bank_id = this.isBank ? this.user.bank_id : (item.bank_id || item.bank?.id || '');
                this.product = item.product || '';
                this.surname = item.surname || '';
                this.name = item.name || '';
                this.patronymic = item.patronymic || '';
                this.phone = item.phone || '';
                this.address = item.address || '';
                this.delivery_at = item.delivery_at
                    ? item.delivery_at.slice(0, 16)
                    : this._getNowDateTimeLocal();
                // Загружаем временной диапазон из БД или парсим из delivery_at
                this.delivery_time_range = item.delivery_time_range || '';
                this.delivery_date = item.delivery_date || '';
                // Парсим дату и время для новых полей если не загружены из БД
                if (!this.delivery_time_range || !this.delivery_date) {
                    this.parseDeliveryDateTime();
                } else {
                    // Если есть и дата и время, обновляем delivery_at
                    this.updateDeliveryDateTime();
                }
                // Банковские пользователи не могут менять курьера
                this.courier_id = this.isBank ? '' : (item.courier_id || item.courier?.id || '');
                this.order_status_id = item.order_status_id || item.status?.id || '';
                this.note = item.note || '';
                this.declined_reason = item.declined_reason || '';
            }
        },
        clearForm() {
            // Сохраняем bank_id для банковских пользователей
            if (!this.isBank) {
                this.bank_id = '';
            }
            this.product = '';
            this.surname = '';
            this.name = '';
            this.patronymic = '';
            this.phone = '';
            this.address = '';
            this.delivery_at = '';
            this.delivery_date = '';
            this.delivery_time_range = '';
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

        // Методы для работы с временными слотами
        selectTimeSlot(timeRange) {
            this.delivery_time_range = timeRange;
            this.updateDeliveryDateTime();
        },

        updateDeliveryDateTime() {
            if (this.delivery_date && this.delivery_time_range) {
                const [startTime] = this.delivery_time_range.split('-');
                this.delivery_at = `${this.delivery_date}T${startTime}:00`;
                console.log('Updated delivery_at:', this.delivery_at, 'from date:', this.delivery_date, 'and time range:', this.delivery_time_range);
                console.log('Available timeSlots:', this.timeSlots.map(s => s.value));
            }
        },

        // Метод для обновления времени при изменении даты
        onDeliveryDateChange() {
            this.updateDeliveryDateTime();
        },

        // Метод для обновления времени при изменении временного диапазона
        onTimeRangeChange() {
            this.updateDeliveryDateTime();
        },

        getTimeSlotLabel(timeRange) {
            const slot = this.timeSlots.find(s => s.value === timeRange);
            return slot ? slot.label : timeRange;
        },

        // Метод для парсинга существующей даты доставки
        parseDeliveryDateTime() {
            if (this.delivery_at) {
                const dateTime = new Date(this.delivery_at);
                this.delivery_date = dateTime.toISOString().split('T')[0];
                
                const hour = dateTime.getHours();
                let timeRange = '';
                
                // Обновленная логика для непересекающихся диапазонов
                if (hour >= 10 && hour < 12) timeRange = '10-14';
                else if (hour >= 12 && hour < 14) timeRange = '12-16';
                else if (hour >= 14 && hour < 16) timeRange = '14-18';
                else if (hour >= 16 && hour < 20) timeRange = '16-20';
                
                console.log('parseDeliveryDateTime:', {
                    original_delivery_at: this.delivery_at,
                    parsed_hour: hour,
                    determined_timeRange: timeRange
                });
                
                this.delivery_time_range = timeRange;
            }
        },
    },
};
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 2px;
  background: #f1f5f9;
  padding: 2px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.tab {
  padding: 6px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  color: #64748b;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}
.tab:hover {
  background: #e2e8f0;
  color: #475569;
}
.tab.active {
  background: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
}
.tab.active:hover {
  background: #2563eb;
}
.tab:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: transparent;
}
.tab:disabled:hover {
  background: transparent;
  color: #64748b;
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