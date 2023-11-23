
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


app.post('/',(req,res)=>{

	let entry = Object.assign({
			ip: req.ip,
			time: new Date()
		},
		req.body
	)

	data = upsert(data)(entry)

	res.render('result',{
		pick:req.body.color_value,
		all_picks: data
	})

	fs.writeFile('data.json',JSON.stringify(data),{},e=>{

		if(e)console.log(e)

	})




})

app.listen(3333)