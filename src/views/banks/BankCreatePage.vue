<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="flex-1 overflow-auto p-4">
      <h2 class="text-lg font-bold mb-4">
        {{ editingItem ? "Редактировать банк" : "Создать банк" }}
      </h2>
      <div class="mb-4 space-y-3">
        <div>
          <label class="required">Название</label>
          <input type="text" v-model="name" required />
        </div>
        <div>
          <label>Телефон</label>
          <input type="text" v-model="phone" />
        </div>
        <div>
          <label>Email</label>
          <input type="email" v-model="email" />
        </div>
      </div>
    </div>
    <div class="mt-4 flex space-x-2 bg-[#edf4fb] p-4 rounded-xl">
      <PrimaryButton
        v-if="editingItem"
        :onclick="showDeleteDialog"
        :is-danger="true"
        :is-loading="deleteLoading"
        icon="fas fa-remove"
        >Удалить</PrimaryButton
      >
      <PrimaryButton icon="fas fa-save" :onclick="save" :is-loading="saveLoading"
        >Сохранить</PrimaryButton
      >
    </div>
    <AlertDialog
      :dialog="deleteDialog"
      @confirm="deleteItem"
      @leave="closeDeleteDialog"
      :descr="'Подтвердите удаление банка'"
      :confirm-text="'Удалить'"
      :leave-text="'Отмена'"
    />
  </div>
</template>

<script>
import PrimaryButton from "@/components/PrimaryButton.vue";
import AlertDialog from "@/components/AlertDialog.vue";
import api from "@/api/api";

export default {
  components: { PrimaryButton, AlertDialog },
  props: {
    editingItem: { type: Object, default: null },
  },
  data() {
    return {
      initialState: {},
      name: this.editingItem?.name || "",
      phone: this.editingItem?.phone || "",
      email: this.editingItem?.email || "",
      saveLoading: false,
      deleteDialog: false,
      deleteLoading: false,
    };
  },
  emits: ["saved", "saved-error", "deleted", "deleted-error"],
  watch: {
    editingItem: {
      immediate: true,
      handler(val) {
        if (!val) {
          this.name = "";
          this.phone = "";
          this.email = "";
        } else {
          this.name = val.name || "";
          this.phone = val.phone || "";
          this.email = val.email || "";
        }
        this.$nextTick(() => {
          this.initialState = this._getFormState();
        });
      },
    },
  },
  methods: {
    async save() {
      this.saveLoading = true;
      try {
        const bank = {
          name: this.name,
          phone: this.phone,
          email: this.email,
        };
        let resp;
        if (this.editingItem) {
          resp = await api.put(`/banks/${this.editingItem.id}`, bank);
        } else {
          resp = await api.post("/banks", bank);
        }
        this.$emit("saved", resp.data);
        this.clearForm();
      } catch (e) {
        this.$emit("saved-error", this.getApiErrorMessage(e));
      }
      this.saveLoading = false;
    },
    async deleteItem() {
      this.closeDeleteDialog();
      if (!this.editingItem) return;
      this.deleteLoading = true;
      try {
        await api.delete(`/banks/${this.editingItem.id}`);
        this.$emit("deleted");
      } catch (e) {
        this.$emit("deleted-error", this.getApiErrorMessage(e));
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
      this.name = "";
      this.phone = "";
      this.email = "";
    },
    getApiErrorMessage(e) {
      let message = "Ошибка";
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          message = e.response.data.message;
        }
        if (e.response.data.errors) {
          message += ": " + Object.values(e.response.data.errors).flat().join("; ");
        }
      } else if (e.message) {
        message = e.message;
      }
      return message;
    },
    _getFormState() {
      return {
        name: this.name,
        phone: this.phone,
        email: this.email,
      };
    },
    isDirty() {
      return JSON.stringify(this._getFormState()) !== JSON.stringify(this.initialState);
    },
  },
};
</script>
