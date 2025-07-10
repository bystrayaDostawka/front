<template>
    <div>
        <div class="flex justify-between items-center mb-4">
            <PrimaryButton :onclick="() => {
                showModal(null);
            }
                " icon="fas fa-plus">
                Добавить заявку
            </PrimaryButton>
        </div>

        <transition name="fade" mode="out-in">
            <div v-if="!loading" key="table">
                <ResizableTable tableKey="orders" :columnsConfig="columnsConfig" :tableData="orders"
                    :itemMapper="itemMapper" :onRowClick="showModal" itemKey="id" />
            </div>
            <div v-else key="loader" class="flex justify-center items-center h-64">
                <i class="fas fa-spinner fa-spin text-2xl"></i>
            </div>
        </transition>

        <AppModal :show="modalDialog" :onclose="closeModal">
            <OrderCreatePage ref="formComponent" @saved="handleSaved" @saved-error="handleSavedError"
                @deleted="handleDeleted" @deleted-error="handleDeletedError" :editingItem="editingItem" />
        </AppModal>
        <AlertDialog :dialog="modalCloseDialog" @confirm="confirmModalClose" @leave="modalCloseDialog = false"
            descr="Вы действительно хотите закрыть? Несохранённые изменения будут потеряны." />
        <NotificationToast :title="notificationTitle" :subtitle="notificationSubtitle" :show="notification"
            :is-danger="notificationIsDanger" />
    </div>
</template>

<script>
import StatusDropdown from "@/components/StatusDropdown.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import ResizableTable from "@/components/ResizableTable.vue";
import AppModal from "@/components/AppModal.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import OrderCreatePage from "./OrderCreatePage.vue";
import AlertDialog from "@/components/AlertDialog.vue";
import api from "@/api/api";
import { markRaw } from "vue";
export default {
    components: {
        PrimaryButton,
        ResizableTable,
        AppModal,
        NotificationToast,
        OrderCreatePage,
        AlertDialog,
        StatusDropdown,
    },
    data() {
        return {
            orders: [],
            statuses: [],
            loading: false,
            notification: false,
            notificationTitle: "",
            notificationSubtitle: "",
            notificationIsDanger: false,
            modalDialog: false,
            editingItem: null,
            modalCloseDialog: false,
            columnsConfig: [
                { name: "id", label: "ID" },
                { name: "bank", label: "Банк", html: true },
                { name: "product", label: "Продукт" },
                { name: "client_name", label: "Клиент" },
                { name: "client_phone", label: "Телефон" },
                { name: "delivery_at", label: "Дата доставки" },
                {
                    name: "status",
                    label: "Статус",
                    component: markRaw(StatusDropdown),
                    props: (item) => ({
                        value: item.status?.id ?? item.status_id ?? "",
                        orderId: item.id,
                        statuses: this.statuses, // теперь this правильный!
                        onChanged: async (newId) => await this.fetchOrders(),
                    }),
                },
            ],
        };
    },
    created() {
        this.fetchStatuses();
        this.fetchOrders();
    },
    methods: {
        itemMapper(order, col) {
            switch (col) {
                case "bank":
                    return order.bank ? order.bank.name : "-";
                case "delivery_at":
                    return order.delivery_at
                        ? new Date(order.delivery_at).toLocaleString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : "-";
                default:
                    return order[col] || "";
            }
        },

        async fetchOrders() {
            this.loading = true;
            try {
                const res = await api.get("/orders");
                this.orders = res.data;
            } catch (e) {
                this.showNotification("Ошибка загрузки", e.message || "", true);
            } finally {
                this.loading = false;
            }
        },
        async fetchStatuses() {
            try {
                const res = await api.get("/order-statuses");
                this.statuses = res.data;
            } catch (e) {
                this.statuses = [];
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
            this.modalDialog = false;
            this.editingItem = null;
        },
        handleSaved() {
            this.showNotification("Заявка успешно сохранена", "", false);
            this.fetchOrders();
            this.closeModal();
        },
        handleSavedError(m) {
            this.showNotification("Ошибка сохранения", m, true);
        },
        handleDeleted() {
            this.showNotification("Заявка удалена", "", false);
            this.fetchOrders();
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
