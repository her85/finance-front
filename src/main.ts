import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import { registerSW } from 'virtual:pwa-register';

// Importar PrimeVue y estilos
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@/assets/styles/main.css';

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
import Tag from 'primevue/tag';
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
        preset: Aura,
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
app.component('Tag', Tag);
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
        console.log('Service worker registered:', reg);
    },
    onRegisterError(err) {
        console.warn('Service worker registration failed:', err);
    }
});