app.controller('weavingUnitsController',['$scope','$db',function($scope, $db){
	
	var TYPE="weavingUnit";
	var OPERATION_ADD=1;
	var OPERATION_EDIT=2;
	
	$scope.editItem=null;
	
	show();
	initUnitManagers();
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
		$db.get(item.doc._id, function(err, weavingUnit){
			$db.get(weavingUnit.unitManagerId, function(err, unitManager){
				$scope.editItem=weavingUnit;
				$scope.editItem.unitManager=unitManager;
				$scope.$digest();
				$("#editModal").modal('show');
			})
			
		});
	}
	$scope.addOrUpdate=function(){
		if(!$scope.editItem.unitManagerId){
			alert('Please select a valid unit manager from drop down');
			return;
		}
		
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
		$db.query(function (doc, emit) {
			if(doc.type===TYPE){
				emit(doc.createdAt,{_id:doc.unitManagerId, weavingUnit:doc});
			}
		}, {include_docs:true, descending: true}).then(function (doc) {
			
			if($.fn.DataTable.isDataTable('#content')) {
				$('#content').DataTable().destroy();
			}
			
			var weavingUnits =[];
			for(var i=0;i<doc.rows.length;i++){
				var weavingUnit={};
				weavingUnit.doc = doc.rows[i].value.weavingUnit;
				weavingUnit.doc.unitManager=doc.rows[i].doc;
				weavingUnits.push(weavingUnit);
			}
			
			$scope.items = weavingUnits;
			$scope.$digest();
			$("#loading").hide();
			$('#content').show();
			
			$('#content').DataTable({"ordering": false});
		}).catch(function (err) {});
	}
	function initUnitManagers(){
		$db.query(function (doc, emit) {
			emit(doc.type);
		}, {key: "staff", include_docs : true, descending: true}).then(function (doc) {
			
			var unitManagers = doc.rows;
			$('.typeahead').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'unitManagers',
				displayKey: function(unitManager) {
					return unitManager.doc.firstName + " " + unitManager.doc.lastName;
				},
				source: function findMatches(query, process) {
					var matches, substringRegex;
					matches = [];
					substrRegex = new RegExp(query, 'i');
					$.each(unitManagers, function(i, unitManager) {
						var name = unitManager.doc.firstName +" "+unitManager.doc.lastName;
						if (substrRegex.test(name)) {
							matches.push(unitManager);
						}
					});

					process(matches);
				},
				templates: {
					suggestion: function(data){
						return "<div class='unit-manager-select'><span class='unit-manager-select-name'>"+data.doc.firstName+" "+data.doc.lastName+"</span> <span class='unit-manager-select-title'>"+data.doc.title+"</span></div>";
					}
				}
			});
			
			$('.typeahead').bind('typeahead:select', function(ev, suggestion) {
				$scope.editItem.unitManagerId=suggestion.doc._id;
				$scope.$digest();
			});
			
			$('.typeahead').keydown(function() {
				$scope.editItem.unitManagerId='';
				$scope.$digest();
			});
		}).catch(function (err) {});
	}
}]);