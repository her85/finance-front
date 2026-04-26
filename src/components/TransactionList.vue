<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { supabase, type Transaction, type Category } from '@/api/supabase';
import { FilterMatchMode } from '@primevue/core/api';
import { sanitizeText } from '@/utils/sanitize';

const props = defineProps<{ transactions: Transaction[] }>();
const emit = defineEmits(['refresh']);

const confirm = useConfirm();
const toast = useToast();

// Filtros
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type:   { value: null, matchMode: FilterMatchMode.EQUALS },
});

// Estado edición
const editDialog = ref(false);
const editItem = ref<Partial<Transaction> & { dateObj?: Date; category?: string }>({});
const allCategories = ref<Category[]>([]);
const editCategories = ref<Category[]>([]);

const typeOptions = [
    { label: 'Todos', value: null },
    { label: 'Ingresos', value: 'income' },
    { label: 'Gastos',   value: 'expense' },
];

onMounted(async () => {
    const { data, /*error*/ } = await supabase.from('categories').select('*').order('name', { ascending: true });
    allCategories.value = (data ?? []) as Category[];
});

// Formatters
const formatDate = (d: string) => new Date(d).toLocaleDateString('es-AR');
const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v);

const getCategory = (row: any): Category | null => {
    // Prefer expanded category
    if (row?.expand?.category) return row.expand.category as Category;
    // Supabase may return joined records under `categories` as an array
    if (Array.isArray(row?.categories) && row.categories.length > 0) return row.categories[0] as Category;
    // Fallback to local categories list by id
    const id = row?.category_id ?? row?.category ?? null;
    if (id) return allCategories.value.find(c => c.id === id) ?? null;
    return null;
};

// Eliminar
const confirmDelete = (id: string) => {
    confirm.require({
        message: '¿Seguro que querés eliminar este movimiento?',
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Eliminar',
        acceptClass: 'p-button-danger',
        accept: async () => {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar.', life: 3000 });
                return;
            }
            toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Movimiento eliminado.', life: 3000 });
            emit('refresh');
        },
    });
};

// Editar
const openEdit = (row: Transaction) => {
    const categoryId = (row as any).category ?? (row as any).category_id ?? row.expand?.category?.id ?? '';
    editItem.value = {
        ...row,
        category: categoryId,
        dateObj: row.date ? new Date(row.date) : new Date(),
    };
    editCategories.value = allCategories.value.filter(c => c.type === row.type);
    editErrors.value = { amount: '', category: '', date: '' };
    editDialog.value = true;
};

const onEditTypeChange = () => {
    editItem.value.category = '';
    editCategories.value = allCategories.value.filter(c => c.type === editItem.value.type);
};
const editErrors = ref({ amount: '', category: '', date: '' });

const validateEdit = (): boolean => {
    editErrors.value = { amount: '', category: '', date: '' };
    let valid = true;
    if (!editItem.value.amount || editItem.value.amount <= 0) {
        editErrors.value.amount = 'Ingresá un monto mayor a cero.';
        valid = false;
    } else if (editItem.value.amount > 999_999_999) {
        editErrors.value.amount = 'El monto no puede superar $999.999.999.';
        valid = false;
    }
    if (!editItem.value.category) {
        editErrors.value.category = 'Seleccioná una categoría.';
        valid = false;
    }
    if (!editItem.value.dateObj || isNaN(editItem.value.dateObj.getTime())) {
        editErrors.value.date = 'Seleccioná una fecha válida.';
        valid = false;
    } else if (editItem.value.dateObj > new Date()) {
        editErrors.value.date = 'La fecha no puede ser futura.';
        valid = false;
    }
    return valid;
};

const saveEdit = async () => {
    if (!editItem.value.id || !validateEdit()) return;
    const { error } = await supabase
        .from('transactions')
        .update({
            amount: editItem.value.amount,
            type: editItem.value.type,
            category_id: editItem.value.category,
            date: editItem.value.dateObj?.toISOString(),
            note: sanitizeText(editItem.value.note ?? ''),
        })
        .eq('id', editItem.value.id);

    if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar.', life: 3000 });
        return;
    }

    toast.add({ severity: 'success', summary: 'Guardado', detail: 'Movimiento actualizado.', life: 3000 });
    editDialog.value = false;
    emit('refresh');
};
</script>

