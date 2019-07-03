import db from '../db/models'
import jwt from 'jsonwebtoken'

const User = db.User

const getUserAtLog = async ctx=>{
  await User.findOne({
    account: ctx.request.body.account,
    password: ctx.request.body.password
  },(err,val)=>{
    if (err) {
      ctx.body = {
        success: false
      }
    }else {
      const token = jwt.sign(val.toJSON(),'schedule-user')
      console.log('发送前')
      ctx.body = {
        success: true,
        token: token
      }
    }
  })
}

export default {
  getUserAtLog
}
