<template>
  <div>
    <b-col v-if="isLogin" style="position: absolute;top: 50%;left: 50%;transform: translate(-50%,-50%); width: 50%">
      <b-row style="display: flex;justify-content: center">
        <label for="">账号
          <input type="text" v-model="account">
        </label>
      </b-row>
      <b-row style="display: flex;justify-content: center">
        <label for="">密码
          <input type="text" v-model="password">
        </label>
      </b-row>
      <b-row style="display: flex;justify-content: center">
        <b-button variant="outline-primary" @click="toLogin">登录</b-button>
        <b-button variant="outline-primary" @click="toggleState">去注册</b-button>
      </b-row>
    </b-col>
    <b-col v-else style="position: absolute;top: 50%;left: 50%;transform: translate(-50%,-50%); width: 50%">
      <div>
        <img :src="previewImage" alt="" style="width: 80px;height: 80px">
      </div>
      <b-row style="display: flex;justify-content: center">
        <label for="">头像
          <input type="file" @change="imgChange">
        </label>
      </b-row>
      <b-row style="display: flex;justify-content: center">
        <label for="">账号
          <input type="text" v-model="account" required>
        </label>
      </b-row>
      <b-row style="display: flex;justify-content: center">
        <label for="">密码
          <input type="text" v-model="password" required>
        </label>
      </b-row>
      <b-row style="display: flex;justify-content: center">
        <label for="">姓名
          <input type="text" v-model="name" required>
        </label>
      </b-row>
      <b-row style="display: flex;justify-content: center">
        <label for="">邮箱
          <input type="email" v-model="email" required>
        </label>
      </b-row>
      <b-row style="display: flex;justify-content: center">
        <b-button variant="outline-primary" @click="toSign">注册</b-button>
        <b-button variant="outline-primary" @click="toggleState">去登录</b-button>
      </b-row>
    </b-col>
  </div>
</template>

<script>
  import jwt from 'jsonwebtoken'
    export default {
        name: "login",
      props:['user'],
      data(){
          return {
            account: '',
            password: '',
            isLogin: true,
            name: '',
            email: '',
            selfImg: null,
            previewImage: ''
          }
      },
      methods:{
        imgChange(ev){
          this.selfImg = ev.target.files[0]
          console.log(this.selfImg)
          const reader = new FileReader();
          reader.readAsDataURL(this.selfImg);
          reader.onload = e =>{
            this.previewImage = e.target.result;
          };
        },
        toggleState(){
          this.isLogin = !this.isLogin
        },
        toLogin(){
          this.$http.post('/login',{
            account: this.account,
            password: this.password
          })
            .then(value => {
              if (value.data.success) {
                this.$cookies.set('schedule-user',value.data.token)
                this.$router.push('/')
              } else {
                this.$cookies.remove('schedule-user')
              }
            })
        },
        toSign(){
          if (this.selfImg) {
            let config = {
              header : {
                'Content-Type' : 'multipart/form-data'
              }
            }
            let data = new FormData()
            data.append('file', this.selfImg)
            this.$http.put('/upload',data,config)
              .then(value => {
                if (value.data.success){
                  this.$http.post('/sign',{
                    selfImg: value.data.selfImg||null,
                    name: this.name,
                    account: this.account,
                    password: this.password,
                    email: this.email
                  })
                }
              })
          }
        }
      },
      created() {
        const user = this.$cookies.get('schedule-user')
        if (user) {
          this.$router.push('/')
        }
      }
    }
</script>

<style scoped>

</style>
