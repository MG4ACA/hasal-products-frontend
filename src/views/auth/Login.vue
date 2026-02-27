<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="/logo.png" alt="Hasal POS Logo" class="logo-image" />
        <h1>Hasal POS</h1>
        <p>Inventory Management System</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <InputText
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Enter your username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <InputText
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <Button type="submit" label="Login" class="w-full" :loading="loading" :disabled="loading" />
      </form>
    </div>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const { showSuccess, showError } = useToastNotification();

const form = ref({
  username: 'admin',
  password: 'admin123',
});

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;

  try {
    await authStore.login(form.value.username, form.value.password);
    showSuccess('Logged in successfully!', 'Login Successful');
    router.push('/');
  } catch (err) {
    showError(err.message || 'Login failed. Please try again.', 'Login Failed');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-image {
  width: 100px;
  height: auto;
  margin-bottom: 1rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.login-header h1 {
  color: #667eea;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #999;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}
</style>
