<template>
    <div class="flex justify-between items-center">
        <PrimaryButton :onclick="() => { showModal(null) }" icon="fas fa-plus">
            Добавить пользователя
        </PrimaryButton>
    </div>

    <transition name="fade" mode="out-in">
        <div v-if="!loading" key="table">
            <ResizableTable tableKey="users" :columnsConfig="columnsConfig" :tableData="users" :itemMapper="itemMapper"
                :onRowClick="showModal" />
        </div>
        <div v-else key="loader" class="flex justify-center items-center h-64">
            <i class="fas fa-spinner fa-spin text-2xl"></i>
        </div>
    </transition>

    <AppModal :show="modalDialog" :onclose="closeModal">
        <UserCreatePage ref="formComponent" @saved="handleSaved" @saved-error="handleSavedError"
            @deleted="handleDeleted" @deleted-error="handleDeletedError" :editingItem="editingItem" />
    </AppModal>
    <AlertDialog :dialog="modalCloseDialog" @confirm="confirmModalClose" @leave="modalCloseDialog = false"
        descr="Вы действительно хотите закрыть? Несохранённые изменения будут потеряны." />
    <NotificationToast :title="notificationTitle" :subtitle="notificationSubtitle" :show="notification"
        :is-danger="notificationIsDanger" />
</template>

<script>
import PrimaryButton from '@/components/PrimaryButton.vue';
import ResizableTable from '@/components/ResizableTable.vue';
import AppModal from '@/components/AppModal.vue';
import NotificationToast from '@/components/NotificationToast.vue';
import UserCreatePage from './UserCreatePage.vue';
import api from '@/api/api';
import AlertDialog from '@/components/AlertDialog.vue';

export default {
    components: {
        PrimaryButton,
        ResizableTable,
        AppModal,
        NotificationToast,
        UserCreatePage,
        AlertDialog
    },
    data() {
        return {
            users: [],
            loading: false,
            notification: false,
            notificationTitle: '',
            notificationSubtitle: '',
            notificationIsDanger: false,
            modalDialog: false,
            editingItem: null,
            modalCloseDialog: false,
            columnsConfig: [
                { name: 'id', label: 'ID', },
                { name: 'name', label: 'Имя', },
                { name: 'email', label: 'Email', },
                { name: 'phone', label: 'Телефон', },
                { name: 'role', label: 'Роль', html: true },
                { name: 'bank', label: 'Банк', },
                { name: 'is_active', label: 'Статус', html: true },
            ],
        }
    },
    created() {
        this.fetchUsers();
    },
    methods: {
        itemMapper(user, col) {
            switch (col) {
                case 'role':
                    const roleLabels = { admin: 'Админ', manager: 'Менеджер', courier: 'Курьер', bank: 'Банк' };
                    const cls = {
                        admin: 'bg-blue-100 text-blue-700',
                        courier: 'bg-green-100 text-green-700',
                        manager: 'bg-yellow-100 text-yellow-800',
                        bank: 'bg-purple-100 text-purple-700'
                    };
                    return `<span class="px-2 py-1 rounded text-xs font-semibold ${cls[user.role] || ''}">
                        ${roleLabels[user.role] || user.role}
                    </span>`;
                case 'is_active':
                    return `<span class="px-2 py-1 rounded text-xs font-semibold ${user.is_active ? 'bg-green-200 text-green-700' : 'bg-red-100 text-red-600'}">
                        ${user.is_active ? 'Активен' : 'Отключен'}
                    </span>`;
                case 'bank':
                    return user.bank?.name || '-';
                default:
                    return user[col] || '';
            }
        },
        async fetchUsers() {
            this.loading = true;
            try {
                const res = await api.get('/users?with[]=bank');
                this.users = res.data;
            } catch (e) {
                this.showNotification('Ошибка загрузки', e.message || '', true);
            } finally {
                this.loading = false;
            }
        },
        showModal(item = null) {
            this.modalDialog = true;
            this.editingItem = item;
        },
        closeModal() {
            this.modalDialog = false;
            this.editingItem = null;
        },
        handleSaved() {
            this.showNotification('Пользователь успешно сохранён', '', false);
            this.fetchUsers();
            this.closeModal();
        },
        handleSavedError(m) {
            this.showNotification('Ошибка сохранения', m, true);
        },
        handleDeleted() {
            this.showNotification('Пользователь удалён', '', false);
            this.fetchUsers();
            this.closeModal();
        },
        handleDeletedError(m) {
            this.showNotification('Ошибка удаления', m, true);
        },
        showNotification(title, subtitle = '', isDanger = false) {
            this.notificationTitle = title;
            this.notificationSubtitle = subtitle;
            this.notificationIsDanger = isDanger;
            this.notification = true;
            setTimeout(() => this.notification = false, 3000);
        },
        confirmModalClose() {
            this.modalCloseDialog = false;
            this.modalDialog = false;
            this.editingItem = null;
        }
    }
}
</script>
