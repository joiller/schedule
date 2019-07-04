<template>
    <div>
      <nav class="sidenav">
        <div>
          <img :src="decodedUser.selfImg" style="width: 50px;height: 50px;border-radius: 50%" alt="">
          <p>{{decodedUser.name}}</p>
          <p><b-button v-on:click="logout">注销</b-button></p>
        </div>
        <ul class="navbar-nav" ref="navbar">
          <li class="nav-item item-checked" @click="navi(1)">我的安排</li>
          <li class="nav-item" @click="navi(2)">共享安排</li>
          <li class="nav-item" @click="navi(3)">好友</li>
          <li class="nav-item" @click="navi(4)">用户组</li>
          <li class="nav-item" @click="navi(5)">已完成</li>
        </ul>
      </nav>
      <div class="main">
        <div class="todo-show" v-if="nav===1||nav===2||nav===5">
          <div class="top-row">
            <b-form-input v-model="todo" placeholder="添加安排"></b-form-input>
            <div class="addIon" @click="addTodo">
              <MdAddIcon class="addIon"></MdAddIcon>
            </div>
          </div>
          <div class="my-schedule-container" v-if="todoList">
            <b-table :items="filteredItems" :fields="field" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc">
              <template slot="deadline" slot-scope="data">
                <div v-if="data.value">
                  <span v-if="data.value">{{data.value}}</span>
                </div>
                <div v-else>
                  <b-button v-b-modal="data.item._id">添加</b-button>
                  <b-modal v-bind:id="data.item._id">
                    <input type="date" v-model="deadline">
                    <button @click="addDeadline(data.item._id)">确认</button>
                  </b-modal>
                </div>
              </template>
              <template slot="dododo" slot-scope="data">
                <div v-if="nav!==5">
                  <b-button v-b-modal="'share'+data.item._id">分享</b-button>
                  <b-modal v-bind:id="'share'+data.item._id">
                    <input type="text" placeholder="用户id" v-model="member">
                    <b-button @click="shareTodo(data.item._id,member)">分享</b-button>
                  </b-modal>
                </div>
                <b-button v-else @click="deleteTodo(data.item._id)">删除</b-button>
                <b-button v-if="nav!==5" @click="completeTodo(data.item._id)">完成</b-button>
                <b-button v-else @click="uncompleteTodo(data.item._id)">未完成</b-button>
              </template>
              <template slot="dididi" slot-scope="data" v-if="nav===2">
              </template>
            </b-table>
          </div>
        </div>
        <div class="friends" v-else-if="nav===3||nav===4">
          <div class="top-row" style="height: 35px" v-if="nav===3">
            <b-form-input placeholder="Search..." v-model="search" @focus="ltSearch" style="height: 100%">
              <b-table :items="searchedItems"></b-table>
            </b-form-input>
            <div>
              <b-button v-b-modal.searchModal style="width: 100px;height: 100%" @click="bgSearch">搜索</b-button>
              <b-modal id="searchModal">
                <b-table :items="bgSearchItems" :fields="searchField">
                  <template slot="selfImg" slot-scope="data">
                    <img :src="data.value" width="80" alt="">
                  </template>
                  <template slot="dododo" slot-scope="data">
                    <b-button v-if="friends.map(f=>(f=>f.name)(f)).includes(data.item.name)" @click="deleteFriend(data.item._id)">删除好友</b-button>
                    <b-button v-else @click="addFriend(data.item._id)">添加</b-button>
                  </template>
                </b-table>
              </b-modal>
            </div>
          </div>
          <div v-else class="top-row" style="height: 35px">
            <b-button v-b-modal.addGroup>创建用户组</b-button>
            <b-modal id="addGroup">
              <b-table :items="friends" :fields="field">
                <template slot="selfImg" slot-scope="data">
                  <img :src="data.value" width="80" alt="">
                </template>
                <template slot-scope="data" slot="dododo">
                  <b-form-checkbox name="grouped" :value="data.item.id" v-model="addedGroupMembers"></b-form-checkbox>
                </template>
              </b-table>
              <b-form-input v-model="nameOfGroup" placeholder="小组名字"></b-form-input>
              <b-button @click="addGroup">创建</b-button>
            </b-modal>
          </div>
          <b-table v-if="nav===3" :items="friends" :fields="field">
            <template slot="selfImg" slot-scope="data">
              <img :src="data.value" width="80" alt="">
            </template>
            <template slot="dododo" slot-scope="data">
              <b-button v-b-modal="'addToGroupModal'+data.item.id">添加到小组</b-button>
              <b-modal :id="'addToGroupModal'+data.item.id">

              </b-modal>
            </template>
          </b-table>
          <b-table v-else :items="groups" :fields="groupField">
            <template slot="groupImg" slot-scope="data">
              <img :src="data.value" width="80" alt="">
            </template>
            <template slot-scope="data" slot="dododo">
              <b-button @click="getGroupMembers(data.item._id,data.item.members)">成员</b-button>
              <b-button @click="getGroupTodos(data.item._id,data.item.todoList)">安排</b-button>
              <b-button v-b-modal="'shareToGroup'+data.item._id">分享</b-button>
              <b-modal :id="'shareToGroup'+data.item._id">
                <b-table :items="todoList" :fields="sharingTodos">
                  <template slot-scope="dt" slot="dododo">
                    <b-button v-if="dt.item.shared.indexOf(data.item._id)===-1" @click="shareTodo(dt.item._id,data.item._id,true)">分享</b-button>
                    <b-button v-else>已分享</b-button>
                  </template>
                </b-table>
              </b-modal>
              <b-table :items="groupMembers[data.item._id]" :ref="'groupMembers'+data.item._id" style="display: none;">
                <template slot="selfImg" slot-scope="data">
                  <img :src="data.value" width="50" alt="">
                </template>
              </b-table>
              <b-table :ref="'groupTodos'+data.item._id" :items="groupTodos[data.item._id]" :fields="groupTodosField"></b-table>
            </template>
          </b-table>
        </div>
      </div>
    </div>
