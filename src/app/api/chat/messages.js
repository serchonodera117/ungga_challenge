const mysql = require('mysql');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json())
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: ''
})

db.connect(err =>{
	if(err){
		console.error('Error connecting to database: ' + err.stack);
		return;
	}
	console.log('Connection succesful')
})

app.listen(3001, () =>{
	console.log("Listening on http://localhost:3001")
})


app.post("/send_message", (req, res) =>{
	// const m = req.body
	console.log("reached api:", req.body)

	 const username = req.body.username;
	const userId = req.body.userId;
	const message = req.body.message;

	const sql = `INSERT INTO messages (username, user_id, message) VALUES (?, ?, ?)`;

	db.query(sql, [username, userId, message], (err, result) =>{
		if(err){
			res.send("error sending message: "+ " "+ req +" " + err);
			console.log('Error inserting message:', err);
		}else{
			res.send(200);
		}
	})
})

app.get("/receive_messages/:user_id", (req, res) =>{
	console.log("reached api:", req.params)
	const id_user = req.params.user_id;
	const sql = `SELECT * FROM messages WHERE  user_id = ${id_user}`;
	db.query(sql, (err, result)=>{
		if(err){
			res.send("error sending message: "+ " "+ req +" " + err);
			console.log('Error inserting message:', err);
		}else{
			res.send(result);
		}
	})
})
module.exports = db
// export const db = require('db')