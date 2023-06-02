<template>
  <van-sidebar v-model="active">
    <van-sidebar-item title="Title" dot />
    <van-sidebar-item title="Title" badge="5" />
    <van-sidebar-item title="Title" />
  </van-sidebar>
</template>

<script>
import 'vant/es/sidebar/style'
export default {
  name: "Sidebar"
}
</script>

<style scoped>

</style>