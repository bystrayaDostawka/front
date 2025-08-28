<template>
    <div class>


                <!-- Фильтры -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div class="flex flex-wrap items-center gap-4">
                <!-- Фильтр по времени -->
                <div class="flex gap-2">
                    <button
                        v-for="period in datePeriods"
                        :key="period.value"
                        @click="changeDatePeriod(period.value)"
                        :class="[
                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            selectedDatePeriod === period.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        ]"
                    >
                        {{ period.label }}
                    </button>
                </div>

                <!-- Кастомный диапазон -->
                <div v-if="selectedDatePeriod === 'custom'" class="flex items-center gap-2">
                    <input
                        v-model="customDateFrom"
                        @change="applyCustomDateRange"
                        type="date"
                        class="border rounded-lg px-3 py-2 text-sm"
                    />
                    <span class="text-gray-500">—</span>
                    <input
                        v-model="customDateTo"
                        @change="applyCustomDateRange"
                        type="date"
                        class="border rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <!-- Фильтр по курьерам -->
                <div>
                    <select
                        v-model="selectedCourier"
                        @change="applyFilters"
                        class="border rounded-lg px-3 py-2 text-sm min-w-[150px]"
                    >
                        <option value="">Все курьеры</option>
                        <option v-for="courier in couriers" :key="courier.id" :value="courier.id">
                            {{ courier.name }}
                        </option>
                    </select>
                </div>

                <!-- Фильтр по банкам -->
                <div>
                    <select
                        v-model="selectedBank"
                        @change="applyFilters"
                        class="border rounded-lg px-3 py-2 text-sm min-w-[150px]"
                    >
                        <option value="">Все банки</option>
                        <option v-for="bank in banks" :key="bank.id" :value="bank.id">
                            {{ bank.name }}
                        </option>
                    </select>
                </div>

                <!-- Кнопка сброса фильтров -->
                <button
                    @click="resetFilters"
                    class="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600"
                >
                    Сбросить фильтры
                </button>

                <!-- Текущий период -->
                <div class="ml-auto text-sm text-gray-500">
                    {{ currentPeriodText }}
                </div>
            </div>
        </div>

        <!-- Статистические карточки -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2">Всего заказов</span>
                <span class="text-4xl font-bold text-blue-600">{{ stats.total_orders || 0 }}</span>
            </div>
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2">Выполнено</span>
                <span class="text-4xl font-bold text-green-600">{{ stats.completed_orders || 0 }}</span>
            </div>
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2">Курьеров</span>
                <span class="text-4xl font-bold text-purple-600">{{ stats.total_couriers || 0 }}</span>
            </div>
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2">Банков</span>
                <span class="text-4xl font-bold text-indigo-600">{{ stats.total_banks || 0 }}</span>
            </div>
        </div>

        <!-- Статистика за выбранный период -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-semibold mb-4">За выбранный период</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">{{ stats.period_orders || 0 }}</div>
                        <div class="text-sm text-gray-500">Новых заказов</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">{{ stats.period_completed || 0 }}</div>
                        <div class="text-sm text-gray-500">Выполнено</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-600">{{ stats.period_cancelled || 0 }}</div>
                        <div class="text-sm text-gray-500">Отменено</div>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4 mt-4">
                    <div class="text-center">
                        <div class="text-xl font-bold text-yellow-600">{{ stats.postponed_orders || 0 }}</div>
                        <div class="text-sm text-gray-500">Перенос</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-purple-600">{{ stats.pending_verification || 0 }}</div>
                        <div class="text-sm text-gray-500">Ждёт проверку</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-orange-600">{{ stats.in_work_orders || 0 }}</div>
                        <div class="text-sm text-gray-500">В работе</div>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Процент выполнения</h3>
                <div class="text-center">
                    <div class="text-3xl font-bold text-blue-600">
                        {{ completionRate }}%
                    </div>
                    <div class="text-sm text-gray-500">Выполненных заказов</div>
                </div>
            </div>
        </div>

        <!-- Графики -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Круговая диаграмма статусов -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Распределение по статусам</h3>
                <div class="flex justify-center">
                    <div class="relative w-48 h-48">
                        <canvas ref="statusChart" width="200" height="200"></canvas>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-gray-700">{{ totalStatusOrders }}</div>
                                <div class="text-sm text-gray-500">Всего</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span class="text-sm">Выполнено</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                        <span class="text-sm">В работе</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        <span class="text-sm">Ждёт проверку</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span class="text-sm">Перенос</span>
                    </div>
                </div>
            </div>

            <!-- Столбчатая диаграмма -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Статистика за период</h3>
                <div class="h-64">
                    <canvas ref="barChart" width="400" height="250"></canvas>
                </div>
            </div>
        </div>

        <!-- Линейный график тренда -->
        <div class="bg-white rounded-xl shadow p-6 mb-8">
            <h3 class="text-lg font-semibold mb-4">Тренд выполнения заказов</h3>
            <div class="h-64">
                <canvas ref="lineChart" width="800" height="250"></canvas>
            </div>
        </div>

        <!-- Загрузка -->
        <div v-if="loading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Ошибка -->
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error }}
        </div>
    </div>
