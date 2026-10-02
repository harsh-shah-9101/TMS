<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../stores/auth'
import api from '../../config/api'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// Form Data
const organizationName = ref('')
const organizationCode = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')

const showPassword = ref(false)
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    const response = await api.post('/auth/register', {
      organizationName: organizationName.value,
      organizationCode: organizationCode.value,
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
    })
    
    // Automatically log in the user after successful registration
    authStore.setToken(response.data.accessToken)
    authStore.setUser(response.data.user)
    
    $q.notify({ type: 'positive', message: 'Workspace created successfully!' })
    router.push('/')
  } catch (error: any) {
    const message = error.response?.data?.message || 'Registration failed. Please check your inputs.'
    $q.notify({ type: 'negative', message })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-card class="shadow-2 rounded-borders" style="width: 500px; max-width: 90vw;">
    <q-card-section class="bg-primary text-white text-center q-pa-lg">
      <div class="text-h5 text-weight-bold">Create Workspace</div>
      <div class="text-subtitle2 q-mt-sm">Set up Logistics OS for your company</div>
    </q-card-section>

    <q-card-section class="q-pa-lg">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-7">
            <q-input
              v-model="organizationName"
              label="Company Name"
              outlined
              lazy-rules
              :rules="[val => !!val || 'Company name is required']"
            >
              <template v-slot:prepend>
                <q-icon name="business" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-5">
            <q-input
              v-model="organizationCode"
              label="Company Code"
              outlined
              hint="e.g. FASTTRK"
              lazy-rules
              :rules="[val => !!val || 'Code is required']"
            />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="firstName"
              label="First Name"
              outlined
              lazy-rules
              :rules="[val => !!val || 'First name is required']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="lastName"
              label="Last Name"
              outlined
              lazy-rules
              :rules="[val => !!val || 'Last name is required']"
            />
          </div>
        </div>

        <q-input
          v-model="email"
          type="email"
          label="Admin Email Address"
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
          label="Secure Password"
          outlined
          lazy-rules
          :rules="[val => (val && val.length >= 8) || 'Password must be at least 8 characters']"
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

        <q-btn
          type="submit"
          color="primary"
          class="full-width q-mt-md"
          size="lg"
          :loading="loading"
          label="Create Workspace"
          unelevated
        />

        <div class="text-center q-mt-md">
          <span class="text-grey-7">Already have an account?</span>
          <router-link to="/auth/login" class="text-primary text-subtitle2 q-ml-sm" style="text-decoration: none;">
            Sign in here
          </router-link>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
