<script setup lang="ts">
const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  if (authStore.refreshToken) {
    const refreshed = await authStore.tryRefresh();
    if (refreshed) {
      await router.push('/dashboard');
      return;
    }
  }
  await router.push('/login');
});
</script>

<template>
  <div class="loading">Loading...</div>
</template>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #666;
}
</style>