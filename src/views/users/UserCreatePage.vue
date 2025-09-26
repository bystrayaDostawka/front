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
            <h2 class="text-lg font-bold mb-4">{{ editingItem ? 'Редактировать пользователя' : 'Создать пользователя' }}
            </h2>
            <div class="mb-4 space-y-3">
                <div>
                    <label class="required">Имя</label>
                    <input type="text" v-model="name" required />
                </div>
                <div>
                    <label class="required">Email</label>
                    <input type="email" v-model="email" required
                        :class="{'border-red-500': emailError}"
                        @input="validateEmail"
                        placeholder="user@example.com" />
                    <div v-if="emailError" class="text-xs text-red-500 mt-1">Введите корректный email</div>
                </div>
                <div>
                    <label>Телефон</label>
                    <input type="text" v-model="phone" required minlength="10"
                        :class="{'border-red-500': phoneError}"
                        @input="validatePhone"
                        placeholder="+7 (___) ___-__-__" />
                    <div v-if="phoneError" class="text-xs text-red-500 mt-1">Введите корректный номер телефона (только цифры, +, -, пробелы, скобки, минимум 10 символов)</div>
                </div>
                <div>
                    <label class="required">Роль</label>
                    <select v-model="role" required>
                        <option value="admin">Админ</option>
                        <option value="manager">Менеджер</option>
                        <option value="courier">Курьер</option>
                        <option value="bank">Банк</option>
                    </select>
                </div>
                <div v-if="role === 'bank'">
                    <label class="required">Банк</label>
                    <select v-model="bank_id" required>
                        <option value="" disabled>Выберите банк...</option>
                        <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                </div>
                <div>
                    <label>{{ editingItem ? "Новый пароль" : "Пароль" }}</label>
                    <div class="relative flex items-center">
                        <input :type="showPassword ? 'text' : 'password'" v-model="password" :required="!editingItem" minlength="6"
                            placeholder="Введите новый пароль" class="pr-20" />
                        <button type="button" class="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500" @click="generatePassword" tabindex="-1" title="Сгенерировать пароль">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        </button>
                        <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" @click="toggleShowPassword" tabindex="-1" title="Показать/скрыть пароль">
                            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.671-2.712A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.965 9.965 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                    </div>
                </div>
                <div>
                    <label>
                        <input type="checkbox" v-model="is_active" />
                        Активен
                    </label>
                </div>
                
                <!-- Банковский ключ доступа -->
                <div v-if="role === 'bank'">
                    <label class="required">Ключ доступа</label>
                    <div class="text-xs text-gray-500 mb-1">Debug: bankAccessKey = "{{ bankAccessKey }}"</div>
                    <div class="relative flex items-center">
                        <input 
                            v-model="bankAccessKey" 
                            type="text" 
                            placeholder="Введите ключ доступа" 
                            class="flex-1 border rounded px-3 py-2 font-mono pr-20"
                        />
                        <button 
                            type="button" 
                            @click="generateBankKey"
                            class="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500" 
                            title="Сгенерировать ключ"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <button 
                            type="button" 
                            @click="copyToClipboard(bankAccessKey)"
                            :disabled="!bankAccessKey"
                            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50" 
                            title="Копировать ключ"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Информация о сроке под полем -->
                    <div class="mt-1 flex items-center justify-between">
                        <div class="text-xs text-gray-500">
                            <span v-if="!editingItem || !editingItem.bank_key_expires_at">
                                Срок истечет через 30 дней с момента создания
                            </span>
                            <span v-else>
                                Срок истечет через 
                                <span 
                                    :class="[
                                        'font-medium',
                                        getDaysLeft(editingItem.bank_key_expires_at) <= 3 
                                            ? 'text-red-600' 
                                            : getDaysLeft(editingItem.bank_key_expires_at) <= 7 
                                                ? 'text-yellow-600'
                                                : 'text-green-600'
                                    ]"
                                >
                                    {{ getDaysLeft(editingItem.bank_key_expires_at) }} {{ getDaysLeft(editingItem.bank_key_expires_at) === 1 ? 'день' : getDaysLeft(editingItem.bank_key_expires_at) < 5 ? 'дня' : 'дней' }}
                                </span>
                            </span>
                        </div>
                        <div v-if="editingItem && editingItem.bank_key_expires_at" class="text-xs text-gray-400">
                            До {{ formatDate(editingItem.bank_key_expires_at) }}
                        </div>
                    </div>
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
            :descr="'Подтвердите удаление пользователя'" :confirm-text="'Удалить'" :leave-text="'Отмена'" />
    </div>
</template>

<script>
import PrimaryButton from '@/components/PrimaryButton.vue';
import AlertDialog from '@/components/AlertDialog.vue';
import UsersController from '@/api/UsersController';
import BanksController from '@/api/BanksController';
import FormModalMixin from '@/mixins/FormModalMixin';

