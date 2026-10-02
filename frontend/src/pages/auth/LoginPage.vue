<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    $q.notify({ type: 'positive', message: 'Welcome back! Logged in successfully.' })
    router.push('/')
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed. Please check your credentials.'
    $q.notify({ type: 'negative', message })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-card class="shadow-2 rounded-borders" style="width: 400px; max-width: 90vw;">
    <q-card-section class="bg-primary text-white text-center q-pa-lg">
      <div class="text-h5 text-weight-bold">Logistics OS</div>
      <div class="text-subtitle2 q-mt-sm">Sign in to your workspace</div>
    </q-card-section>

    <q-card-section class="q-pa-lg">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input
          v-model="email"
          type="email"
          label="Email address"
          outlined
          lazy-rules
          :rules="[val => !!val || 'Email is required']"
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          outlined
          lazy-rules
          :rules="[val => !!val || 'Password is required']"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <div class="row justify-between items-center">
          <q-checkbox v-model="showPassword" label="Remember me" color="primary" />
          <a href="#" class="text-primary text-subtitle2" style="text-decoration: none;">Forgot password?</a>
        </div>

        <q-btn
          type="submit"
          color="primary"
          class="full-width q-mt-md"
          size="lg"
          :loading="loading"
          label="Sign In"
          unelevated
        />

        <div class="text-center q-mt-md">
          <span class="text-grey-7">Don't have a workspace?</span>
          <router-link to="/auth/register" class="text-primary text-subtitle2 q-ml-sm" style="text-decoration: none;">
            Create one now
          </router-link>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
