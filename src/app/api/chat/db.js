const mysql = require('mysql');

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'challenge_db'
})

connection.connect(err =>{
	if(err){
		console.error('Error connecting to database: ' + err.stack);
		return;
	}
	console.log('Connection succesful')
})

module.exports = connection