<template>
    <div class="flex flex-column gap-3">

        <!-- Barra de filtros -->
        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
            <IconField style="min-width:220px;">
                <InputIcon class="pi pi-search" />
                <InputText
                    v-model="filters.global.value"
                    placeholder="Buscar..."
                    class="w-full"
                />
            </IconField>
            <SelectButton
                v-model="filters.type.value"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
            />
        </div>

        <!-- Tabla -->
        <DataTable
            :value="props.transactions"
            v-model:filters="filters"
            :globalFilterFields="['note', 'expand.category.name', 'type']"
            filterDisplay="menu"
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 25]"
            sortField="date"
            :sortOrder="-1"
            removableSort
            class="p-datatable-sm"
            responsiveLayout="scroll"
            :emptyMessage="'No hay movimientos.'"
        >
            <Column field="date" header="Fecha" sortable style="min-width:110px;">
                <template #body="{ data }">{{ formatDate(data.date) }}</template>
            </Column>

            <Column header="Categoría" style="min-width:150px;">
                <template #body="{ data }">
                    <span v-if="getCategory(data)">
                        {{ getCategory(data)?.icon }} {{ getCategory(data)?.name }}
                    </span>
                    <span v-else class="text-color-secondary">—</span>
                </template>
            </Column>

            <Column field="note" header="Nota" style="min-width:150px;">
                <template #body="{ data }">
                    <span class="text-color-secondary">{{ data.note || '—' }}</span>
                </template>
            </Column>

            <Column field="amount" header="Monto" sortable style="min-width:130px;">
                <template #body="{ data }">
                    <span :class="data.type === 'income' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'">
                        {{ data.type === 'income' ? '+' : '-' }} {{ formatCurrency(data.amount) }}
                    </span>
                </template>
            </Column>

            <Column header="Acciones" style="min-width:100px; text-align:right;">
                <template #body="{ data }">
                    <div class="flex gap-1 justify-content-end">
                        <Button
                            icon="pi pi-pencil"
                            rounded text severity="info"
                            size="small"
                            aria-label="Editar"
                            @click="openEdit(data)"
                        />
                        <Button
                            icon="pi pi-trash"
                            rounded text severity="danger"
                            size="small"
                            aria-label="Eliminar"
                            @click="confirmDelete(data.id)"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>

    <!-- Dialog edición -->
    <Dialog v-model:visible="editDialog" header="Editar movimiento" modal :style="{ width: '480px' }">
        <div class="flex flex-column gap-3 pt-2">

            <div class="flex flex-column gap-1">
                <label class="font-medium text-sm">Tipo</label>
                <SelectButton
                    v-model="editItem.type"
                    :options="[{ label: 'Gasto', value: 'expense' }, { label: 'Ingreso', value: 'income' }]"
                    optionLabel="label"
                    optionValue="value"
                    @change="onEditTypeChange"
                />
            </div>

            <div class="grid p-fluid">
                <div class="col-12 md:col-6 flex flex-column gap-1">
                    <label class="font-medium text-sm">Monto</label>
                    <InputNumber v-model="editItem.amount" mode="currency" currency="ARS" :invalid="!!editErrors.amount" />
                    <small v-if="editErrors.amount" class="text-red-500">{{ editErrors.amount }}</small>
                </div>
                <div class="col-12 md:col-6 flex flex-column gap-1">
                    <label class="font-medium text-sm">Categoría</label>
                    <Select
                        v-model="editItem.category"
                        :options="editCategories"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Seleccionar..."
                        :invalid="!!editErrors.category"
                    >
                        <template #option="{ option }">
                            {{ option.icon }} {{ option.name }}
                        </template>
                    </Select>
                    <small v-if="editErrors.category" class="text-red-500">{{ editErrors.category }}</small>
                </div>
            </div>

            <div class="grid p-fluid">
                <div class="col-12 md:col-5 flex flex-column gap-1">
                    <label class="font-medium text-sm">Fecha</label>
                    <DatePicker v-model="editItem.dateObj" dateFormat="dd/mm/yy" showIcon :invalid="!!editErrors.date" />
                    <small v-if="editErrors.date" class="text-red-500">{{ editErrors.date }}</small>
                </div>
                <div class="col-12 md:col-7 flex flex-column gap-1">
                    <label class="font-medium text-sm">Nota <span class="text-color-secondary font-normal">(máx. 500 car.)</span></label>
                    <InputText v-model="editItem.note" placeholder="Descripción..." :maxlength="500" />
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" text severity="secondary" @click="editDialog = false" />
            <Button label="Guardar" icon="pi pi-check" @click="saveEdit" />
        </template>
    </Dialog>

    <ConfirmDialog />
</template>