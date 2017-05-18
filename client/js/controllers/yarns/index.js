app.controller('yarnsController',['$scope','$db',function($scope, $db){
	
	var TYPE="yarn";
	var OPERATION_ADD=1;
	var OPERATION_EDIT=2;
	
	$scope.editItem=null;
	
	show();
	initSpinningMills();
	
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
		$db.get(item.doc._id, function(err, yarn){
			$db.get(yarn.spinningMillId, function(err, spinningMill){
				$scope.editItem=yarn;
				$scope.editItem.spinningMill=spinningMill;
				$scope.$digest();
				$("#editModal").modal('show');
			})
			
		});
	}
	$scope.addOrUpdate=function(){
		if(!$scope.editItem.spinningMillId){
			alert('Please select a valid spinning mill from drop down');
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
				emit(doc.createdAt,{_id:doc.spinningMillId, yarn:doc});
			}
		}, {include_docs:true, descending: true}).then(function (doc) {
			
			if($.fn.DataTable.isDataTable('#content')) {
				$('#content').DataTable().destroy();
			}
			
			var yarns =[];
			for(var i=0;i<doc.rows.length;i++){
				var yarn={};
				yarn.doc = doc.rows[i].value.yarn;
				yarn.doc.spinningMill=doc.rows[i].doc;
				yarns.push(yarn);
			}
			
			$scope.items = yarns;
			$scope.$digest();
			
			$("#loading").hide();
			$('#content').show();
			
			$('#content').DataTable({"ordering": false});
		}).catch(function (err) {});
	}
	function initSpinningMills(){
		$db.query(function (doc, emit) {
			emit(doc.type);
		}, {key: "spinningMill", include_docs : true, descending: true}).then(function (doc) {
			
			var spinningMills = doc.rows;
			$('.typeahead').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'spinningMills',
				displayKey: function(spinningMill) {
					return spinningMill.doc.company;
				},
				source: function findMatches(query, process) {
					var matches, substringRegex;
					matches = [];
					substrRegex = new RegExp(query, 'i');
					$.each(spinningMills, function(i, spinningMill) {
						var name = spinningMill.doc.company;
						if (substrRegex.test(name)) {
							matches.push(spinningMill);
						}
					});

					process(matches);
				},
				templates: {
					suggestion: function(data){
						return "<div class='spinning-mill-select'><span class='spinning-mill-select-name'>"+data.doc.company+"</span></div>";
					}
				}
			});
			
			$('.typeahead').bind('typeahead:select', function(ev, suggestion) {
				$scope.editItem.spinningMillId=suggestion.doc._id;
				$scope.$digest();
			});
			
			$('.typeahead').keydown(function() {
				$scope.editItem.spinningMillId='';
				$scope.$digest();
			});
			
		}).catch(function (err) {});
	}
}]);