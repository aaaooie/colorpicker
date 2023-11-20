
const fs = require('fs')

const express = require('express')
const serveStatic = require('serve-static')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.urlencoded({extended:true}));

app.use(serveStatic('client'))

app.post('/',(req,res)=>{


	console.log(req.body)

	res.sendStatus(200)


})

app.listen(3333)