import db from '../db/models'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import fs from 'fs'

const Todo = db.Todo,
  User = db.User,
  Group = db.Group

const addTodo = async (ctx)=>{
  const todo = ctx.request.body.todo,
    user_token = ctx.request.body.user,
    user_id = jwt.decode(user_token)._id
  let user
  await User.findById(user_id,(err,val)=>{
    if (err) {
      console.log('找user前')
      ctx.body = {
        success: false
      }
      //  此时应该结束 addTodo 函数

    }else {
      console.log('找user前')
      user = val
    }
  })
  console.log(ctx.body)
  console.log('找user后')
  const data = {
    todo: todo,
    user: user
  }

  await createTodo(ctx,data)

}

const createTodo = async (ctx,data)=>{
  let todoValue
  await Todo.create({
    title: data.todo,
    createdAt: Date.now(),
    creator: data.user._id
  })

  // 用then 而不用他自带的 (err,val)=>{}
  // 因为那个东西导致create函数返回的不是个pormise对象之类的
  // 反正不适用于await

  //  然而如果用自带的(err,val)=>{}的话，
  //  他不仅不是promise对象，也不是个async函数
  //  所以不需要await
  //  所以还是推荐用自带的吧
    .then(value=>{
      todoValue = value
      console.log('发出去了')
      data.user.todoList.push(value._id)
      // ctx.body = {
      //   success: true,
      //   data: value
      // }
    })

  await User.updateOne({
    _id: data.user._id
  },{
    todoList: data.user.todoList
  })

  ctx.body = {
    success: true,
    data: todoValue
  }
}

const getTodos = async ctx=>{
  const user = jwt.decode(ctx.request.body.user)
  if (user){
    const user_id = user._id
    await Todo.find({creator: user_id})
      .then(value =>{
        ctx.body = value
      })
  }else {
    ctx.body = {
      success: false
    }
  }
}

const getShared = async ctx=>{
  const id = ctx.request.body.id
  await Todo.find({
    shared: id
  },(err,val)=>{
    ctx.body = {
      value: val
    }
  })
}

const addDeadline = async ctx=>{
  const id = ctx.request.body.id,
    deadline = ctx.request.body.deadline
  await Todo.updateOne({
    _id:id
  },{
    deadline:deadline
  }).then(value=>{
    ctx.body = {
      success: true,
      value: value
    }
  })
}

const complete = async ctx=>{
  const id = ctx.request.body.id
  await Todo.updateOne({
    _id: id
  },{
    completed: true
  })
    .then(value=>{
      ctx.body = {
        success: true,
        value: value
      }
    })
}

const shareTodo = async ctx=>{
  const body = ctx.request.body,
    id = body.id,
    member = body.member
  let success = 0,
    todoList = [],
    shared,
    isGroup
  if (member instanceof Array){
    for (let i=0;i<member.length;i++) {
      await User.findOne({
        _id: member[i]
      },(err,val)=>{
        val.todoList.push(id)
        User.updateOne({
          _id: member[i]
        },{
          todoList: val.todoList
        },(e,v)=>{
          Todo.findOne({
            _id: id
          },(todoErr,todoVal)=>{
            shared = todoVal.shared
            shared.push(member[i])
            Todo.updateOne({
              _id: id
            },{
              shared: shared
            })
          })
        })
      })
      ctx.body = {
        success: true
      }
    }
  }else {
    await User.findOne({
      _id: member
    })
      .then(val=>{
        if (val){
          todoList = val.todoList||[]
          if (todoList.indexOf(id)===-1) {
            todoList.push(id)
          }
          isGroup = false
        }
      })
    await Group.findById(member,(err,val)=>{
      if (val) {
        todoList = val.todoList||[]
        if (todoList.indexOf(id)===-1) {
          todoList.push(id)
        }
        isGroup = true
      }
    })
    await Todo.findById(id,(err,val)=>{
      shared = val.shared
      if (shared.indexOf(member)===-1) {
        shared.push(member)
      }
    })
    await Todo.updateOne({
      _id: id
    },{
      shared: shared
    })
    if (isGroup) {
      await Group.updateOne({
        _id: member
      },{
        todoList: todoList
      },(err,val)=>{
        ctx.body = {
          value: val
        }
      })
    }else {
      await User.updateOne({
        _id: member
      },{
        todoList: todoList
      })
        .then(value=>{
          ctx.body = {
            value: value
          }
        })
    }
  }
}

const search = async ctx=>{
  let str = ctx.request.body.search,
    re = new RegExp(str)
  await User.find((err,val)=>{
    let finded=val.filter(v=>{
      return re.test(v.name)})
    ctx.body = {
      value: finded
    }
  })
}

const addFriend = async ctx=>{
  let f_id = ctx.request.body.f_id,
    id = jwt.decode(ctx.request.body.user)._id,
    friends
  await User.findOne({
    _id: id
  }, (err, val) => {
    if (val.friends) {
      friends = val.friends
    } else {
      friends = []
    }
    if (friends.indexOf(f_id)===-1) {
      friends.push(f_id)
    }
  })
  await User.updateOne({
    _id: id
  },{
    friends: friends
  },(e,v)=>{
    ctx.body = {
      value:v
    }
  })
}

const deleteFriend = async ctx=>{
  let id = jwt.decode(ctx.request.body.user)._id,
    f_id = ctx.request.body.f_id,
    new_f = []
  await User.findOne({
    _id: id
  },(err,val)=>{
    new_f = val.friends
    new_f.splice(new_f.indexOf(f_id),1)
  })
  await User.updateOne({
    _id: id
  },{
    friends: new_f
  },(err,val)=>{
    ctx.body = {
      val: val
    }
  })
}

