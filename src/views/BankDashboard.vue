<template>
    <div>
        <!-- Заголовок с названием банка -->
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-8">
            <h1 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                Дашборд банка: {{ stats.bank_name || 'Загрузка...' }}
            </h1>
            <p class="text-gray-600">Статистика по заявкам вашего банка</p>
        </div>

        <!-- Фильтры -->
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-8">
            <div class="flex flex-col md:flex-row md:flex-wrap md:items-center gap-4">
                <!-- Фильтр по времени -->
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="period in datePeriods"
                        :key="period.value"
                        @click="changeDatePeriod(period.value)"
                        :class="[
                            'px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors',
                            selectedDatePeriod === period.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        ]"
                    >
                        {{ period.label }}
                    </button>
                </div>

                <!-- Кастомный диапазон -->
                <div v-if="selectedDatePeriod === 'custom'" class="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                        v-model="customDateFrom"
                        @change="applyCustomDateRange"
                        type="date"
                        class="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
                    />
                    <span class="text-gray-500 hidden sm:block">—</span>
                    <input
                        v-model="customDateTo"
                        @change="applyCustomDateRange"
                        type="date"
                        class="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
                    />
                </div>

                <!-- Кнопка сброса фильтров -->
                <button
                    @click="resetFilters"
                    class="px-3 md:px-4 py-2 bg-gray-500 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-gray-600 w-full sm:w-auto"
                >
                    Сбросить фильтры
                </button>

                <!-- Текущий период -->
                <div class="md:ml-auto text-xs md:text-sm text-gray-500 text-center md:text-right">
                    {{ currentPeriodText }}
                </div>
            </div>
        </div>

        <!-- Статистические карточки -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div class="bg-white rounded-xl shadow p-4 md:p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2 text-xs md:text-sm text-center">Всего заявок</span>
                <span class="text-2xl md:text-4xl font-bold text-blue-600">{{ stats.total_orders || 0 }}</span>
            </div>
            <div class="bg-white rounded-xl shadow p-4 md:p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2 text-xs md:text-sm text-center">Выполнено</span>
                <span class="text-2xl md:text-4xl font-bold text-green-600">{{ stats.completed_orders || 0 }}</span>
            </div>
            <div class="bg-white rounded-xl shadow p-4 md:p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2 text-xs md:text-sm text-center">В работе</span>
                <span class="text-2xl md:text-4xl font-bold text-orange-600">{{ stats.pending_orders || 0 }}</span>
            </div>
            <div class="bg-white rounded-xl shadow p-4 md:p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2 text-xs md:text-sm text-center">Отменено</span>
                <span class="text-2xl md:text-4xl font-bold text-red-600">{{ stats.cancelled_orders || 0 }}</span>
            </div>
        </div>

        <!-- Статистика за выбранный период -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            <div class="bg-white rounded-xl shadow p-4 md:p-6">
                <h3 class="text-base md:text-lg font-semibold mb-4">За выбранный период</h3>
                <div class="grid grid-cols-2 gap-2 md:gap-4">
                    <div class="text-center">
                        <div class="text-lg md:text-2xl font-bold text-blue-600">{{ stats.period_orders || 0 }}</div>
                        <div class="text-xs md:text-sm text-gray-500">Новых заявок</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg md:text-2xl font-bold text-green-600">{{ stats.period_completed || 0 }}</div>
                        <div class="text-xs md:text-sm text-gray-500">Выполнено</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg md:text-2xl font-bold text-red-600">{{ stats.period_cancelled || 0 }}</div>
                        <div class="text-xs md:text-sm text-gray-500">Отменено</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg md:text-2xl font-bold text-yellow-600">{{ stats.postponed_orders || 0 }}</div>
                        <div class="text-xs md:text-sm text-gray-500">Перенос</div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 md:gap-4 mt-4">
                    <div class="text-center">
                        <div class="text-sm md:text-xl font-bold text-purple-600">{{ stats.pending_verification || 0 }}</div>
                        <div class="text-xs md:text-sm text-gray-500">Ждёт проверку</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm md:text-xl font-bold text-orange-600">{{ stats.in_work_orders || 0 }}</div>
                        <div class="text-xs md:text-sm text-gray-500">В работе</div>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow p-4 md:p-6">
                <h3 class="text-base md:text-lg font-semibold mb-4">Процент выполнения</h3>
                <div class="text-center">
                    <div class="text-2xl md:text-3xl font-bold text-blue-600">
                        {{ completionRate }}%
                    </div>
                    <div class="text-xs md:text-sm text-gray-500">Выполненных заявок</div>
                </div>
            </div>
        </div>

        <!-- Графики -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
            <!-- Круговая диаграмма статусов -->
            <div class="bg-white rounded-xl shadow p-4 md:p-6">
                <h3 class="text-base md:text-lg font-semibold mb-4">Распределение по статусам</h3>
                <div class="flex justify-center">
                    <div class="relative w-32 h-32 md:w-48 md:h-48">
                        <canvas ref="statusChart" v-show="!loading"></canvas>
                        <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center">
                                <div class="text-lg md:text-2xl font-bold text-gray-700">{{ totalStatusOrders }}</div>
                                <div class="text-xs md:text-sm text-gray-500">Всего</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 md:gap-4 mt-4">
                    <div class="flex items-center">
                        <div class="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full mr-1 md:mr-2"></div>
                        <span class="text-xs md:text-sm">Выполнено</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full mr-1 md:mr-2"></div>
                        <span class="text-xs md:text-sm">В работе</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full mr-1 md:mr-2"></div>
                        <span class="text-xs md:text-sm">Ждёт проверку</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-2 h-2 md:w-3 md:h-3 bg-yellow-500 rounded-full mr-1 md:mr-2"></div>
                        <span class="text-xs md:text-sm">Перенос</span>
                    </div>
                </div>
            </div>

            <!-- Статистика по курьерам -->
            <div class="bg-white rounded-xl shadow p-4 md:p-6">
                <h3 class="text-base md:text-lg font-semibold mb-4">Статистика по курьерам</h3>
                <div v-if="stats.couriers_stats && stats.couriers_stats.length > 0" class="space-y-3">
                    <div v-for="courier in stats.couriers_stats" :key="courier.id" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                            <div class="font-medium text-gray-800">{{ courier.name }}</div>
                            <div class="text-sm text-gray-500">Всего заявок: {{ courier.total_orders }}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-green-600">{{ courier.completed_orders }}</div>
                            <div class="text-xs text-gray-500">Выполнено</div>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center text-gray-500 py-8">
                    <i class="fas fa-user-tie text-4xl mb-2"></i>
                    <p>Нет данных по курьерам</p>
                </div>
            </div>
        </div>

        <!-- Линейный график тренда -->
        <div class="bg-white rounded-xl shadow p-4 md:p-6 mb-8">
            <h3 class="text-base md:text-lg font-semibold mb-4">Тренд выполнения заявок</h3>
            <div class="h-48 md:h-64 relative">
                <canvas ref="lineChart" v-show="!loading"></canvas>
                <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        </div>

        <!-- Загрузка -->
        <div v-if="loading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    </div>