</template>

<script>
import StatisticsController from '@/api/StatisticsController';
import Chart from 'chart.js/auto';

export default {
    name: 'DashboardPage',
    components: {
    },
    data() {
        return {
            stats: {},

            loading: false,
            error: null,
            couriers: [],
            banks: [],
            selectedCourier: '',
            selectedBank: '',
            selectedDatePeriod: 'today', // 'all', 'today', 'this_week', 'this_month', 'this_year', 'custom'
            datePeriods: [
                { value: 'all', label: 'Все время' },
                { value: 'today', label: 'Сегодня' },
                { value: 'this_week', label: 'Эта неделя' },
                { value: 'this_month', label: 'Этот месяц' },
                { value: 'this_year', label: 'Этот год' },
                { value: 'custom', label: 'Диапазон' },
            ],
            customDateFrom: '',
            customDateTo: '',
            statusChart: null,
            barChart: null,
            lineChart: null,
        };
    },
    computed: {
        totalStatusOrders() {
            return (this.stats.period_completed || 0) +
                   (this.stats.in_work_orders || 0) +
                   (this.stats.pending_verification || 0) +
                   (this.stats.postponed_orders || 0);
        },
        completionRate() {
            if (!this.stats.period_orders || this.stats.period_orders === 0) return 0;
            const activeOrders = this.stats.period_orders - (this.stats.period_cancelled || 0);
            if (activeOrders === 0) return 0;
            return Math.round((this.stats.period_completed / activeOrders) * 100);
        },
        currentPeriodText() {
            const period = this.datePeriods.find(p => p.value === this.selectedDatePeriod);
            return period ? period.label : 'Выберите период';
        }
    },
    mounted() {
        this.fetchDashboardData();
        this.fetchCouriers(); // Загружаем курьеров
        this.fetchBanks(); // Загружаем банки
    },
    methods: {
        async fetchDashboardData() {
            this.loading = true;
            this.error = null;

            try {
                await this.fetchStats();
            } catch (e) {
                this.error = 'Ошибка загрузки данных дашборда';
                console.error('Dashboard error:', e);
            } finally {
                this.loading = false;
            }
        },

        async fetchStats() {
            try {
                const params = {
                    courier_id: this.selectedCourier,
                    bank_id: this.selectedBank,
                    period: this.selectedDatePeriod,
                    from: this.customDateFrom,
                    to: this.customDateTo
                };

                console.log('Fetching stats with params:', params);

                const result = await StatisticsController.getDashboardStats(params);

                console.log('Received stats:', result);

                // Проверяем, что результат валидный
                if (result && typeof result === 'object') {
                    this.stats = result;
                    this.updateCharts();
                } else {
                    this.stats = {};
                }
            } catch (e) {
                console.error('Error fetching stats:', e);
                this.stats = {};
            }
        },









        async changeDatePeriod(period) {
            console.log('Changing date period to:', period);
            this.selectedDatePeriod = period;
            if (period !== 'custom') {
                this.customDateFrom = '';
                this.customDateTo = '';
            }
            // Добавляем небольшую задержку для предотвращения конфликтов
            await new Promise(resolve => setTimeout(resolve, 100));
            await this.fetchDashboardData();
        },

        applyCustomDateRange() {
            if (this.customDateFrom && this.customDateTo) {
                console.log('Applying custom date range:', this.customDateFrom, 'to', this.customDateTo);
                this.fetchDashboardData();
            }
        },

        async fetchCouriers() {
            try {
                this.couriers = await StatisticsController.getCouriers();
            } catch (e) {
                console.error('Error fetching couriers:', e);
                this.couriers = [];
            }
        },

        async fetchBanks() {
            try {
                this.banks = await StatisticsController.getBanks();
            } catch (e) {
                console.error('Error fetching banks:', e);
                this.banks = [];
            }
        },

        applyFilters() {
            this.fetchDashboardData();
        },

        resetFilters() {
            this.selectedCourier = '';
            this.selectedBank = '';
            this.selectedDatePeriod = 'today';
            this.customDateFrom = '';
            this.customDateTo = '';
            this.fetchDashboardData();
        },

        createStatusChart() {
            if (this.statusChart) {
                this.statusChart.destroy();
            }

            const ctx = this.$refs.statusChart;
            if (!ctx) return;

            this.statusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Выполнено', 'В работе', 'Ждёт проверку', 'Перенос'],
                    datasets: [{
                        data: [
                            this.stats.period_completed || 0,
                            this.stats.in_work_orders || 0,
                            this.stats.pending_verification || 0,
                            this.stats.postponed_orders || 0
                        ],
                        backgroundColor: ['#10B981', '#F59E0B', '#8B5CF6', '#EAB308'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    cutout: '60%'
                }
            });
        },

        createBarChart() {
            if (this.barChart) {
                this.barChart.destroy();
            }

            const ctx = this.$refs.barChart;
            if (!ctx) return;

            this.barChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Новых', 'Выполнено', 'Отменено', 'В работе', 'Ждёт проверку', 'Перенос'],
                    datasets: [{
                        label: 'Количество заказов',
                        data: [
                            this.stats.period_orders || 0,
                            this.stats.period_completed || 0,
                            this.stats.period_cancelled || 0,
                            this.stats.in_work_orders || 0,
                            this.stats.pending_verification || 0,
                            this.stats.postponed_orders || 0
                        ],
                        backgroundColor: [
                            '#3B82F6',
                            '#10B981',
                            '#EF4444',
                            '#F59E0B',
                            '#8B5CF6',
                            '#EAB308'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#E5E7EB'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        },

        createLineChart() {
            if (this.lineChart) {
                this.lineChart.destroy();
            }

            const ctx = this.$refs.lineChart;
            if (!ctx) return;

            // Генерируем данные для тренда (за последние 7 дней)
            const labels = [];
            const completedData = [];
            const totalData = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));

                // Имитируем данные тренда (в реальном приложении это будет API)
                const baseCompleted = this.stats.period_completed || 0;
                const baseTotal = this.stats.period_orders || 0;
                completedData.push(Math.floor(baseCompleted * (0.8 + Math.random() * 0.4)));
                totalData.push(Math.floor(baseTotal * (0.8 + Math.random() * 0.4)));
            }

            this.lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Выполнено',
                            data: completedData,
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Всего заказов',
                            data: totalData,
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#E5E7EB'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        },

        updateCharts() {
            this.$nextTick(() => {
                try {
                    this.createStatusChart();
                    this.createBarChart();
                    this.createLineChart();
                } catch (error) {
                    console.error('Error updating charts:', error);
                }
            });
        }
    },
    beforeUnmount() {
        // Очищаем графики при уничтожении компонента
        if (this.statusChart) {
            this.statusChart.destroy();
        }
        if (this.barChart) {
            this.barChart.destroy();
        }
        if (this.lineChart) {
            this.lineChart.destroy();
        }
    }
};
</script>
