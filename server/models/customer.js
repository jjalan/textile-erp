var mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
	firstName: {type: String, required: true},
	lastName: {type: String},
	address: {type: String},
	phone: {type: String, required: true},
	email: {type: String}
}, {
	timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);