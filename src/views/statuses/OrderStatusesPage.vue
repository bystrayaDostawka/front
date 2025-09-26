<template>
    <div class="flex justify-between items-center" v-if="canEdit">
        <PrimaryButton :onclick="() => { showModal(null) }" icon="fas fa-plus">
            Добавить статус
        </PrimaryButton>
    </div>

    <transition name="fade" mode="out-in">
        <div v-if="!loading" key="table">
            <ResizableTable tableKey="order_statuses" :columnsConfig="columnsConfig" :tableData="statuses"
                :itemMapper="itemMapper" :onRowClick="canEdit ? showModal : null" />
        </div>
        <div v-else key="loader" class="flex justify-center items-center h-64">
            <i class="fas fa-spinner fa-spin text-2xl"></i>
        </div>
    </transition>

    <AppModal v-if="canEdit" :show="modalDialog" :onclose="closeModal">
        <OrderStatusCreatePage ref="formComponent" @saved="handleSaved" @saved-error="handleSavedError"
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
import OrderStatusCreatePage from './OrderStatusCreatePage.vue';
import AlertDialog from '@/components/AlertDialog.vue';

import OrderStatusesController from '@/api/OrderStatusesController';
import ModalTableMixin from '@/mixins/ModalTableMixin';

export default {
    components: {
        PrimaryButton,
        ResizableTable,
        AppModal,
        NotificationToast,
        OrderStatusCreatePage,
        AlertDialog,
    },
    mixins: [ModalTableMixin],
    data() {
        return {
            statuses: [],
            columnsConfig: [
                { name: 'id', label: 'ID' },
                { name: 'title', label: 'Название' },
                { name: 'color', label: 'Цвет', html: true },
            ],
        };
    },
    computed: {
        canEdit() {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return ['admin', 'manager'].includes(user.role);
        },
    },
    created() {
        this.fetchItems();
    },
    methods: {
        async fetchItems() {
            this.loading = true;
            try {
                this.statuses = await OrderStatusesController.getItems();
            } catch (e) {
                this.showNotification('Ошибка загрузки', e.message || '', true);
            } finally {
                this.loading = false;
            }
        },
        showModal(item) {
            if (!this.canEdit) return;
            this.editingItem = item;
            this.modalDialog = true;
        },
        itemMapper(status, col) {
            if (col === 'color') return status.getFormattedColor();
            return status[col] || '';
        },
    },
};
</script>
