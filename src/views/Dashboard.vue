<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { currentUser, type Transaction } from '@/api/supabase';
import { fetchTransactions } from '@/api/offline';
import { showLoading, hideLoading } from '@/stores/loading';
import BalanceCard from '@/components/BalanceCard.vue';
import TransactionForm from '@/components/TransactionForm.vue';
import TransactionList from '@/components/TransactionList.vue';

const transactions = ref<Transaction[]>([]);

// Periodo seleccionado para los totales (0=mes, 1=año, 2=total)
const activeTab = ref('0');

const now = new Date();
const selectedMonth = ref(now.getMonth());   // 0-11
const selectedYear  = ref(now.getFullYear());

const MONTHS = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

// Rango de años disponibles basado en las transacciones
const availableYears = computed(() => {
    const years = new Set(transactions.value.map(t => new Date(t.date).getFullYear()));
    years.add(now.getFullYear());
    return Array.from(years).sort((a, b) => b - a);
});

// Filtros por periodo
const txByMonth = computed(() =>
    transactions.value.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === selectedMonth.value && d.getFullYear() === selectedYear.value;
    })
);
const txByYear = computed(() =>
    transactions.value.filter(t => new Date(t.date).getFullYear() === selectedYear.value)
);

// Totales por periodo
const calcIncome  = (list: Transaction[]) => list.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
const calcExpense = (list: Transaction[]) => list.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

const monthIncome  = computed(() => calcIncome(txByMonth.value));
const monthExpense = computed(() => calcExpense(txByMonth.value));
const monthBalance = computed(() => monthIncome.value - monthExpense.value);

const yearIncome   = computed(() => calcIncome(txByYear.value));
const yearExpense  = computed(() => calcExpense(txByYear.value));
const yearBalance  = computed(() => yearIncome.value - yearExpense.value);

const totalIncome  = computed(() => calcIncome(transactions.value));
const totalExpense = computed(() => calcExpense(transactions.value));
const totalBalance = computed(() => totalIncome.value - totalExpense.value);

// Balance activo según tab
const activeBalance = computed(() => {
    if (activeTab.value === '0') return monthBalance.value;
    if (activeTab.value === '1') return yearBalance.value;
    return totalBalance.value;
});

const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v);

const loadData = async () => {
    showLoading('Cargando aplicación...');
    try {
        const userId = currentUser.value?.id ?? null;
        const data = await fetchTransactions(userId);
        transactions.value = (data ?? []) as Transaction[];
    } catch (e) {
        console.error(e);
        transactions.value = [];
    } finally {
        hideLoading();
    }
};

onMounted(loadData);
</script>

