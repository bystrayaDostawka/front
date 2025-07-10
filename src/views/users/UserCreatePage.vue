<template>
    <div class="flex flex-col h-full overflow-hidden">
        <div class="flex-1 overflow-auto p-4">
            <h2 class="text-lg font-bold mb-4">{{ editingItem ? 'Редактировать пользователя' : 'Создать пользователя' }}
            </h2>
            <div class="mb-4 space-y-3">
                <div>
                    <label class="required">Имя</label>
                    <input type="text" v-model="name" required />
                </div>
                <div>
                    <label class="required">Email</label>
                    <input type="email" v-model="email" required />
                </div>
                <div>
                    <label>Телефон</label>
                    <input type="text" v-model="phone" />
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
                    <input type="password" v-model="password" :required="!editingItem" minlength="6"
                        placeholder="Введите новый пароль" />
                </div>
                <div>
                    <label>
                        <input type="checkbox" v-model="is_active" />
                        Активен
                    </label>
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
import api from '@/api/api';

export default {
    components: { PrimaryButton, AlertDialog },
    props: {
        editingItem: { type: Object, default: null }
    },
    data() {
        return {
            initialState: {},
            name: this.editingItem?.name || '',
            email: this.editingItem?.email || '',
            password: '',
            phone: this.editingItem?.phone || '',
            role: this.editingItem?.role || 'courier',
            bank: this.editingItem?.bank?.name || '',
            is_active: this.editingItem?.is_active ?? true,
            saveLoading: false,
            deleteDialog: false,
            deleteLoading: false,
            banks: [],
            bank_id: this.editingItem?.bank_id || '',
        }
    },
    emits: ['saved', 'saved-error', 'deleted', 'deleted-error'],
    watch: {
        editingItem: {
            immediate: true,
            handler(val) {
                if (!val) {
                    this.name = '';
                    this.email = '';
                    this.phone = '';
                    this.role = 'courier';
                    this.bank_id = '';
                    this.password = '';
                    this.is_active = true;
                } else {
                    this.name = val.name || '';
                    this.email = val.email || '';
                    this.phone = val.phone || '';
                    this.role = val.role || 'courier';
                    this.bank_id = val.bank_id || val.bank?.id || '';
                    this.password = '';
                    this.is_active = val.is_active ?? true;
                }
                this.$nextTick(() => {
                    this.initialState = this._getFormState();
                });
            }
        }
    },
    mounted() {
        this.loadBanks();
        this.initialState = this._getFormState();
    },
    methods: {
        async loadBanks() {
            try {
                const res = await api.get('/banks');
                this.banks = res.data;
            } catch (e) {
                this.banks = [];
            }
        },
        async save() {
            this.saveLoading = true;
            try {
                const user = {
                    name: this.name,
                    email: this.email,
                    phone: this.phone,
                    role: this.role,
                    bank_id: this.bank_id,
                    is_active: this.is_active,
                };
                if (this.password) {
                    user.password = this.password;
                }

                let resp;
                if (this.editingItem) {
                    resp = await api.put(`/users/${this.editingItem.id}`, user);
                } else {
                    resp = await api.post('/users', user);
                }
                this.$emit('saved', resp.data);
                this.clearForm();
            } catch (e) {
                this.$emit('saved-error', this.getApiErrorMessage(e));
            }
            this.saveLoading = false;
        },
        async deleteItem() {
            this.closeDeleteDialog();
            if (!this.editingItem) return;
            this.deleteLoading = true;
            try {
                await api.delete(`/users/${this.editingItem.id}`);
                this.$emit('deleted');
            } catch (e) {
                this.$emit('deleted-error', this.getApiErrorMessage(e));
            }
            this.deleteLoading = false;
        },
        showDeleteDialog() {
            this.deleteDialog = true;
        },
        closeDeleteDialog() {
            this.deleteDialog = false;
        },
        clearForm() {
            this.name = '';
            this.email = '';
            this.phone = '';
            this.role = 'courier';
            this.bank = '';
            this.password = '';
            this.is_active = true;
        },
        getApiErrorMessage(e) {
            let message = 'Ошибка';
            if (e.response && e.response.data) {
                if (e.response.data.message) {
                    message = e.response.data.message;
                }
                if (e.response.data.errors) {
                    message += ': ' + Object.values(e.response.data.errors).flat().join('; ');
                }
            } else if (e.message) {
                message = e.message;
            }
            return message;
        },
        _getFormState() {
            return {
                name: this.name,
                email: this.email,
                phone: this.phone,
                role: this.role,
                bank: this.bank,
                is_active: this.is_active,
            }
        },
        isDirty() {
            return JSON.stringify(this._getFormState()) !== JSON.stringify(this.initialState);
        },
    }
}
</script>
