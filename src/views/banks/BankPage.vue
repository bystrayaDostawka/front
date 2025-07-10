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
import api from "@/api/api";

export default {
    components: {
        PrimaryButton,
        ResizableTable,
        AppModal,
        NotificationToast,
        AlertDialog,
        BankCreatePage,
    },
    data() {
        return {
            banks: [],
            loading: false,
            notification: false,
            notificationTitle: "",
            notificationSubtitle: "",
            notificationIsDanger: false,
            modalDialog: false,
            modalCloseDialog: false,
            editingItem: null,
            columnsConfig: [
                { name: "id", label: "ID" },
                { name: "name", label: "Название" },
                { name: "phone", label: "Телефон" },
                { name: "email", label: "Email" },
            ],
        };
    },
    created() {
        this.fetchBanks();
    },
    methods: {
        itemMapper(bank, col) {
            return bank[col] || "";
        },
        async fetchBanks() {
            this.loading = true;
            try {
                const res = await api.get("/banks");
                this.banks = res.data;
            } catch (e) {
                this.showNotification("Ошибка загрузки", e.message || "", true);
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
        confirmModalClose() {
            this.modalCloseDialog = false;
            this.closeModal();
        },
        handleSaved() {
            this.showNotification("Банк успешно сохранён", "", false);
            this.fetchBanks();
            this.closeModal();
        },
        handleSavedError(m) {
            this.showNotification("Ошибка сохранения", m, true);
        },
        handleDeleted() {
            this.showNotification("Банк удалён", "", false);
            this.fetchBanks();
            this.closeModal();
        },
        handleDeletedError(m) {
            this.showNotification("Ошибка удаления", m, true);
        },
        showNotification(title, subtitle = "", isDanger = false) {
            this.notificationTitle = title;
            this.notificationSubtitle = subtitle;
            this.notificationIsDanger = isDanger;
            this.notification = true;
            setTimeout(() => (this.notification = false), 3000);
        },
    },
};
</script>
