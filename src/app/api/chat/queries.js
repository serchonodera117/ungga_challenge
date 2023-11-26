const db = require('./db');

function insertMessage(data, callback) {
	console.log("data i've sent",data)

	db.query('INSERT INTO messages SET ?', data, (error, result) => {
		if(error) {return callback(error);}
		return callback(null, result)
	})
}

//  export {insertMessage}
module.exports = {
  insertMessage,
};