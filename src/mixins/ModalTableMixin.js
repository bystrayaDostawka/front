export default {
  data() {
    return {
      loading: false,
      modalDialog: false,
      modalCloseDialog: false,
      editingItem: null,
      notification: false,
      notificationTitle: "",
      notificationSubtitle: "",
      notificationIsDanger: false,
    };
  },
  methods: {
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
      this.showNotification("Успешно сохранено");
      this.fetchItems?.(); 
      this.closeModal();
    },
    handleSavedError(message) {
      this.showNotification("Ошибка сохранения", message, true);
    },
    handleDeleted() {
      this.showNotification("Удалено");
      this.fetchItems?.();
      this.closeModal();
    },
    handleDeletedError(message) {
      this.showNotification("Ошибка удаления", message, true);
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
