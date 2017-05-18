var Customer=require('../../models/customer');

module.exports.list=function(req, res){
	Customer.find({}).sort('-createdAt').exec(function(err, customers){
		if (err) { return next(err); }
		res.json(customers);
	});
}

module.exports.create=function(req, res){
	var customer = new Customer(req.body);
	customer.save(function(err, customer){
		if (err) { return next(err); }
		res.json(customer);
	});
}