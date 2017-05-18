var mongoose = require('mongoose');

var staffSchema = mongoose.Schema({
	firstName: {type: String, required: true},
	lastName: {type: String},
	title: {type: String},
	phone: {type: String, required: true},
	email: {type: String}
}, {
	timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema);