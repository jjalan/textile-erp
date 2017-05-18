var Agent=require('../../models/agent');

module.exports.list=function(req, res){
	Agent.find({}).sort('-createdAt').exec(function(err, agents){
		if (err) { return next(err); }
		res.json(agents);
	});
}

module.exports.create=function(req, res){
	var agent = new Agent(req.body);
	agent.save(function(err, agent){
		if (err) { return next(err); }
		res.json(agent);
	});
}