<template>
    <div class="flex flex-column gap-4">

        <!-- Balance principal -->
        <BalanceCard :balance="activeBalance" />

        <!-- Tabs mes / año / total -->
        <Card>
            <template #content>
                <Tabs v-model:value="activeTab">
                    <TabList>
                        <Tab value="0">Mes</Tab>
                        <Tab value="1">Año</Tab>
                        <Tab value="2">Total</Tab>
                    </TabList>

                    <TabPanels>

                        <!-- Por mes -->
                        <TabPanel value="0">
                            <div class="flex flex-wrap align-items-center gap-3 mb-4 pt-2">
                                <Select
                                    v-model="selectedMonth"
                                    :options="MONTHS.map((m, i) => ({ label: m, value: i }))"
                                    optionLabel="label"
                                    optionValue="value"
                                    style="min-width:140px;"
                                />
                                <Select
                                    v-model="selectedYear"
                                    :options="availableYears.map(y => ({ label: String(y), value: y }))"
                                    optionLabel="label"
                                    optionValue="value"
                                    style="min-width:100px;"
                                />
                            </div>
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <Card class="border-left-3 border-green-400 h-full">
                                        <template #content>
                                            <div class="flex align-items-center justify-content-between">
                                                <div>
                                                    <p class="text-color-secondary text-sm font-medium m-0 mb-1 uppercase" style="letter-spacing:.05em">Ingresos</p>
                                                    <p class="text-green-500 text-2xl font-bold m-0">{{ formatCurrency(monthIncome) }}</p>
                                                </div>
                                                <div class="flex align-items-center justify-content-center border-circle bg-green-100" style="width:3rem;height:3rem;">
                                                    <i class="pi pi-arrow-up text-green-500 text-xl"></i>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                                <div class="col-12 md:col-6">
                                    <Card class="border-left-3 border-red-400 h-full">
                                        <template #content>
                                            <div class="flex align-items-center justify-content-between">
                                                <div>
                                                    <p class="text-color-secondary text-sm font-medium m-0 mb-1 uppercase" style="letter-spacing:.05em">Gastos</p>
                                                    <p class="text-red-500 text-2xl font-bold m-0">{{ formatCurrency(monthExpense) }}</p>
                                                </div>
                                                <div class="flex align-items-center justify-content-center border-circle bg-red-100" style="width:3rem;height:3rem;">
                                                    <i class="pi pi-arrow-down text-red-500 text-xl"></i>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                            </div>
                        </TabPanel>

                        <!-- Por año -->
                        <TabPanel value="1">
                            <div class="flex align-items-center gap-3 mb-4 pt-2">
                                <Select
                                    v-model="selectedYear"
                                    :options="availableYears.map(y => ({ label: String(y), value: y }))"
                                    optionLabel="label"
                                    optionValue="value"
                                    style="min-width:100px;"
                                />
                            </div>
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <Card class="border-left-3 border-green-400 h-full">
                                        <template #content>
                                            <div class="flex align-items-center justify-content-between">
                                                <div>
                                                    <p class="text-color-secondary text-sm font-medium m-0 mb-1 uppercase" style="letter-spacing:.05em">Ingresos</p>
                                                    <p class="text-green-500 text-2xl font-bold m-0">{{ formatCurrency(yearIncome) }}</p>
                                                </div>
                                                <div class="flex align-items-center justify-content-center border-circle bg-green-100" style="width:3rem;height:3rem;">
                                                    <i class="pi pi-arrow-up text-green-500 text-xl"></i>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                                <div class="col-12 md:col-6">
                                    <Card class="border-left-3 border-red-400 h-full">
                                        <template #content>
                                            <div class="flex align-items-center justify-content-between">
                                                <div>
                                                    <p class="text-color-secondary text-sm font-medium m-0 mb-1 uppercase" style="letter-spacing:.05em">Gastos</p>
                                                    <p class="text-red-500 text-2xl font-bold m-0">{{ formatCurrency(yearExpense) }}</p>
                                                </div>
                                                <div class="flex align-items-center justify-content-center border-circle bg-red-100" style="width:3rem;height:3rem;">
                                                    <i class="pi pi-arrow-down text-red-500 text-xl"></i>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                            </div>
                        </TabPanel>

                        <!-- Total histórico -->
                        <TabPanel value="2">
                            <div class="grid mt-2">
                                <div class="col-12 md:col-6">
                                    <Card class="border-left-3 border-green-400 h-full">
                                        <template #content>
                                            <div class="flex align-items-center justify-content-between">
                                                <div>
                                                    <p class="text-color-secondary text-sm font-medium m-0 mb-1 uppercase" style="letter-spacing:.05em">Ingresos totales</p>
                                                    <p class="text-green-500 text-2xl font-bold m-0">{{ formatCurrency(totalIncome) }}</p>
                                                </div>
                                                <div class="flex align-items-center justify-content-center border-circle bg-green-100" style="width:3rem;height:3rem;">
                                                    <i class="pi pi-arrow-up text-green-500 text-xl"></i>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                                <div class="col-12 md:col-6">
                                    <Card class="border-left-3 border-red-400 h-full">
                                        <template #content>
                                            <div class="flex align-items-center justify-content-between">
                                                <div>
                                                    <p class="text-color-secondary text-sm font-medium m-0 mb-1 uppercase" style="letter-spacing:.05em">Gastos totales</p>
                                                    <p class="text-red-500 text-2xl font-bold m-0">{{ formatCurrency(totalExpense) }}</p>
                                                </div>
                                                <div class="flex align-items-center justify-content-center border-circle bg-red-100" style="width:3rem;height:3rem;">
                                                    <i class="pi pi-arrow-down text-red-500 text-xl"></i>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                            </div>
                        </TabPanel>

                    </TabPanels>
                </Tabs>
            </template>
        </Card>

        <!-- Formulario nuevo registro -->
        <TransactionForm @saved="loadData" />

        <!-- Lista de movimientos -->
        <Card>
            <template #title>
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-list text-primary"></i>
                    <span>Últimos movimientos</span>
                </div>
            </template>
            <template #content>
                <TransactionList :transactions="transactions" @refresh="loadData" />
            </template>
        </Card>

    </div>
</template>