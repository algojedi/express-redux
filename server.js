const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'postgres',
		password: 'postgres', 
		database: 'todobase'

	}
});


// db.select('*').from('users')
// 	.then(data => console.log(data));


const app = express();

app.use(cors());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the React frontend app
//app.use(express.static(path.join(__dirname, 'client/build')))

// Anything that doesn't match the above, send back index.html
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/client/build/index.html'))
// })


app.post('/', (req, res) => {
    db.select('email', 'hash').from('login')
    .where('email','=', req.body.email)
    .then(data => {
    	const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
    	if (isValid) {
    		return db.select('*').from('users')
    		.where('email', '=', req.body.email)
    		.then(user => {
    			res.json(user[0])
    		})
    		.catch(err => res.status(400).json('unable to fetch user'))
    	} else {
    		res.status(400).json('incorrect username or password');
    	}
    })
	.catch(err => res.status(400).json('incorrect username/password'))    
}); 

app.post('/register', (req, res) => {
	const {email, name, password} = req.body;
	//.returning returns the database entry
	console.log('reqest body: ');
	console.log(req.body);
	const hash = bcrypt.hashSync(password, saltRounds);
	// must store hash in password DB.
	
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
			.returning('*')
			.insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
			})
			.then(user => {
			//a single element array of the new user is returned
			res.json(user[0]); 
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('unable to join'));
})

// Choose the port and start the server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Mixing it up on port ${PORT}`)
})