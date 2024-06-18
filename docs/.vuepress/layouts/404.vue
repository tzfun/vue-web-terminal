<script setup>
const goHome = () => {
  document.location.href = "/"
}

const goLastPage = () => {
  if (window && window.history) {
    window.history.go(-1)
  }
}
</script>

<template>
  <div class="page">
    <div class="title">
      404 Not Found
    </div>
    <p class="des">The page you visited does not exist or has been deleted.</p>
    <div class="btn-container">
      <button class="btn btn-primary" @click="goHome">Home</button>
      <button class="btn btn-secondary" @click="goLastPage">Last Page</button>
    </div>
  </div>

</template>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.title {
  font-size: 3em;
  font-weight: 500;
  text-align: center;
  margin-top: 30%;
}
.des {
  text-align: center;
  font-size: 1.2em;
  color: #809d98;
}
.btn-container {
  display: flex;
  justify-content: center;
}
.btn {
  margin: 50px 15px;
  padding: 0.5em 1.5em;
  font-size: 1.2em;
  border-radius: 5px;
  transition: background-color .1s ease;
  box-sizing: border-box;
  cursor: pointer;
  box-shadow: 0 0 transparent, 0 0 transparent;
  border: 2px solid #389d70;
}
.btn-primary {
  color: #ffffff;
  background-color: #3eaf7c;
  border-color: rgba(240, 246, 252, 0.1);
}
.btn-secondary {
  background-color: #ffffff;
  border-color:#3eaf7c;
  color: #3eaf7c;
}
.btn:hover {
  color: #ffffff;
  background-color: #4abf8a;
}

</style>