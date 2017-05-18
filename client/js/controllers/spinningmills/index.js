app.controller('spinningMillsController',['$scope','$db',function($scope, $db){
	
	var TYPE="spinningMill";
	var OPERATION_ADD=1;
	var OPERATION_EDIT=2;
	
	$scope.editItem=null;
	
	show();
	$db.changes({
		since: 'now',
		live: true
	}).on('change', show);
	
	$scope.add=function(){
		$scope.operationType=OPERATION_ADD;
		$scope.editItem={};
		$("#editModal").modal('show');
	}
	$scope.edit=function(item){
		$scope.operationType=OPERATION_EDIT;
		$db.get(item.doc._id, function(err, result){
			$scope.editItem=result;
			$scope.$digest();
			$("#editModal").modal('show');
		});
	}
	$scope.addOrUpdate=function(){
		if($scope.operationType === OPERATION_ADD){
			create();
		}else if($scope.operationType === OPERATION_EDIT){
			update();
		}
	}
	
	function create(){
		$scope.editItem.createdAt=new Date().toISOString();
		$scope.editItem.updatedAt=$scope.editItem.createdAt;
		$scope.editItem.type=TYPE;
		$db.post($scope.editItem, function(err, result){
			$scope.editItem = null;
			$("#editModal").modal('hide');
		});
	}
	function update(){
		$scope.editItem.updatedAt=new Date().toISOString();
		$db.put($scope.editItem, function(err, result){
			$scope.editItem = null;
			$("#editModal").modal('hide');
		});
	}
	function show() {
		$("#loading").show();
		$('#content').hide();
		$db.query(function (doc, emit) {
			if(doc.type===TYPE){
				emit(doc.createdAt);
			}
		}, {include_docs:true, descending: true}).then(function (doc) {
			
			if($.fn.DataTable.isDataTable('#content') ) {
				$('#content').DataTable().destroy();
			}
			
			$scope.items = doc.rows;
			$scope.$digest();
			$("#loading").hide();
			$('#content').show();
			$('#content').DataTable({"ordering": false});
		}).catch(function (err) {});
	}
}]);