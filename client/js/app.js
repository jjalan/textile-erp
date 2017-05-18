var app = angular.module('saileela',[]);
app.factory('$db', [function () {
	
	var db = new PouchDB('saileela', {adapter: 'websql'});
	if (!db.adapter) { // websql not supported by this browser
	  db = new PouchDB('saileela');
	}
	
	var remoteCouch = 'http://127.0.0.1:5984/saileela';
	db.sync(new PouchDB(remoteCouch), {
	  live: true,
	  retry: true
	}).on('change', function (change) {
	  // yo, something changed!
	}).on('paused', function (info) {
	  // replication was paused, usually because of a lost connection
	}).on('active', function (info) {
	  // replication was resumed
	}).on('error', function (err) {
	  // totally unhandled error (shouldn't happen)
	});
	
	return db;
}]);  

app.filter('displayDate', function() {
  return function(date) {
	  return moment(date).fromNow();
  }
});

app.filter('operationStr', function() {
  return function(operation) {
	  if(operation === 1){
		  return "Add";
	  }else if(operation === 2){
	  	return "Update";
	  }
  }
});