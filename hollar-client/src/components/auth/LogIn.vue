<template>
  <div class="p-2 h-full flex flex-col justify-between relative">
    <div>
      <h2 class="text-darks five flex items-center gap-1">
        <i class="fa-solid fa-circle-play text-2xl"></i><span>Hollar</span>
      </h2>
    </div>
    <div class="" v-if="!signInWithMail">
      <!-- <button
        class="mb-4 mx-auto rounded bg-white dark:bg-darks shadow py-2 w-[200px] flex items-center gap-2 px-2 justify-center login"
      >
        <img src="/google.svg" alt="google sign in" class="w-[20px] h-[20px]" />
        <span class="">Log in with Google</span>
      </button> -->
      <button
        class="mb-3 mx-auto rounded bg-white dark:bg-darks shadow py-2 w-[200px] flex items-center justify-center gap-3 login"
        @click.prevent="signInWithMail = true"
      >
        <img src="/Minduka-mail.svg" alt="email sign in" class="w-[20px] h-[20px]" />

        <!-- <span class="text-base text-[20px]"><i class="fa-regular fa-envelope"></i></span> -->
        <span class="">Log in with Email</span>
      </button>
    </div>
    <div class="" v-else>
      <vee-form class="flex flex-col gap-3" :validation-schema="schema" @submit="login">
        <div class="w-[80%] mx-auto">
          <label for="username" class="dark:text-darks">Email/Username:</label>
          <vee-field
            type="username"
            name="username"
            id="username"
            class="border border-gray-700 dark:text-darks block w-full rounded p-1 focus:outline focus:outline-base"
          />
          <ErrorMessage class="text-red-500 text-sm" name="username" />
        </div>
        <div class="w-[80%] mx-auto">
          <label for="password" class="dark:text-darks">Password:</label>
          <vee-field
            type="password"
            name="password"
            id="password"
            class="border dark:text-darks border-gray-700 block w-full rounded p-1 focus:outline focus:outline-base"
          />
          <ErrorMessage class="text-red-500 text-sm" name="password" />
        </div>
        <button
          class="loginemail mt-2 py-1 px-2 bg-green-700 self-center rounded-lg text-white five shadow-sm"
          :class="{ 'cursor-not-allowed': loading }"
          :disabled="loading"
        >
          Log in
        </button>
      </vee-form>
      <span
        class="absolute top-[50%] -translate-y-[50%]"
        aria-label="go back"
        @click.prevent="signInWithMail = false"
      >
        <i class="icon pi pi-angle-double-left cursor-pointer text-base"></i>
      </span>
    </div>
    <span
      class="five cursor-pointer hover:underline self-start dark:text-darks"
      @click.prevent="$emit('auth-kind')"
    >
      Register?
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import 'primeicons/primeicons.css'
import { loginQuery } from '@/graphql/queries'
import { useLazyQuery } from '@vue/apollo-composable'
defineEmits(['auth-kind'])

const auth = useAuthStore()
const router = useRouter()

const signInWithMail = ref(false)
const schema = reactive({
  username: 'required',
  password: 'required'
})
const loginUser = ref({})
const { result, load, refetch, loading, onResult } = useLazyQuery(
  loginQuery,
  { loginUser },
  { fetchPolicy: 'no-cache' }
)
function login(values: any) {
  loginUser.value = values
  load() || refetch()
}

onResult((result) => {
  console.log(result)
  const user = result.data.loginWithEmail
  if (user) {
    auth.login(user)
    router.push('/')
  }
  console.log('authtoken', auth.token)
  console.log('isAuth', auth.isAuth)
  console.log('auth', auth.user)
})
</script>

<style scoped>
.login:hover {
  box-shadow: rgba(60, 57, 68, 0.2) 1px 2px 5px 1px;
}

.loginemail:hover {
  box-shadow: rgba(88, 30, 235, 0.2) 0px 1px 3px 0px;
}
</style>
