
const fs = require('fs')

const express = require('express')
const serveStatic = require('serve-static')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const cookieSession = require('cookie-session')
const crypto = require('crypto');


const app = express()

app.use(bodyParser.urlencoded({extended:true}));

app.use(serveStatic('client'))

hbs.registerHelper('slice', s=>s.slice(1))

app.set('view engine', 'hbs')

app.use(cookieSession({name: 'session',keys: ['key1','_key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 * 365 // 24 hours * 365
}))


let data = require('./data.json')

const error_handler=e=>{if(e)console.log(e)}

const upsert=arr=>el=>{

  let _key = o=>o.id
  let _secondary = ['user_link', 'color_name', 'user_name', 'color_value']

  let found = arr.map(_key).indexOf(_key(el))

  if (-1==found) {
    return [el].concat(arr)
  } else {

    let _existing= arr[found]

    _secondary.forEach(k=>_existing[k]=el[k])

    return arr
  }
}

const fetch=arr=>id=>safe=>{

  let _key = o=>o.id
  let found = arr.map(_key).indexOf(id)
  let r={}
  if (-1==found) {
    for (let i=0;i<safe.length;i++){
      r[safe[i]]=new String('')
    }
  } else {
    r=arr[found]
    for (let i=0;i<safe.length;i++){
      r[safe[i]]=r[safe[i]] || new String('')
    }
  }
  return r
}


let _show=s=>(req,res)=>res.render(s)


let check_session=(req, res, next)=>{

  // console.log(req.session)

  if (req.session.isNew || !Boolean(req.session.id)) {
    init_session(req, res, ()=>res.render('first'))

  } else next()

}

let init_session = (req, res, next)=>{

    // req.session = {}
    req.session.started=new Date;
    req.session.id=crypto.randomUUID()

    next()
}


app.get('/',check_session,_show('first'))
app.get('/about',_show('about'))
app.get('/pick',check_session,(req, res)=>{

  let user = fetch
    (data) // source
    (req.session.id) // key
    (['user_name', 'color_value', 'color_name']) // required fields

  // console.log(user)

  res.render('pick', user)
})

app.post('/pick',check_session,(req,res)=>{

  // console.log(req.session)

  if (undefined===req.body.color_value) {
    res.sendStatus(400)
    res.end()
    return
  }

  let entry = Object.assign({
      id: req.session.id,
      ip: req.ip,
      time: new Date()
    },
    req.body
  )

  data = upsert(data)(entry)

  res.render('demo',{
    pick:req.body.color_value,
    color_name:req.body.color_name,
    data_json: JSON.stringify(data),//data,
    picks_count: data.length
  })

  fs.writeFile('data.json',JSON.stringify(data),{},error_handler)
})

app.listen(3333)

console.log('http://localhost:3333/')