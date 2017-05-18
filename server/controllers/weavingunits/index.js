var WeavingUnit=require('../../models/weavingunit');

module.exports.list=function(req, res){
	WeavingUnit.find({}).sort('-createdAt').exec(function(err, weavingUnit){
		if (err) { return next(err); }
		res.json(weavingUnit);
	});
}

module.exports.create=function(req, res, next){
	var weavingUnit = new WeavingUnit(req.body);
	weavingUnit.save(function(err, weavingUnit){
		if (err) { return next(err); }
		res.json(weavingUnit);
	});
}