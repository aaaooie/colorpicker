
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

const RGBToHSB = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const v = Math.max(r, g, b),
    n = v - Math.min(r, g, b);
  const h =
    n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
  return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];

}

const to_hsb=c=>{

  let [r,g,b]=c.color_value.slice(1)
    .match(/.{1,2}/g)
    .map(s=>parseInt(s,16))

    return RGBToHSB(r,g,b)
}


app.get('/',(req,res)=>{

  res.render('first',{ 
  })

})

app.get('/pick',(req,res)=>{
    res.render('pick',{
  })
})



app.post('/pick',(req,res)=>{

  let entry = Object.assign({
      ip: req.ip,
      time: new Date()
    },
    req.body // FIXME: add cookie checker
  )

  data = upsert(data)(entry)

  let sorted=[...data].sort((a,b)=>{

    let [ha,sa,ba] = to_hsb(a)
    let [hb,sb,bb] = to_hsb(b)

    return (ha-hb)//+(sa-sb)+(ba-bb)

  })

  res.render('demo',{ // 'result'
    pick:req.body.color_value,
    all_picks: sorted,//data,
    data_json: JSON.stringify(data),//data,
    picks_count: data.length
  })

  fs.writeFile('data.json',JSON.stringify(data),{},error_handler)
})

app.listen(3333)

console.log('http://localhost:3333/')