</template>

<script>
  import MdAddIcon from 'vue-ionicons/dist/md-add.vue'
  import jwt from 'jsonwebtoken'

  export default {
        name: "index",
    components:{MdAddIcon},
      data(){
          return {
            sortBy:'deadline',
            sortDesc:false,
            user:{},
            todo:'',
            todoList: [],
            btb: 'btb',
            deadline:'',
            nav:1,
            search: '',
            sharedTodos: [],
            friends:[],
            groups: [],
            bgSearchItems:[],
            member:'5d177a5439a3d61d5840542e',
            addedGroupMembers: [],
            groupMembers: {},
            groupTodos: {},
            groupTodosField: {
              title: '名字',
              creator: '发起人',
              createdAt: '发起时间',
              deadline: '结束时间'
            },
            nameOfGroup: '',
            searchField:{
              name:'名字',
              selfImg:'头像',
              dododo: '操作'
            },
            groupField: {
              name: '名字',
              groupImg: '头像',
              dododo: '操作'
            },
            sharingTodos:{
              title: '名字',
              dododo: '操作'
            }
          }
      },
    computed:{
      filteredItems(){
        switch (this.nav) {
          case 1:
            return this.todoList.filter(item=>{
              return !item.completed
            })
          case 2:
            this.sharedTodos.map(item=>{
              this.$http.post('/getUserName',{
                uid: item.creator
              })
                .then(value => {
                  this.$set(item, 'creatorName', value.data)
                })
            })
            return this.sharedTodos
          case 3:
          case 4:
          case 5:
            return this.todoList.filter(item=>{
              return item.completed
            })
        }
      },
      field(){
        switch (this.nav) {
          case 1:
          case 5:
            return {'title':'名字',
              'createdAt':{
                label: '开始时间',
                sortable: true
              },
              'deadline':{
                label:'结束时间',
                sortable: true
              },
              'dododo':{
                label: '操作'
              }
            }
          case 2:
            return {'title':'名字',
              'createdAt':{
                label: '开始时间',
                sortable: true
              },
              'deadline':{
                label:'结束时间',
                sortable: true
              },
              'creatorName': {
                label: '开启人'
              }
            }
          case 4:
          case 3:
            return {
              'name':'名字',
              'selfImg': '头像',
              'dododo': '操作'
            }
        }
      },
      searchedItems(){
        if (this.user.friends){
          let re = new RegExp(this.search)
          return this.user.friends.filter(item=>re.test(item))
        }
      },
      decodedUser(){
        return jwt.decode(this.user)
      }
    },
    // watch: {
    //   groupMembers: {
    //     handler(newVal,oldVal){
    //       console.log(oldVal,'to',newVal)
    //     },
    //     deep: true
    //   }
    // },
    methods:{
      getUser(){
        this.user = this.$cookies.get('schedule-user')
      },
      logout(){
        this.$cookies.set('schedule-user', null)
        this.$router.push('/login')
      },
      addTodo(){
        if (this.todo) {
          let data={
            user: this.user,
            todo: this.todo
          }
          this.$http.post('/addTodo',data)
            .then(value => {
              this.todo = ''
              this.todoList.push(value.data.data)
            })
        }
      },
      getTodos(){
        this.$http.post('/getTodos',{user:this.user})
          .then(value => {
            this.todoList = value.data
          })
      },
      getShared(id){
        this.$http.post('/getShared',{
          id: id
        })
          .then(value => {
            this.sharedTodos = value.data.value
            console.log(this.sharedTodos)
          })
      },
      addDeadline(id){
        if (this.deadline) {
          this.$http.post('/addDeadline',{
            id:id,
            deadline:this.deadline
          }).then(value => {
            this.getTodos()
            this.getShared(this.decodedUser._id)
          })
        }
      },
      completeTodo(id){
        this.$http.post('/complete',{
          user:this.user,
          id:id
        })
          .then(value => {
            this.getTodos()
          })
      },
      navi(i){
        console.log(this.friends)
        this.nav=i
        for (let j=0;j<this.$refs.navbar.children.length;j++) {
          this.$refs.navbar.children[j].classList.remove('item-checked')
        }
        this.$refs.navbar.children[--i].classList.add('item-checked')
        if (this.nav===3){
          this.getFriends()
        } else if (this.nav === 2) {
          this.getShared(this.decodedUser._id)
        } else if (this.nav === 4) {
          this.getFriends()
          this.getGroups(this.decodedUser._id)
        }
      },
      shareTodo(id,member,isGroup){
        this.$http.post('/shareTodo',{
          id: id,
          member: member
        })
          .then(value => {
            if (isGroup) {
              this.getTodos()
            }
          })
      },
      deleteTodo(id){
        this.$http.post('/deleteTodo',{
          user: this.decodedUser,
          todo_id: id
        })
      },
      uncompleteTodo(id){

      },
      ltSearch(){

      },
      bgSearch(){
        this.$http.post('/search',{
          search: this.search
        })
          .then(value => {
            this.bgSearchItems = value.data.value
          })
      },
      getFriends(){
        console.log('getfriends')
        this.$http.post('/getFriends',{
          user: this.user
        })
          .then(value => {
            this.friends = value.data.friends
          })
      },
      addFriend(id){
        this.$http.post('/addFriend',{
          user: this.user,
          f_id: id
        })
          .then(this.getFriends)
      },
      deleteFriend(id){
        this.$http.post('/deleteFriend',{
          user: this.user,
          f_id: id
        })
          .then(this.getFriends)
      },
      addGroup(){
        if (!this.nameOfGroup){
          return
        }
        this.$http.post('/addGroup',{
          cid: this.decodedUser._id,
          name: this.nameOfGroup,
          members: this.addedGroupMembers
        })
      },
      getGroups(){
        this.$http.post('/getGroups',{
          uid: this.decodedUser._id
        })
          .then(value => {
            this.groups = value.data.value
          })
      },
      getGroupMembers(gid,members){
        let dis = this.$refs['groupMembers'+gid].$el.style.display
        if (dis === 'none') {
          this.$refs['groupMembers'+gid].$el.style.display = 'block'
        } else {
          this.$refs['groupMembers'+gid].$el.style.display = 'none'
        }
        this.$http.post('/getGroupMembers',{
          members: members
        })
          .then(value => {
            // 用 vm.$set 动态改变值 见：
            // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
            this.$set(this.groupMembers ,gid, value.data.value)
          })
      },
      getGroupTodos(gid,tids){
        let dis = this.$refs['groupTodos'+gid].$el.style.display
        if (dis==='none') {
          this.$refs['groupTodos'+gid].$el.style.display = 'block'
        } else {
          this.$refs['groupTodos'+gid].$el.style.display = 'none'
        }
        this.$http.post('/getTodoByID',{
          tids: tids
        })
          .then(value => {
            this.$set(this.groupTodos, gid, value.data)
          })
      }
    },
    created() {
      this.getUser()
      if (!this.user) {
        this.$router.push('/login')
      }else{
        this.getTodos()
      }
    }
  }
