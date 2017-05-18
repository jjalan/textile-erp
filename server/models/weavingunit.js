var mongoose 	= require('mongoose'),
	Schema 		= mongoose.Schema;

var weavingUnitSchema = mongoose.Schema({
	name: {type: String, required: true},
	address: {type: String},
	phone: {type: String},
	email: {type: String, required: true},
	manager : { type: Schema.Types.ObjectId, ref: 'Staff', required:true }
}, {
	timestamps: true
});

module.exports = mongoose.model('WeavingUnit', weavingUnitSchema);