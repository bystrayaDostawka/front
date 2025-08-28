<template>
    <div class="flex justify-between items-center">
        <PrimaryButton :onclick="() => {
            showModal(null);
        }
            " icon="fas fa-plus">
            Добавить банк
        </PrimaryButton>
    </div>

    <transition name="fade" mode="out-in">
        <div v-if="!loading" key="table">
            <ResizableTable tableKey="banks" :columnsConfig="columnsConfig" :tableData="banks" :itemMapper="itemMapper"
                :onRowClick="showModal" />
        </div>
        <div v-else key="loader" class="flex justify-center items-center h-64">
            <i class="fas fa-spinner fa-spin text-2xl"></i>
        </div>
    </transition>

    <AppModal :show="modalDialog" :onclose="closeModal">
        <BankCreatePage ref="formComponent" @saved="handleSaved" @saved-error="handleSavedError"
            @deleted="handleDeleted" @deleted-error="handleDeletedError" :editingItem="editingItem" />
    </AppModal>
    <AlertDialog :dialog="modalCloseDialog" @confirm="confirmModalClose" @leave="modalCloseDialog = false"
        descr="Вы действительно хотите закрыть? Несохранённые изменения будут потеряны." />
    <NotificationToast :title="notificationTitle" :subtitle="notificationSubtitle" :show="notification"
        :is-danger="notificationIsDanger" />
</template>

<script>
import PrimaryButton from "@/components/PrimaryButton.vue";
import ResizableTable from "@/components/ResizableTable.vue";
import AppModal from "@/components/AppModal.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import AlertDialog from "@/components/AlertDialog.vue";
import BankCreatePage from "./BankCreatePage.vue";

import BanksController from "@/api/BanksController";
import ModalTableMixin from "@/mixins/ModalTableMixin";

export default {
    components: {
        PrimaryButton,
        ResizableTable,
        AppModal,
        NotificationToast,
        AlertDialog,
        BankCreatePage,
    },
    mixins: [ModalTableMixin],
    data() {
        return {
            banks: [],
            columnsConfig: [
                { name: "id", label: "ID" },
                { name: "name", label: "Название" },
                { name: "phone", label: "Телефон" },
                { name: "email", label: "Email" },
                { name: "order_prefix", label: "Префикс заказов" },
            ],
        };
    },
    created() {
        this.fetchItems();
    },
    methods: {
        async fetchItems() {
            this.loading = true;
            try {
                this.banks = await BanksController.getItems();
            } catch (e) {
                this.showNotification("Ошибка загрузки", e.message || "", true);
            } finally {
                this.loading = false;
            }
        },
        itemMapper(bank, col) {
            return bank[col] || "";
        },
    },
};
</script>
