import Router from 'koa-router'
import login from './controllers/login'
import index from './controllers/index'

const router = new Router()

//login 界面
router.post('/login',async ctx=>{
  await login.getUserAtLog(ctx)
})


//index 界面
router.post('/addTodo',async ctx=>{
  await index.addTodo(ctx)
  // await index.one(ctx)
})

router.post('/getTodos',async ctx=>{
  await index.getTodos(ctx)
})

router.post('/addDeadline',async ctx=>{
  await index.addDeadline(ctx)
})

router.post('/complete',async ctx=>{
  await index.complete(ctx)
})

router.post('/shareTodo', async ctx=>{
  await index.shareTodo(ctx)
})

router.post('/search', async ctx=>{
  await index.search(ctx)
})

router.post('/addFriend', async ctx=>{
  await index.addFriend(ctx)
})

router.post('/deleteFriend', async ctx=>{
  await index.deleteFriend(ctx)
})

router.post('/getFriends', async ctx=>{
  await index.getFriends(ctx)
})

router.post('/deleteTodo', async ctx=>{
  await index.deleteTodo(ctx)
})

router.post('/getShared', async ctx=>{
  await index.getShared(ctx)
})

router.post('/addGroup', async ctx=>{
  await index.addGroup(ctx)
})

router.post('/getGroups', async ctx=>{
  await index.getGroups(ctx)
})

router.post('/getGroupMembers', async ctx=>{
  await index.getGroupMembers(ctx)
})

router.post('/getUserName', async ctx=>{
  await index.getUserName(ctx)
})

router.post('/getTodoByID', async ctx=>{
  await index.getTodoByID(ctx)
})

router.put('/upload', async ctx=>{
  await index.upload(ctx)
})

router.post('/sign', async ctx=>{
  await index.sign(ctx)
})

export default router.routes()
