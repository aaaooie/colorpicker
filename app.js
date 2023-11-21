
const fs = require('fs')

const express = require('express')
const serveStatic = require('serve-static')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.urlencoded({extended:true}));

app.use(serveStatic('client'))

app.set('view engine', 'hbs')


let data = require('./data.json')


let upsert=arr=>el=>{

	let _key = o=>o.user_name+o.color_value
	let _secondary = ['user_link', 'color_name']


	let found = arr.map(_key).indexOf(_key(el))

	if (-1==found) {
		arr.push(el)
		return arr
	} else {

		let _existing= arr[found]

		_secondary.forEach(k=>_existing[k]=el[k])

		return arr
	}
}


app.post('/',(req,res)=>{

	data = upsert(data)(req.body)

	console.log(req.body)

	fs.writeFile('data.json',JSON.stringify(data),{},e=>{

		// res.sendStatus(200)
		res.render('result',{
			pick:req.body.color_value,
			all_picks: data
		})

	})




})

app.listen(3333)