</script>

<style scoped>
  .sidenav{
    width: 200px;
    height: 100vh;
    position: fixed;
}
  .nav-item{
    background-color: #2c3e50;
    color: aliceblue;
    font-size: 24px;
    cursor: pointer;
  }

  .item-checked{
    background-color: aliceblue;
    color: #2c3e50;
  }

  .main{
    position: fixed;
    left: 200px;
  }

  .top-row{
    display: flex;
  }

  .form-control{
    /*width: 80%;*/
  }

  .addIon{
    /*display: inline-block;*/
    align-self: center;
    width: 16px;
    cursor: pointer;
    font-size: 24px;
    /*line-height: ;*/
  }
  .addIon svg{
    margin: 0 6px;
  }
  .addIon:hover{
    font-size: 24px;
  }

  input {
    -webkit-writing-mode: horizontal-tb !important;
    text-rendering: auto;
    color: initial;
    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-indent: 0px;
    text-shadow: none;
    display: inline-block;
    text-align: start;
    -webkit-appearance: textfield;
    background-color: white;
    -webkit-rtl-ordering: logical;
    cursor: text;
    margin: 0em;
    font: 400 13.3333px Arial;
    padding: 1px 0px;
    border-width: 2px;
    border-style: inset;
    border-color: initial;
    border-image: initial;
  }

  input[type="date" i] {
    align-items: center;
    display: -webkit-inline-flex;
    font-family: monospace;
    padding-inline-start: 1px;
    cursor: default;
    overflow: hidden;
    padding: 0px;
  }
</style>
