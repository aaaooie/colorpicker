const fs = require('fs')

let data = require('./data.json')

let disturb = range=>ratio=>el=>{

	let delta = Math.round(range*ratio)

	let from = el-delta

	from=(from<0)?0:from

	let to = el+delta

	to=(to>range)?range:to

	return from+Math.round(Math.random()*(to-from))

}

let clone=o=>Object.assign({},o) // weak

let res=[]

data.forEach(e=>{

	for (let i=0;i<25; i++) {

		let b=clone(e)

		b.color_value=`#${e.color_value.slice(1)
			.match(/.{1,2}/g)
			.map(s=>parseInt(s,16))
			.map(disturb(255)(30/100))
			.map(n=>n.toString(16))
	        .map(s=>1==s.length?`0${s}`:s)
	        .join('')}`

	    res.push(b)
	}

})

fs.writeFile('test.json',JSON.stringify(res),{},e=>{
	if(e){console.log(e)}else console.log(`ok written ${res.length} elements`)
})