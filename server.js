var express 	= require('express'),
	app 		= express(),
	controllers = require('./server/controllers'),
	bodyParser = require('body-parser'),
	mongoose 	= require('mongoose');

mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/textile-erp');

app.use(bodyParser());
app.use('/js', express.static(__dirname + '/client/js'));
app.use('/css', express.static(__dirname + '/client/css'));
app.use('/bower_components', express.static(__dirname + '/client/bower_components'));
app.set('views', __dirname+'/client/views');
app.set('view engine', 'ejs')

app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);
/*
app.get('/saileela.appcache', function(req, res){
	res.type("text/cache-manifest");
	res.sendFile(__dirname + '/client/saileela.appcache');
});*/
app.get('/dashboard', function(req, res){
	renderView(res, "dashboard", "Dashboard");
});
app.get('/orders', function(req, res){
	renderView(res, "orders", "Orders");
});
app.get('/weavingunits', function(req, res){
	renderView(res, "weavingunits", "Weaving Units");
});
app.get('/customers', function(req, res){
	renderView(res, "customers", "Customers");
});
app.get('/spinningmills', function(req, res){
	renderView(res, "spinningmills", "Spinning Mills");
});
app.get('/yarns', function(req, res){
	renderView(res, "yarns", "Yarns");
});
app.get('/agents', function(req, res){
	renderView(res, "agents", "Agents");
});
app.get('/staffs', function(req, res){
	renderView(res, "staffs", "Staffs");
});
app.get('/settings', function(req, res){
	renderView(res, "settings", "Settings");
});
app.get('/login', function(req, res){
	renderView(res, "login", "Login");
});

app.get('/api/weavingunits', controllers.weavingunits.list);
app.post('/api/weavingunits', controllers.weavingunits.create);

app.get('/api/customers', controllers.customers.list);
app.post('/api/customers', controllers.customers.create);

app.get('/api/agents', controllers.agents.list);
app.post('/api/agents', controllers.agents.create);

app.get('/api/staffs', controllers.staffs.list);
app.post('/api/staffs', controllers.staffs.create);

app.listen(3000, function(){
	console.log("Server started ...");
});

function renderView(res, viewName, pageName){
	var pageTitle = "Saileela | " + pageName + " - Leading manufacturer of suiting fabrics in India";
	res.render(viewName, {pageTitle:pageTitle});
}

function logErrors (err, req, res, next) {
	console.error(err.stack);
	next(err);
}

function clientErrorHandler (err, req, res, next) {
	if (req.xhr) {
		res.status(500).send({ error: 'Something failed!' });
	} else {
		next(err);
	}
}

function errorHandler (err, req, res, next) {
	if (res.headersSent) {
		return next(err);
	}
	  
	res.status(500);
	res.render('error', { error: err });
}