</template>

<script>
import StatisticsController from '@/api/StatisticsController';
import Chart from 'chart.js/auto';

export default {
    name: 'BankDashboardPage',
    data() {
        return {
            stats: {},
            loading: false,
            error: null,
            selectedDatePeriod: 'today',
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
            lineChart: null,
            resizeTimeout: null,
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
        window.addEventListener('resize', this.handleResize);
    },
    methods: {
        async fetchDashboardData() {
            this.loading = true;
            this.error = null;

            try {
                await this.fetchStats();
            } catch (e) {
                this.error = 'Ошибка загрузки данных дашборда';
                console.error('Bank dashboard error:', e);
            } finally {
                this.loading = false;
            }
        },

        async fetchStats() {
            try {
                const params = {
                    period: this.selectedDatePeriod,
                    from: this.customDateFrom,
                    to: this.customDateTo
                };

                const result = await StatisticsController.getBankDashboardStats(params);

                if (result && typeof result === 'object') {
                    this.stats = result;
                    
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.updateCharts();
                        }, 500);
                    });
                } else {
                    console.warn('Invalid bank stats result:', result);
                    this.stats = {
                        total_orders: 0,
                        completed_orders: 0,
                        pending_orders: 0,
                        cancelled_orders: 0,
                        period_orders: 0,
                        period_completed: 0,
                        period_cancelled: 0,
                        postponed_orders: 0,
                        pending_verification: 0,
                        in_work_orders: 0,
                        couriers_stats: [],
                        bank_name: 'Неизвестный банк'
                    };
                }
            } catch (e) {
                console.error('Error fetching bank stats:', e);
                this.stats = {};
            }
        },

        async changeDatePeriod(period) {
            this.selectedDatePeriod = period;
            if (period !== 'custom') {
                this.customDateFrom = '';
                this.customDateTo = '';
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            await this.fetchDashboardData();
        },

        applyCustomDateRange() {
            if (this.customDateFrom && this.customDateTo) {
                this.fetchDashboardData();
            }
        },

        resetFilters() {
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

        createLineChart() {
            if (this.lineChart) {
                this.lineChart.destroy();
            }

            const ctx = this.$refs.lineChart;
            if (!ctx) {
                console.warn('Line chart canvas not found');
                return;
            }

            // Генерируем данные для тренда (за последние 7 дней)
            const labels = [];
            const completedData = [];
            const totalData = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));

                // Имитируем данные тренда
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
                            label: 'Всего заявок',
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
                            },
                            ticks: {
                                stepSize: 1
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    animation: {
                        duration: 1000
                    }
                }
            });
        },

        updateCharts() {
            this.$nextTick(() => {
                try {
                    setTimeout(() => {
                        this.createStatusChart();
                        this.createLineChart();
                    }, 200);
                } catch (error) {
                    console.error('Error updating charts:', error);
                }
            });
        },

        handleResize() {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateCharts();
            }, 250);
        },
    },
    beforeUnmount() {
        if (this.statusChart) {
            this.statusChart.destroy();
        }
        if (this.lineChart) {
            this.lineChart.destroy();
        }
        
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        window.removeEventListener('resize', this.handleResize);
    }
};
</script>

