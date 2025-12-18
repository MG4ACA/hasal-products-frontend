<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Page not found</p>
    <RouterLink to="/"> Back to Dashboard </RouterLink>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
}

.not-found h1 {
  font-size: 4rem;
  color: #667eea;
}

.not-found p {
  font-size: 1.5rem;
  color: #999;
  margin: 1rem 0;
}

.not-found a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
}
</style>
