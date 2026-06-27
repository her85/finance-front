import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import { registerSW } from 'virtual:pwa-register';
import { initOfflineSync } from '@/api/offline';

// Importar PrimeVue y estilos
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@/assets/styles/main.css';

// Preset personalizado: toast adaptado al color primario del proyecto
const FinancePreset = definePreset(Aura, {
    components: {
        toast: {
            colorScheme: {
                light: {
                    info: {
                        background: 'color-mix(in srgb, {blue.50}, transparent 5%)',
                        borderColor: '{blue.200}',
                        color: '{blue.700}',
                        detailColor: '{surface.700}',
                        shadow: '0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 92%)',
                        closeButton: {
                            hoverBackground: '{blue.100}',
                            focusRing: { color: '{blue.700}', shadow: 'none' },
                        },
                    },
                    success: {
                        background: 'color-mix(in srgb, {green.50}, transparent 5%)',
                        borderColor: '{green.200}',
                        color: '{green.700}',
                        detailColor: '{surface.700}',
                        shadow: '0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 92%)',
                        closeButton: {
                            hoverBackground: '{green.100}',
                            focusRing: { color: '{green.700}', shadow: 'none' },
                        },
                    },
                    error: {
                        background: 'color-mix(in srgb, {red.50}, transparent 5%)',
                        borderColor: '{red.200}',
                        color: '{red.700}',
                        detailColor: '{surface.700}',
                        shadow: '0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 92%)',
                        closeButton: {
                            hoverBackground: '{red.100}',
                            focusRing: { color: '{red.700}', shadow: 'none' },
                        },
                    },
                },
                dark: {
                    info: {
                        background: 'color-mix(in srgb, {blue.500}, transparent 5%)',
                        borderColor: '{blue.400}',
                        color: '{blue.100}',
                        detailColor: '{surface.0}',
                        shadow: '0px 4px 8px 0px color-mix(in srgb, {blue.900}, transparent 80%)',
                        closeButton: {
                            hoverBackground: 'rgba(255,255,255,0.1)',
                            focusRing: { color: '{blue.200}', shadow: 'none' },
                        },
                    },
                    success: {
                        background: 'color-mix(in srgb, {green.500}, transparent 5%)',
                        borderColor: '{green.400}',
                        color: '{green.100}',
                        detailColor: '{surface.0}',
                        shadow: '0px 4px 8px 0px color-mix(in srgb, {green.900}, transparent 80%)',
                        closeButton: {
                            hoverBackground: 'rgba(255,255,255,0.1)',
                            focusRing: { color: '{green.200}', shadow: 'none' },
                        },
                    },
                    error: {
                        background: 'color-mix(in srgb, {red.500}, transparent 5%)',
                        borderColor: '{red.400}',
                        color: '{red.100}',
                        detailColor: '{surface.0}',
                        shadow: '0px 4px 8px 0px color-mix(in srgb, {red.900}, transparent 80%)',
                        closeButton: {
                            hoverBackground: 'rgba(255,255,255,0.1)',
                            focusRing: { color: '{red.200}', shadow: 'none' },
                        },
                    },
                },
            },
        },
    },
});

// Componentes PrimeVue
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Card from 'primevue/card';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import DatePicker from 'primevue/datepicker';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Drawer from 'primevue/drawer';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Toolbar from 'primevue/toolbar';
import Ripple from 'primevue/ripple';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: FinancePreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    },
    ripple: true
});
app.use(ConfirmationService);
app.use(ToastService);
app.use(router);

app.component('Button', Button);
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Card', Card);
app.component('InputNumber', InputNumber);
app.component('Select', Select);
app.component('SelectButton', SelectButton);
app.component('DatePicker', DatePicker);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Drawer', Drawer);
app.component('Avatar', Avatar);
app.component('Divider', Divider);
app.component('Dialog', Dialog);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Toast', Toast);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('Tabs', Tabs);
app.component('TabList', TabList);
app.component('Tab', Tab);
app.component('TabPanels', TabPanels);
app.component('TabPanel', TabPanel);
app.component('Toolbar', Toolbar);
app.directive('ripple', Ripple);

app.mount('#app');

registerSW({
    immediate: true,
    onRegistered(reg) {
        console.info('Service worker registered:', reg);
    },
    onRegisterError(err) {
        console.warn('Service worker registration failed:', err);
    }
});

// Inicializar lógica offline / cola de sincronización
initOfflineSync();