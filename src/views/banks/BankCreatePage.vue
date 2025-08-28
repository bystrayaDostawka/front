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
        {{ editingItem ? "Редактировать банк" : "Создать банк" }}
      </h2>
      <div class="mb-4 space-y-3">
        <div>
          <label class="required">Название</label>
          <input type="text" v-model="name" required />
        </div>
        <div>
          <label>Телефон</label>
          <input type="text" v-model="phone" />
        </div>
        <div>
          <label>Email</label>
          <input type="email" v-model="email" />
        </div>
        <div>
          <label>Префикс для номеров заказов</label>
          <input type="text" v-model="orderPrefix" placeholder="Например: РГ" maxlength="10" />
          <div class="text-xs text-gray-500 mt-1">
            Префикс для автоматической генерации номеров заказов (например: РГ00001, СБ00001)
          </div>
        </div>
      </div>
      <div v-if="editingItem" class="mt-6">
        <h3 class="text-base font-semibold mb-2">Пользователи банка</h3>
        <div v-if="usersLoading" class="text-gray-500">Загрузка...</div>
        <div v-else-if="bankUsers.length === 0" class="text-gray-400">Нет пользователей</div>
        <ul v-else class="space-y-1">
          <li v-for="user in bankUsers" :key="user.id" class="p-2 rounded bg-gray-50 border flex flex-col md:flex-row md:items-center md:space-x-4 cursor-pointer hover:bg-blue-50 transition"
              @click="openUserModal(user)">
            <span class="font-medium">{{ user.surname }} {{ user.name }} {{ user.patronymic }}</span>
            <span class="text-xs text-gray-500">{{ user.email }}</span>
            <span class="text-xs text-gray-500">{{ user.phone }}</span>
          </li>
        </ul>
        <AppModal :show="showUserModal" :onclose="closeUserModal">
          <UserCreatePage v-if="selectedUser" :editingItem="selectedUser" @saved="handleUserSaved" @deleted="handleUserSaved" @saved-error="handleUserError" @deleted-error="handleUserError" />
        </AppModal>
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
      :descr="'Подтвердите удаление банка'" :confirm-text="'Удалить'" :leave-text="'Отмена'" />
  </div>
</template>

<script>
import FormModalMixin from '@/mixins/FormModalMixin';
import BanksController from '@/api/BanksController';
import AlertDialog from '@/components/AlertDialog.vue';
import PrimaryButton from '@/components/PrimaryButton.vue';
import UsersController from '@/api/UsersController';
import AppModal from '@/components/AppModal.vue';
import UserCreatePage from '@/views/users/UserCreatePage.vue';

export default {
  components: { AlertDialog, PrimaryButton, AppModal, UserCreatePage },
  mixins: [FormModalMixin],
  data() {
    return {
      name: '',
      phone: '',
      email: '',
      orderPrefix: '',
      activeTab: 'form',
      activityLog: [],
      logLoading: false,
      usersLoading: false,
      allUsers: [],
      showUserModal: false,
      selectedUser: null,
    };
  },
  computed: {
    user() {
      return JSON.parse(localStorage.getItem('user') || '{}');
    },
    bankUsers() {
      if (!this.editingItem) return [];
      return this.allUsers.filter(u => u.bank_id == this.editingItem.id);
    },
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'log' && this.editingItem) {
        this.loadActivityLog();
      }
    },
    editingItem: {
      immediate: true,
      handler(newVal) {
        if (newVal) this.loadBankUsers();
      }
    }
  },
  methods: {
    async save() {
      this.saveLoading = true;
      try {
        const payload = {
          name: this.name,
          phone: this.phone,
          email: this.email,
          order_prefix: this.orderPrefix,
        };
        const result = this.editingItem
          ? await BanksController.updateItem(this.editingItem.id, payload)
          : await BanksController.storeItem(payload);

        this.$emit('saved', result);
        this.clearForm();
      } catch (e) {
        this.$emit('saved-error', this.getApiErrorMessage(e));
      } finally {
        this.saveLoading = false;
      }
    },
    async _deleteItemApi(id) {
      return BanksController.deleteItem(id);
    },
    setFormFromItem(item) {
      this.name = item?.name || '';
      this.phone = item?.phone || '';
      this.email = item?.email || '';
      this.orderPrefix = item?.order_prefix || '';
    },
    clearForm() {
      this.name = '';
      this.phone = '';
      this.email = '';
      this.orderPrefix = '';
    },
    _getFormState() {
      return {
        name: this.name,
        phone: this.phone,
        email: this.email,
        order_prefix: this.orderPrefix,
      };
    },
    async loadActivityLog() {
      this.logLoading = true;
      try {
        const logsByBank = await BanksController.getActivityLogsBatch([this.editingItem.id]);
        this.activityLog = logsByBank[this.editingItem.id] || [];
      } catch {
        this.activityLog = [];
      } finally {
        this.logLoading = false;
      }
    },
    async loadBankUsers() {
      this.usersLoading = true;
      try {
        const users = await UsersController.getItems();
        this.allUsers = users;
      } catch {
        this.allUsers = [];
      } finally {
        this.usersLoading = false;
      }
    },
    openUserModal(user) {
      this.selectedUser = user;
      this.showUserModal = true;
    },
    closeUserModal() {
      this.showUserModal = false;
      this.selectedUser = null;
    },
    handleUserSaved() {
      this.closeUserModal();
      this.loadBankUsers();
    },
    handleUserError() {
      // Можно добавить показ уведомления об ошибке
      this.closeUserModal();
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
