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
            <h2 class="text-lg font-bold mb-4">
                {{ editingItem ? 'Редактировать статус' : 'Создать статус' }}
            </h2>
            <div class="mb-4 space-y-3">
                <div>
                    <label class="required">Название</label>
                    <input type="text" v-model="title" required />
                </div>
                <div>
                    <label>Цвет</label>
                    <input type="color" v-model="color" style="width:40px; height:32px; vertical-align:middle" />
                    <input type="text" v-model="color" placeholder="#HEX" style="width:90px; margin-left: 12px" />
                </div>
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
            :descr="'Подтвердите удаление статуса'" :confirm-text="'Удалить'" :leave-text="'Отмена'" />
    </div>
</template>

<script>
import PrimaryButton from '@/components/PrimaryButton.vue';
import AlertDialog from '@/components/AlertDialog.vue';

import OrderStatusesController from '@/api/OrderStatusesController';
import OrderStatusDto from '@/dto/orders/OrderStatusDto';
import FormModalMixin from '@/mixins/FormModalMixin';

export default {
    components: { PrimaryButton, AlertDialog },
    mixins: [FormModalMixin],
    props: {
        editingItem: { type: Object, default: null },
    },
    emits: ['saved', 'saved-error', 'deleted', 'deleted-error'],
    data() {
        return {
            title: '',
            color: '#409eff',
            activeTab: 'form',
            activityLog: [],
            logLoading: false,
        };
    },
    computed: {
        user() {
            return JSON.parse(localStorage.getItem('user') || '{}');
        },
    },
    watch: {
        activeTab(newTab) {
            if (newTab === 'log' && this.editingItem) {
                this.loadActivityLog();
            }
        }
    },
    methods: {
        async save() {
            this.saveLoading = true;
            try {
                const dto = new OrderStatusDto({
                    title: this.title,
                    color: this.color,
                });

                const saved = this.editingItem?.id
                    ? await OrderStatusesController.updateItem(this.editingItem.id, dto)
                    : await OrderStatusesController.createItem(dto);

                this.$emit('saved', saved);
                this.clearForm();
            } catch (e) {
                this.$emit('saved-error', this.getApiErrorMessage(e));
            } finally {
                this.saveLoading = false;
            }
        },

        async _deleteItemApi(id) {
            return OrderStatusesController.deleteItem(id);
        },

        setFormFromItem(item) {
            this.title = item?.title || '';
            this.color = item?.color || '#409eff';
        },

        clearForm() {
            this.title = '';
            this.color = '#409eff';
        },

        _getFormState() {
            return {
                title: this.title,
                color: this.color,
            };
        },

        async loadActivityLog() {
            this.logLoading = true;
            try {
                const logsByStatus = await OrderStatusesController.getActivityLogsBatch([this.editingItem.id]);
                this.activityLog = logsByStatus[this.editingItem.id] || [];
            } catch {
                this.activityLog = [];
            } finally {
                this.logLoading = false;
            }
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