const getFriends = async ctx=>{
  let id = jwt.decode(ctx.request.body.user)._id,
    friends,
    friendStructure = (obj)=>({
      'id': obj._id,
      'name':obj.name,
      'selfImg':obj.selfImg
    })
  await User.findOne({
    _id: id
  },(err,val)=>{
      friends = val.friends
  })
  await User.find({
    _id: {$in:friends}
  },(err,val)=>{
    ctx.body = {
      friends: val.map(item=>friendStructure(item))
    }
  })
}

const deleteTodo = async ctx=>{
  const body = ctx.request.body,
    uid = body.user._id,
    tid = body.todo_id
    let shared,
      creator
  await Todo.findById(tid,(err,val)=>{
    creator = val.creator
    shared = val.shared
  })
  if (uid ==creator) {
    let todoList
    await Todo.deleteOne({_id: tid})
    await User.findById(uid,(err,val)=>{
      todoList = val.todoList
      todoList.splice(todoList.indexOf(tid),1)
    })
    await User.updateOne({
      _id: uid
    },{
      todoList: todoList
    })
    for (let i=0;i<shared.length;i++) {
      await User.findById(shared[i],(err,val)=>{
        todoList = val.todoList
        todoList.splice(todoList.indexOf(tid),1)
      })
      await User.updateOne({
        _id: shared[i]
      },{
        todoList: todoList
      })
    }
    console.log('成功')
    ctx.body={
      success: true
    }

  }else {
    console.log('失败')
    ctx.body = {
      success: false
    }
  }
}

const addGroup = async ctx=>{
  const body = ctx.request.body,
    cid = body.cid,
    name = body.name
  let members = body.members
  console.log('members1:',members)
  if (members.indexOf(cid)===-1) {
    members.push(cid)
  }
  console.log('members2:',members)
  let groupMembers = members.map(item=>{
    if (item===cid) {
      return {
        user_id: item,
        status: -1
      }
    }else {
      return {
        user_id: item,
        status: 1
      }
    }
  })
  console.log(groupMembers)
  let groups,
    gid
  await Group.create({
    name: name,
    members: groupMembers
  })
    .then(val=>{
      gid=val._id
    })
  for (let i=0;i<groupMembers.length;i++) {
    await User.findById(groupMembers[i].user_id,(err,val)=>{
      groups = val.groups||[]
      console.log('gid:',gid)
      if (groups.indexOf(gid)===-1) {
        groups.push(gid)
      }
    })
    await User.updateOne({
      _id: groupMembers[i].user_id
    },{
      groups: groups
    })
  }

  ctx.body = {
    success: true
  }
}

const getGroups = async ctx=>{
  const uid = ctx.request.body.uid
  let gids,
    groups=[]
  await User.findById(uid,(err,val)=>{
    gids = val.groups
  })
  for (let i=0;i<gids.length;i++) {
    await Group.findById(gids[i],(err,val)=>{
      if (groups.indexOf(val)===-1) {
        groups.push(val)
      }
    })
  }
  ctx.body = {
    value: groups
  }
}

const getGroupMembers = async ctx=>{
  const members = ctx.request.body.members
  let membersed=[]
  for (let i=0;i<members.length;i++) {
    await User.findById(members[i].user_id,(err,val)=>{
      membersed.push({
        name: val.name,
        selfImg: val.selfImg
      })
    })
  }
  ctx.body = {
    value: membersed
  }
}

const getUserName = async ctx=>{
  const uid = ctx.request.body.uid
  await User.findById(uid,(err,val)=>{
    ctx.body = val.name
  })
}

const getTodoByID = async ctx=>{
  const tids = ctx.request.body.tids
  tids.map(item=>mongoose.Types.ObjectId(item))
  await Todo.find({
    _id: {
      $in: tids
    }
  },(err,val)=>{
    ctx.body = val
  })
}
import busBoy from 'async-busboy'

const upload = async ctx=>{
  console.log('get a file')
  let dir = __dirname.split('\\')
  let root = dir.slice(0,dir.length-2).join('\\')+'\\static\\upload\\'
  await busBoy(ctx.req)
    .then(function (formData) {
      const file = formData.files[0],
        reader = fs.createReadStream(file.path),
        ext = file.filename.split('.').pop(),
        upto = fs.createWriteStream(`${root}${Date.now().toString()}.${ext}`)
      reader.pipe(upto)
      console.log(upto.path)
      let fpath = upto.path.split('\\')
      ctx.body = {
        success: true,
        selfImg: fpath.slice(fpath.length-3).join('/')
      }
    })
}

const sign = async ctx=>{
  const body = ctx.request.body
  let value
  if (body.selfImg) {
    await User.create({
      name: body.name,
      account: body.account,
      email: body.email,
      password: body.password,
      selfImg: body.selfImg
    },(err,val)=>{
      value = val
    })
  }else {
    await User.create({
      name: body.name,
      account: body.account,
      email: body.email,
      password: body.password,
    },(err,val)=>{
        value= val
    })
  }
  ctx.body = {
    success: true,
    value: value
  }
}

export default {
  addTodo,
  getTodos,
  addDeadline,
  complete,
  shareTodo,
  search,
  addFriend,
  deleteFriend,
  getFriends,
  deleteTodo,
  getShared,
  addGroup,
  getGroups,
  getGroupMembers,
  getUserName,
  getTodoByID,
  upload,
  sign
}
