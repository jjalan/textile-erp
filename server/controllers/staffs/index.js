var Staff=require('../../models/staff');

module.exports.list=function(req, res){
	Staff.find({}).sort('-createdAt').exec(function(err, staffs){
		if (err) { return next(err); }
		res.json(staffs);
	});
}

module.exports.create=function(req, res){
	var staff = new Staff(req.body);
	staff.save(function(err, staff){
		if (err) { return next(err); }
		res.json(staff);
	});
}