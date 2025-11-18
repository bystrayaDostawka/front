export default {
  props: {
    editingItem: { type: Object, default: null },
  },
  data() {
    return {
      saveLoading: false,
      deleteLoading: false,
      deleteDialog: false,
      initialState: {},
    };
  },
  emits: ["saved", "saved-error", "deleted", "deleted-error"],
  watch: {
    editingItem: {
      immediate: true,
      async handler() {
        if (this.setFormFromItem) {
          await this.setFormFromItem(this.editingItem);
        }
        this.$nextTick(() => {
          this.initialState = this._getFormState?.() || {};
        });
      },
    },
  },
  methods: {
    async deleteItem() {
      this.closeDeleteDialog();
      if (!this.editingItem?.id) return;
      this.deleteLoading = true;
      try {
        await this._deleteItemApi(this.editingItem.id);
        this.$emit("deleted");
      } catch (e) {
        this.$emit("deleted-error", this.getApiErrorMessage(e));
      } finally {
        this.deleteLoading = false;
      }
    },

    showDeleteDialog() {
      this.deleteDialog = true;
    },
    closeDeleteDialog() {
      this.deleteDialog = false;
    },

    getApiErrorMessage(e) {
      let message = "Ошибка";
      if (e.response?.data) {
        if (e.response.data.message) message = e.response.data.message;
        if (e.response.data.errors)
          message += ": " + Object.values(e.response.data.errors).flat().join("; ");
      } else if (e.message) {
        message = e.message;
      }
      return message;
    },

    isDirty() {
      return JSON.stringify(this._getFormState?.()) !== JSON.stringify(this.initialState);
    },
  },
};
