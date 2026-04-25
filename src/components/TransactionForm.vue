<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase, currentUser, type Category } from '@/api/supabase';
import { useToast } from 'primevue/usetoast';

const emit = defineEmits(['saved']);
const toast = useToast();

const amount = ref(0);
const type = ref<'income' | 'expense'>('expense');
const categoryId = ref('');
const note = ref('');
const date = ref<Date>(new Date());
const allCategories = ref<Category[]>([]);
const errors = ref({ amount: '', category: '', date: '' });

const types = [
    { label: 'Gasto', value: 'expense' },
    { label: 'Ingreso', value: 'income' }
];

const filteredCategories = computed(() =>
    allCategories.value.filter(c => c.type === type.value)
);

const sanitizeText = (val: string) => val.trim().replace(/<[^>]*>/g, '').slice(0, 500);

const validate = (): boolean => {
    errors.value = { amount: '', category: '', date: '' };
    let valid = true;
    if (!amount.value || amount.value <= 0) {
        errors.value.amount = 'Ingresá un monto mayor a cero.';
        valid = false;
    } else if (amount.value > 999_999_999) {
        errors.value.amount = 'El monto no puede superar $999.999.999.';
        valid = false;
    }
    if (!categoryId.value) {
        errors.value.category = 'Seleccioná una categoría.';
        valid = false;
    }
    if (!date.value || isNaN(date.value.getTime())) {
        errors.value.date = 'Seleccioná una fecha válida.';
        valid = false;
    } else if (date.value > new Date()) {
        errors.value.date = 'La fecha no puede ser futura.';
        valid = false;
    }
    return valid;
};

onMounted(async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error) {
        allCategories.value = [];
        return;
    }
    allCategories.value = (data ?? []) as Category[];
});

const save = async () => {
    if (!validate()) return;

    const userId = currentUser.value?.id ?? null;
    const { /*data,*/ error } = await supabase.from('transactions').insert([
        {
            amount: amount.value,
            type: type.value,
            category_id: categoryId.value,
            user_id: userId,
            date: date.value.toISOString(),
            note: sanitizeText(note.value),
        },
    ]);

    if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el movimiento.', life: 3000 });
        return;
    }

    toast.add({ severity: 'success', summary: 'Guardado', detail: 'Movimiento registrado correctamente.', life: 3000 });

    amount.value = 0;
    note.value = '';
    categoryId.value = '';
    date.value = new Date();
    errors.value = { amount: '', category: '', date: '' };
    emit('saved');
};
</script>

<template>
    <Card>
        <template #title>
            <div class="flex align-items-center gap-2">
                <i class="pi pi-plus-circle text-primary"></i>
                <span>Nuevo registro</span>
            </div>
        </template>
        <template #content>
            <div class="flex flex-column gap-3">

                <!-- Tipo -->
                <div class="flex flex-column gap-1">
                    <label class="font-medium text-sm">Tipo</label>
                    <SelectButton
                        v-model="type"
                        :options="types"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                    />
                </div>

                <!-- Monto y Categoría -->
                <div class="grid p-fluid">
                    <div class="col-12 md:col-6 flex flex-column gap-1">
                        <label class="font-medium text-sm">Monto</label>
                        <InputNumber v-model="amount" mode="currency" currency="ARS" placeholder="0,00" :invalid="!!errors.amount" />
                        <small v-if="errors.amount" class="text-red-500">{{ errors.amount }}</small>
                    </div>
                    <div class="col-12 md:col-6 flex flex-column gap-1">
                        <label class="font-medium text-sm">Categoría</label>
                        <Select
                            v-model="categoryId"
                            :options="filteredCategories"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Seleccionar..."
                            :invalid="!!errors.category"
                        >
                            <template #option="slotProps">
                                <span>{{ slotProps.option.icon }} {{ slotProps.option.name }}</span>
                            </template>
                            <template #value="slotProps">
                                <span v-if="slotProps.value">
                                    {{ filteredCategories.find(c => c.id === slotProps.value)?.icon }}
                                    {{ filteredCategories.find(c => c.id === slotProps.value)?.name }}
                                </span>
                                <span v-else class="text-color-secondary">Seleccionar...</span>
                            </template>
                        </Select>
                        <small v-if="errors.category" class="text-red-500">{{ errors.category }}</small>
                    </div>
                </div>

                <!-- Fecha y Nota -->
                <div class="grid p-fluid">
                    <div class="col-12 md:col-4 flex flex-column gap-1">
                        <label class="font-medium text-sm">Fecha</label>
                        <DatePicker v-model="date" dateFormat="dd/mm/yy" showIcon :invalid="!!errors.date" />
                        <small v-if="errors.date" class="text-red-500">{{ errors.date }}</small>
                    </div>
                    <div class="col-12 md:col-8 flex flex-column gap-1">
                        <label class="font-medium text-sm">Nota <span class="text-color-secondary font-normal">(opcional, máx. 500 car.)</span></label>
                        <InputText v-model="note" placeholder="Descripción del movimiento..." :maxlength="500" />
                    </div>
                </div>

                <!-- Botón -->
                <Button
                    label="Guardar movimiento"
                    icon="pi pi-check"
                    class="w-full md:w-auto align-self-end"
                    @click="save"
                />
            </div>
        </template>
    </Card>
</template>