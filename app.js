
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


let upsert=arr=>el=>{

	let _key = o=>o.user_name+o.color_value
	let _secondary = ['user_link', 'color_name']


	let found = arr.map(_key).indexOf(_key(el))

	if (-1==found) {
		// arr.push(el)
		return [el].concat(arr)
	} else {

		let _existing= arr[found]

		_secondary.forEach(k=>_existing[k]=el[k])

		return arr
	}
}

// app.get('/demo',(req,res)=>{

// 	res.render('result',{})
// })


const to_n=c=>parseInt(c.color_value.slice(1),16)


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


app.post('/',(req,res)=>{

	let entry = Object.assign({
			ip: req.ip,
			time: new Date()
		},
		req.body
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
		picks_count: data.length
	})

	fs.writeFile('data.json',JSON.stringify(data),{},e=>{

		if(e)console.log(e)

	})




})

app.listen(3333)

console.log('http://localhost:3333/')