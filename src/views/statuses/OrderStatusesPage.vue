<template>
    <div class="flex justify-between items-center">
        <PrimaryButton :onclick="() => { showModal(null) }" icon="fas fa-plus">
            Добавить статус
        </PrimaryButton>
    </div>

    <transition name="fade" mode="out-in">
        <div v-if="!loading" key="table">
            <ResizableTable tableKey="order_statuses" :columnsConfig="columnsConfig" :tableData="statuses"
                :itemMapper="itemMapper" :onRowClick="showModal" />
        </div>
        <div v-else key="loader" class="flex justify-center items-center h-64">
            <i class="fas fa-spinner fa-spin text-2xl"></i>
        </div>
    </transition>

    <AppModal :show="modalDialog" :onclose="closeModal">
        <OrderStatusCreatePage ref="formComponent" @saved="handleSaved" @saved-error="handleSavedError"
            @deleted="handleDeleted" @deleted-error="handleDeletedError" :editingItem="editingItem" />
    </AppModal>
    <AlertDialog :dialog="modalCloseDialog" @confirm="confirmModalClose" @leave="modalCloseDialog = false"
        descr="Вы действительно хотите закрыть? Несохранённые изменения будут потеряны." />
    <NotificationToast :title="notificationTitle" :subtitle="notificationSubtitle" :show="notification"
        :is-danger="notificationIsDanger" />
</template>

<script>
import PrimaryButton from '@/components/PrimaryButton.vue'
import ResizableTable from '@/components/ResizableTable.vue'
import AppModal from '@/components/AppModal.vue'
import NotificationToast from '@/components/NotificationToast.vue'
import OrderStatusCreatePage from './OrderStatusCreatePage.vue'
import AlertDialog from '@/components/AlertDialog.vue'
import api from '@/api/api'

export default {
    components: {
        PrimaryButton,
        ResizableTable,
        AppModal,
        NotificationToast,
        OrderStatusCreatePage,
        AlertDialog
    },
    data() {
        return {
            statuses: [],
            loading: false,
            notification: false,
            notificationTitle: '',
            notificationSubtitle: '',
            notificationIsDanger: false,
            modalDialog: false,
            modalCloseDialog: false,
            editingItem: null,
            columnsConfig: [
                { name: 'id', label: 'ID' },
                { name: 'title', label: 'Название' },
                { name: 'color', label: 'Цвет', html: true },
            ]
        }
    },
    created() {
        this.fetchStatuses()
    },
    methods: {
        itemMapper(status, col) {
            switch (col) {
                case 'color':
                    return status.color
                        ? `<span class="px-2 py-1 rounded text-xs font-semibold" style="background:${status.color};color:#fff">${status.color}</span>`
                        : '-'
                default:
                    return status[col] || ''
            }
        },
        async fetchStatuses() {
            this.loading = true
            try {
                const res = await api.get('/order-statuses')
                this.statuses = res.data
            } catch (e) {
                this.showNotification('Ошибка загрузки', e.message || '', true)
            } finally {
                this.loading = false
            }
        },
        showModal(item = null) {
            this.modalDialog = true
            this.editingItem = item
        },
        closeModal() {
            this.modalDialog = false
            this.editingItem = null
        },
        confirmModalClose() {
            this.modalCloseDialog = false;
            this.closeModal();
        },
        handleSaved() {
            this.showNotification('Статус успешно сохранён', '', false)
            this.fetchStatuses()
            this.closeModal()
        },
        handleSavedError(m) {
            this.showNotification('Ошибка сохранения', m, true)
        },
        handleDeleted() {
            this.showNotification('Статус удалён', '', false)
            this.fetchStatuses()
            this.closeModal()
        },
        handleDeletedError(m) {
            this.showNotification('Ошибка удаления', m, true)
        },
        showNotification(title, subtitle = '', isDanger = false) {
            this.notificationTitle = title
            this.notificationSubtitle = subtitle
            this.notificationIsDanger = isDanger
            this.notification = true
            setTimeout(() => (this.notification = false), 3000)
        }
    }
}
</script>
