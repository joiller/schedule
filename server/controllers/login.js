import db from '../db/models'
import jwt from 'jsonwebtoken'

const User = db.User

const getUserAtLog = async ctx=>{
  console.log('logining')
  await User.findOne({
    account: ctx.request.body.account,
    password: ctx.request.body.password
  })
    .then(val=>{
      const token = jwt.sign(val.toJSON(),'schedule-user')
      console.log('发送前')
      ctx.body = {
        success: true,
        token: token
      }
    })
    .catch(err=>{
      ctx.body = {
        success: false
      }
    })
}

export default {
  getUserAtLog
}
