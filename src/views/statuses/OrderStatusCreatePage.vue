<template>
    <div class="flex flex-col h-full overflow-hidden">
        <div class="flex-1 overflow-auto p-4">
            <h2 class="text-lg font-bold mb-4">
                {{ editingItem ? 'Редактировать статус' : 'Создать статус' }}
            </h2>
            <div class="mb-4 space-y-3">
                <div>
                    <label class="required">Название</label>
                    <input type="text" v-model="title" required />
                </div>
                <div>
                    <label>Цвет</label>
                    <input type="color" v-model="color" style="width:40px; height:32px; vertical-align:middle" />
                    <input type="text" v-model="color" placeholder="#HEX" style="width:90px; margin-left: 12px" />
                </div>
            </div>
        </div>
        <div class="mt-4 flex space-x-2 bg-[#edf4fb] p-4 rounded-xl">
            <PrimaryButton v-if="editingItem" :onclick="showDeleteDialog" :is-danger="true" :is-loading="deleteLoading"
                icon="fas fa-remove">Удалить</PrimaryButton>
            <PrimaryButton icon="fas fa-save" :onclick="save" :is-loading="saveLoading">Сохранить</PrimaryButton>
        </div>
        <AlertDialog :dialog="deleteDialog" @confirm="deleteItem" @leave="closeDeleteDialog"
            :descr="'Подтвердите удаление статуса'" :confirm-text="'Удалить'" :leave-text="'Отмена'" />
    </div>
</template>

<script>
import PrimaryButton from '@/components/PrimaryButton.vue'
import AlertDialog from '@/components/AlertDialog.vue'
import api from '@/api/api'

export default {
    components: { PrimaryButton, AlertDialog },
    props: {
        editingItem: { type: Object, default: null }
    },
    data() {
        return {
            initialState: {},
            title: this.editingItem?.title || '',
            color: this.editingItem?.color || '#409eff',
            saveLoading: false,
            deleteDialog: false,
            deleteLoading: false,
        }
    },
    emits: ['saved', 'saved-error', 'deleted', 'deleted-error'],
    watch: {
        editingItem: {
            immediate: true,
            handler(val) {
                if (!val) {
                    this.title = ''
                    this.color = '#409eff'
                } else {
                    this.title = val.title || ''
                    this.color = val.color || '#409eff'
                }
                // После актуализации полей сохраняем состояние
                this.$nextTick(() => {
                    this.initialState = this._getFormState()
                });
            }
        }
    },
    methods: {
        async save() {
            this.saveLoading = true
            try {
                const status = {
                    title: this.title,
                    color: this.color
                }
                let resp
                if (this.editingItem) {
                    resp = await api.put(`/order-statuses/${this.editingItem.id}`, status)
                } else {
                    resp = await api.post('/order-statuses', status)
                }
                this.$emit('saved', resp.data)
                this.clearForm()
            } catch (e) {
                this.$emit('saved-error', this.getApiErrorMessage(e))
            }
            this.saveLoading = false
        },
        async deleteItem() {
            this.closeDeleteDialog()
            if (!this.editingItem) return
            this.deleteLoading = true
            try {
                await api.delete(`/order-statuses/${this.editingItem.id}`)
                this.$emit('deleted')
            } catch (e) {
                this.$emit('deleted-error', this.getApiErrorMessage(e))
            }
            this.deleteLoading = false
        },
        showDeleteDialog() {
            this.deleteDialog = true
        },
        closeDeleteDialog() {
            this.deleteDialog = false
        },
        clearForm() {
            this.title = ''
            this.color = '#409eff'
        },
        getApiErrorMessage(e) {
            let message = 'Ошибка'
            if (e.response && e.response.data) {
                if (e.response.data.message) {
                    message = e.response.data.message
                }
                if (e.response.data.errors) {
                    message += ': ' + Object.values(e.response.data.errors).flat().join('; ')
                }
            } else if (e.message) {
                message = e.message
            }
            return message
        },
        _getFormState() {
            return {
                title: this.title,
                color: this.color
            }
        },
        isDirty() {
            return JSON.stringify(this._getFormState()) !== JSON.stringify(this.initialState)
        },
    },

}
</script>
