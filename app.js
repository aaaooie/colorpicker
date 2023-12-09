
const fs = require('fs')

const express = require('express')
const serveStatic = require('serve-static')
const bodyParser = require('body-parser')
const hbs = require('hbs')

const app = express()

app.use(bodyParser.urlencoded({extended:true}));

app.use(serveStatic('client'))

hbs.registerHelper('slice', s=>s.slice(1))

app.set('view engine', 'hbs')


let data = require('./data.json')

const error_handler=e=>{if(e)console.log(e)}

const upsert=arr=>el=>{

  let _key = o=>o.user_name+o.color_value
  let _secondary = ['user_link', 'color_name']

  let found = arr.map(_key).indexOf(_key(el))

  if (-1==found) {
    return [el].concat(arr)
  } else {

    let _existing= arr[found]

    _secondary.forEach(k=>_existing[k]=el[k])

    return arr
  }
}


let _show=s=>(req,res)=>res.render(s)


app.get('/',_show('first'))
app.get('/pick',_show('pick'))
app.get('/about',_show('about'))

app.post('/pick',(req,res)=>{

  let entry = Object.assign({
      ip: req.ip,
      time: new Date()
    },
    req.body // FIXME: add cookie checker
  )

  data = upsert(data)(entry)

  res.render('demo',{
    pick:req.body.color_value,
    data_json: JSON.stringify(data),//data,
    picks_count: data.length
  })

  fs.writeFile('data.json',JSON.stringify(data),{},error_handler)
})

app.listen(3333)

console.log('http://localhost:3333/')