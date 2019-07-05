import mongoose from 'mongoose'

mongoose.connect('mongodb://localhost/schedule', { useNewUrlParser: true })
  .then(()=>{
    console.log('ok ok')
  })
  .catch(e=>{
    console.log(e)
  })

let db = mongoose.connection
db.on('error',console.error.bind(console,'connection error'))
db.once('open',function () {
  console.log('connected')
})

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    require: true
  },
  account: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true
  },
  name: {
    type: String,
    default: '不取名的凑弟弟'
  },
  email: {
    type: String,
    unique: true
  },
  selfImg: {
    type: String,
    default: 'static/default-selfImg.png'
  },
  todoList:[],
  friends:Array,
  groups: Array
})

const User =mongoose.model('user',userSchema)

const Todo = mongoose.model('todo',new mongoose.Schema({
  id: {
    type: Number,
    require: true
  },
  title: String,
  createdAt: Date,
  deadline: Date,
  subTodoList:Array,
  creator: mongoose.ObjectId,
  shared:Array,
  editor:Array,
  completed: Boolean
}))

const Group = mongoose.model('group',new mongoose.Schema({
  id: {
    type: Number,
    require: true
  },
  name: String,
  groupImg: {
    type: String,
    default: 'static/default-groupImg.png'
  },
  members:[{
    user_id:mongoose.ObjectId,
    status: Number}],
  todoList: []
}))

// let alice = new User({
//   account: '1222fff',
//   password: 'jhl',
//   email: 'jhl123'
// })
//
// alice.save((err,me)=>{
//   if (err){console.log(err)}
//   else {console.log(me)}
// })

// User.find((err,user)=>{
//   if (err) {
//     console.log(err)
//   }else {
//     console.log(user)
//   }
// })
//
// User.updateOne({account:'1222fff'},{name:'大帅哥'},(e,v)=>{
//   if (e){
//     console.log(e)
//   } else {
//     console.log(v)
//   }
// })

// User.create({
//   name: '小胖子',
//   account: 'xpzlalala',
//   password: 'jhl',
//   email: 'xpz123'
// },(e,v)=>{
//   if (e){
//     console.log(e)
//   } else {
//     console.log(v)
//   }
// })


// let creatorTodoList,tobeM
// Todo.find()
//   .then(value=>{
//     creatorTodoList = value
//     tobeM = creatorTodoList.map(item=>item._id)
//     User.updateOne({
//       account: '1222fff'
//     },{
//       todoList: tobeM
//     })
//       .then(val=>{
//         console.log(val)
//         console.log(tobeM)
//         console.log(creatorTodoList.map(item=>item._id))
//       })
//     }
//   )


// Todo.updateOne({
//   shared: null
// },{
//   shared: []
// },(err,val)=>{
//   console.log(val)
// })

// User.updateMany({
//   password: 'jhl'
// },{
//   groups:[]
// },(err,val)=>{
//   console.log(val)
// })
//
// Group.deleteMany({},(err,val)=>{
//   console.log(val)
// })

console.log('我在create下面')
// console.log(alice)

export default {
  User,
  Todo,
  Group
}