export default {
    components: { PrimaryButton, AlertDialog },
    mixins: [FormModalMixin],
    props: {
        editingItem: { type: Object, default: null },
    },
    data() {
        return {
            name: '',
            email: '',
            phone: '',
            role: 'courier',
            bank_id: '',
            password: '',
            is_active: true,
            banks: [],
            activeTab: 'form',
            activityLog: [],
            logLoading: false,
            phoneError: false,
            emailError: false,
            showPassword: false,
            regeneratingKey: false,
            bankAccessKey: '',
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
        },
        editingItem: {
            handler(newItem) {
                if (newItem) {
                    this.setFormFromItem(newItem);
                } else {
                    this.clearForm();
                }
            },
            immediate: true
        },
        role(newRole) {
            // При изменении роли на bank, если есть editingItem с банковским ключом, устанавливаем его
            if (newRole === 'bank' && this.editingItem && this.editingItem.bank_access_key) {
                this.bankAccessKey = this.editingItem.bank_access_key;
            }
        }
    },
    emits: ['saved', 'saved-error', 'deleted', 'deleted-error'],
    mounted() {
        this.loadBanks();
    },
    methods: {
        async loadBanks() {
            try {
                this.banks = await BanksController.getItems();
            } catch (e) {
                console.error('Ошибка при загрузке банков:', e);
            }
        },

        async save() {
            this.validatePhone();
            this.validateEmail();
            if (this.phoneError || this.emailError) return;
            this.saveLoading = true;
            const payload = {
                name: this.name,
                email: this.email,
                phone: this.phone,
                role: this.role,
                bank_id: this.role === 'bank' ? this.bank_id : null,
                is_active: this.is_active,
            };
            if (this.password) payload.password = this.password;

            // Добавляем банковский ключ для банковских пользователей
            if (this.role === 'bank' && this.bankAccessKey) {
                payload.bank_access_key = this.bankAccessKey;
                payload.bank_key_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 дней
            }

            try {
                const saved = this.editingItem
                    ? await UsersController.updateItem(this.editingItem.id, payload)
                    : await UsersController.storeItem(payload);

                this.$emit('saved', saved);
                this.clearForm();
            } catch (e) {
                this.$emit('saved-error', this.getApiErrorMessage(e));
            } finally {
                this.saveLoading = false;
            }
        },

        async _deleteItemApi(id) {
            return UsersController.deleteItem(id);
        },

        setFormFromItem(item) {
            this.name = item?.name || '';
            this.email = item?.email || '';
            this.phone = item?.phone || '';
            this.role = item?.role || 'courier';
            this.bank_id = item?.bank_id || item?.bank?.id || '';
            this.password = '';
            this.is_active = item?.is_active ?? true;
            this.bankAccessKey = item?.bank_access_key || '';
        },

        clearForm() {
            this.name = '';
            this.email = '';
            this.phone = '';
            this.role = 'courier';
            this.bank_id = '';
            this.password = '';
            this.is_active = true;
            this.bankAccessKey = '';
        },

        _getFormState() {
            const state = {
                name: this.name,
                email: this.email,
                phone: this.phone,
                role: this.role,
                bank_id: this.bank_id,
                is_active: this.is_active,
            };

            // Добавляем банковский ключ только для банковских пользователей
            if (this.role === 'bank' && this.bankAccessKey) {
                state.bank_access_key = this.bankAccessKey;
                state.bank_key_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 дней
            }

            return state;
        },

        async loadActivityLog() {
            this.logLoading = true;
            try {
                const logsByUser = await UsersController.getActivityLogsBatch([this.editingItem.id]);
                this.activityLog = logsByUser[this.editingItem.id] || [];
            } catch {
                this.activityLog = [];
            } finally {
                this.logLoading = false;
            }
        },
        validatePhone() {
            // Разрешаем только цифры, пробелы, +, -, (, ) и минимум 10 символов
            const re = /^[\d\s+\-()]{10,}$/;
            this.phoneError = !re.test(this.phone);
        },
        validateEmail() {
            // Простая валидация email
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            this.emailError = !re.test(this.email);
        },
        toggleShowPassword() {
            this.showPassword = !this.showPassword;
        },
        generatePassword() {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=~[]{}:;,.?';
            let pass = '';
            for (let i = 0; i < 12; i++) {
                pass += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            this.password = pass;
            this.showPassword = true;
        },

        // Методы для работы с банковским ключом
        generateBankKey() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let key = '';
            for (let i = 0; i < 12; i++) {
                key += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            this.bankAccessKey = key;
        },

        async regenerateBankKey() {
            if (!this.editingItem) return;
            
            this.regeneratingKey = true;
            try {
                const response = await UsersController.regenerateBankKey(this.editingItem.id);
                this.editingItem.bank_access_key = response.bank_access_key;
                this.editingItem.bank_key_expires_at = response.bank_key_expires_at;
                // Обновляем поле ввода
                this.bankAccessKey = response.bank_access_key;
                this.$emit('saved', this.editingItem);
            } catch (e) {
                this.$emit('saved-error', this.getApiErrorMessage(e));
            } finally {
                this.regeneratingKey = false;
            }
        },

        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                // Можно добавить уведомление об успешном копировании
            }).catch(err => {
                // Ошибка копирования
            });
        },

        formatDate(dateString) {
            if (!dateString) return 'Не указано';
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },

        getDaysLeft(expiresAt) {
            if (!expiresAt) return 0;
            const now = new Date();
            const expiry = new Date(expiresAt);
            const diffTime = expiry - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
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
