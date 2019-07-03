import Koa from 'koa'
import Router from 'koa-router'
import parser from 'koa-bodyparser'
import path from 'path'
import serve from 'koa-static'
import historyApiFallback from 'koa2-history-api-fallback'
import routes from './server/routes'
import color from 'colors'

const app = new Koa()
const router = new Router()

app.use(parser({
  formLimit: 999999000000
}))

app.use(async (ctx,next)=>{
  const start = Date.now()
  await next()
  console.log(ctx.method, ctx.request.url, Date.now() - start+'ms')
})

app.use(historyApiFallback())
app.use(serve(path.resolve('dist')))
app.use(serve(path.resolve(__dirname)))
router.get('/',ctx=>{
  ctx.body = 'jjjjjjjjjjjjj'
})

router.use(routes)
app.use(router.routes())

app.listen(80)

console.log('[SERVER]'.black.bgWhite+' is running at '+'http://localhost:3000'.bgWhite)
