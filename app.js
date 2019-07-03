import Koa from 'koa'
import Router from 'koa-router'
import parser from 'koa-bodyparser'
import koaBody from 'koa-body'
import path from 'path'
import serve from 'koa-static'

import routes from './server/routes'
import color from 'colors'

const app = new Koa()
const router = new Router()

app.use(parser({
  formLimit: 999999000000
}))
// app.use(koaBody({
//   multipart: true,
//   formidable: {
//     maxFileSize: 200000000000 * 1024 * 1024, // 设置上传文件大小最大限制，默认2M
//     uploadDir: path.resolve(__dirname, '/static/upload')
  // }
// }
// ))

app.use(async (ctx,next)=>{
  const start = Date.now()
  await next()
  console.log(ctx.method, ctx.request.url, Date.now() - start+'ms')
})

app.use(serve(path.resolve('dist')))

router.get('/',ctx=>{
  ctx.body = 'jjjjjjjjjjjjj'
})

router.use(routes)
app.use(router.routes())

app.listen(3000)

console.log('[SERVER]'.black.bgWhite+' is running at '+'http://localhost:3000'.bgWhite)
