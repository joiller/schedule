<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  import jwt from 'jsonwebtoken'

export default {
  name: 'App',
  data(){
    return {
      user:{}
    }
  },
  methods:{
    getUser(){
      this.user = this.$cookies.get('schedule-user')
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*margin-top: 60px;*/
}
</style>
