import { createPinia } from 'pinia';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import 'primevue/resources/primevue.css';
import 'primevue/resources/themes/aura-light-green/theme.css';
import 'primevue/resources/themes/lara-light-blue/theme.css';
import { createApp } from 'vue';

// Import custom styles
import './assets/styles/main.css';

import App from './App.vue';
import router from './router';

// PrimeVue components
import Breadcrumb from 'primevue/breadcrumb';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Column from 'primevue/column';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import ProgressSpinner from 'primevue/progressspinner';
import Steps from 'primevue/steps';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

const app = createApp(App);

// Use plugins
app.use(createPinia());
app.use(router);
app.use(PrimeVue);

app.use(ToastService);
app.use(ConfirmationService);

// Register directives
app.directive('tooltip', Tooltip);

// Register PrimeVue components
app.component('Button', Button);
app.component('InputText', InputText);
app.component('InputNumber', InputNumber);
app.component('Dropdown', Dropdown);
app.component('Calendar', Calendar);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Dialog', Dialog);
app.component('Toast', Toast);
app.component('Paginator', Paginator);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Breadcrumb', Breadcrumb);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Textarea', Textarea);
app.component('Dialog', Dialog);
app.component('Card', Card);
app.component('Tag', Tag);
app.component('Divider', Divider);
app.component('Steps', Steps);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);

app.mount('#app');
