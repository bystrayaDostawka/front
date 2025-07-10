<template>
    <div class="flex flex-col h-full overflow-hidden">
        <div class="flex-1 overflow-auto p-4">
            <h2 class="text-lg font-bold mb-4">{{ editingItem ? 'Редактировать заявку' : 'Создать заявку' }}</h2>
            <div class="mb-4 space-y-3">
                <div>
                    <label class="required">Банк</label>
                    <select v-model="bank_id" required>
                        <option value="" disabled>Выберите банк...</option>
                        <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                </div>
                <div>
                    <label class="required">Продукт</label>
                    <input type="text" v-model="product" required />
                </div>
                <div>
                    <label class="required">Имя клиента</label>
                    <input type="text" v-model="client_name" required />
                </div>
                <div>
                    <label class="required">Телефон клиента</label>
                    <input type="text" v-model="client_phone" required />
                </div>
                <div>
                    <label class="required">Адрес клиента</label>
                    <input type="text" v-model="client_address" required />
                </div>
                <div>
                    <label class="required">Дата и время доставки</label>
                    <input type="datetime-local" v-model="delivery_at" required />
                </div>
                <div>
                    <label>Курьер</label>
                    <select v-model="courier_id">
                        <option value="" disabled>Без курьера</option>
                        <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                </div>
                <div>
                    <label>Комментарий</label>
                    <textarea v-model="note"></textarea>
                </div>
            </div>
        </div>
        <div class="mt-4 flex space-x-2 bg-[#edf4fb] p-4 rounded-xl">
            <PrimaryButton v-if="editingItem" :onclick="showDeleteDialog" :is-danger="true" :is-loading="deleteLoading"
                icon="fas fa-remove">Удалить</PrimaryButton>
            <PrimaryButton icon="fas fa-save" :onclick="save" :is-loading="saveLoading">Сохранить</PrimaryButton>
        </div>
        <AlertDialog :dialog="deleteDialog" @confirm="deleteItem" @leave="closeDeleteDialog"
            :descr="'Подтвердите удаление заявки'" :confirm-text="'Удалить'" :leave-text="'Отмена'" />
    </div>
</template>

<script>
import PrimaryButton from '@/components/PrimaryButton.vue'
import AlertDialog from '@/components/AlertDialog.vue'
import api from '@/api/api'

export default {
    components: { PrimaryButton, AlertDialog },
    props: { editingItem: { type: Object, default: null } },
    data() {
        return {
            bank_id: this.editingItem?.bank_id || '',
            product: this.editingItem?.product || '',
            client_name: this.editingItem?.client_name || '',
            client_phone: this.editingItem?.client_phone || '',
            client_address: this.editingItem?.client_address || '',
            delivery_at: this.editingItem?.delivery_at
                ? this.editingItem.delivery_at.slice(0, 16)
                : this._getNowDateTimeLocal(),
            courier_id: this.editingItem?.courier_id || '',
            order_status_id: this.editingItem?.order_status_id || '',
            note: this.editingItem?.note || '',
            banks: [],
            couriers: [],
            statuses: [],
            saveLoading: false,
            deleteDialog: false,
            deleteLoading: false,
            initialState: {}
        }
    },
    emits: ['saved', 'saved-error', 'deleted', 'deleted-error'],
    mounted() {
        this.loadDictionaries()
        this.$nextTick(() => { this.initialState = this._getFormState() })
    },
    watch: {
        editingItem: {
            immediate: true,
            handler(val) {
                if (!val) {
                    this.bank_id = ''
                    this.product = ''
                    this.client_name = ''
                    this.client_phone = ''
                    this.client_address = ''
                    this.delivery_at = this._getNowDateTimeLocal()
                    this.courier_id = ''
                    this.order_status_id = ''
                    this.note = ''
                } else {
                    this.bank_id = val.bank_id || val.bank?.id || ''
                    this.product = val.product || ''
                    this.client_name = val.client_name || ''
                    this.client_phone = val.client_phone || ''
                    this.client_address = val.client_address || ''
                    this.delivery_at = val && val.delivery_at
                        ? val.delivery_at.slice(0, 16)
                        : this._getNowDateTimeLocal();
                    this.courier_id = val.courier_id || val.courier?.id || ''
                    this.order_status_id = val.order_status_id || val.status?.id || ''
                    this.note = val.note || ''
                }
                this.$nextTick(() => { this.initialState = this._getFormState() })
            }
        }
    },
    methods: {
        async loadDictionaries() {
            try {
                const [banksRes, couriersRes, statusesRes] = await Promise.all([
                    api.get('/banks'),
                    api.get('/users?role=courier'),
                    api.get('/order-statuses'),
                ])
                this.banks = banksRes.data
                this.couriers = couriersRes.data
                this.statuses = statusesRes.data
            } catch { }
        },
        async save() {
            this.saveLoading = true;
            try {
                const data = {
                    bank_id: this.bank_id,
                    product: this.product,
                    client_name: this.client_name,
                    client_phone: this.client_phone,
                    client_address: this.client_address,
                    delivery_at: this.delivery_at,
                    courier_id: this.courier_id,
                    note: this.note,
                };
                // Только при редактировании (editingItem) добавляем статус
                if (this.editingItem) {
                    data.order_status_id = this.order_status_id;
                }
                let resp;
                if (this.editingItem) {
                    resp = await api.put(`/orders/${this.editingItem.id}`, data)
                } else {
                    resp = await api.post('/orders', data)
                }
                this.$emit('saved', resp.data)
                this.clearForm()
            } catch (e) {
                this.$emit('saved-error', e?.response?.data?.message || e.message)
            }
            this.saveLoading = false
        },
        async deleteItem() {
            this.closeDeleteDialog()
            if (!this.editingItem) return
            this.deleteLoading = true
            try {
                await api.delete(`/orders/${this.editingItem.id}`)
                this.$emit('deleted')
            } catch (e) {
                this.$emit('deleted-error', e?.response?.data?.message || e.message)
            }
            this.deleteLoading = false
        },
        showDeleteDialog() { this.deleteDialog = true },
        closeDeleteDialog() { this.deleteDialog = false },
        clearForm() {
            this.bank_id = ''
            this.product = ''
            this.client_name = ''
            this.client_phone = ''
            this.client_address = ''
            this.delivery_at = ''
            this.courier_id = ''
            this.order_status_id = ''
            this.note = ''
        },
        _getFormState() {
            return {
                bank_id: this.bank_id,
                product: this.product,
                client_name: this.client_name,
                client_phone: this.client_phone,
                client_address: this.client_address,
                delivery_at: this.delivery_at,
                courier_id: this.courier_id,
                order_status_id: this.order_status_id,
                note: this.note,
            }
        },
        _getNowDateTimeLocal() {
            const now = new Date();
            const offset = now.getTimezoneOffset();
            const local = new Date(now.getTime() - offset * 60 * 1000);
            return local.toISOString().slice(0, 16);
        },
        isDirty() {
            return JSON.stringify(this._getFormState()) !== JSON.stringify(this.initialState)
        }
    }
}
</script>
