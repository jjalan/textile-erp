app.controller('ordersController',['$scope','$db',function($scope, $db){
	
	var TYPE="order";
	var OPERATION_ADD=1;
	var OPERATION_EDIT=2;
	
	$scope.editItem=null;
	
	show();
	initAgents();
	initCustomers();
	initWeavingUnits();
	initYarns();
	initFabricWidths();
	
	$db.changes({
		since: 'now',
		live: true
	}).on('change', show);
	
	$scope.parseFloat = function(value){
        return parseFloat(value);
    }
	
	$scope.add=function(){
		$scope.operationType=OPERATION_ADD;
		$scope.editItem={};
		$("#editModal").modal('show');
	}
	
	$scope.edit=function(item){
		$scope.operationType=OPERATION_EDIT;
		$db.get(item.doc._id, function(err, order){
			$db.get(order.agentId, function(err, agent){
				$db.get(order.customerId, function(err, customer){
					$db.get(order.weavingUnitId, function(err, weavingUnit){
						$db.get(order.warp.yarn.spinningMillId, function(err, warpSpinningMill){
							$db.get(order.weft.yarn.spinningMillId, function(err, weftSpinningMill){
								
								$scope.editItem=order;
								$scope.editItem.agent=agent;
								$scope.editItem.customer=customer;
								$scope.editItem.weavingUnit=weavingUnit;
								
								$scope.editItem.weft.yarn.spinningMill=weftSpinningMill;
								$scope.editItem.warp.yarn.spinningMill=warpSpinningMill;
								
								$scope.$digest();
								
								$("#fabricWidthInput").typeahead('val',$scope.editItem.fabricWidth.width);
								$("#warpYarnInput").typeahead('val', $scope.editItem.warp.yarn.name + ' '+ $scope.editItem.warp.yarn.spinningMill.company);
								$("#weftYarnInput").typeahead('val', $scope.editItem.weft.yarn.name + ' '+ $scope.editItem.weft.yarn.spinningMill.company);
								
								$("#editModal").modal('show');
							});
						});
					});
				});
			});
		});
	}
	
	$scope.addOrUpdate=function(){
		
		if(!$scope.editItem.fabricWidth){
			alert("Please select a valid fabric width from dropdown");
			return;
		}
		
		if(!$scope.editItem.warp){
			alert("Please select a valid yarp warn from dropdown");
			return;
		}
		
		if(!$scope.editItem.customerId){
			alert('Please select a valid customer from drop down');
			return;
		}
		
		if(!$scope.editItem.weavingUnitId){
			alert('Please select a valid weaving unit from drop down');
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
		$scope.editItem.state=1;
		$db.post($scope.editItem, function(err, result){
			$scope.editItem = null;
			$("#editModal").modal('hide');
		});
	}
	function update(){
		
		delete $scope.editItem.customer;
		delete $scope.editItem.agent;
		delete $scope.editItem.weavingUnit;
		delete $scope.editItem.warp.yarn.spinningMill;
		delete $scope.editItem.weft.yarn.spinningMill;
		
		console.log($scope.editItem.weft.weightInGms);
		
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
				emit(doc.createdAt, {_id:doc.agentId, order:doc});
				emit(doc.createdAt, {_id:doc.customerId, order:doc});
				emit(doc.createdAt, {_id:doc.weavingUnitId, order:doc});
			}
		}, {include_docs:true, descending: true}).then(function (doc) {
			var ordersHash=[];
			var orders = [];
			for(var i=0;i<doc.rows.length;i++){
				var customer = null;
				var agent = null;
				var weavingUnit = null;
				
				var objectId = doc.rows[i].doc._id;
				var objectType = doc.rows[i].doc.type;
				
				if(objectType==="customer"){
					customer = doc.rows[i].doc;
				}else if(objectType==="agent"){
					agent = doc.rows[i].doc;
				}else if(objectType==="weavingUnit"){
					weavingUnit = doc.rows[i].doc;
				}
				
				var order = {doc:{}};
				var orderId = doc.rows[i].value.order._id;
				if(ordersHash[orderId]){
					order = ordersHash[orderId];
				}else{
					order.doc = doc.rows[i].value.order;
					ordersHash[orderId] = order;
					orders.push(order);
				}
				
				if(customer){
					order.doc.customer = customer;
				}else if(agent){
					order.doc.agent = agent;
				}else if(weavingUnit){
					order.doc.weavingUnit = weavingUnit;
				}
			}
			
			if($.fn.DataTable.isDataTable('#content')) {
				$('#content').DataTable().destroy();
			}
			
			$scope.items = orders;
			$scope.$digest();
			
			$("#loading").hide();
			$('#content').show();
			$('#content').DataTable({"ordering": false});
			
		}).catch(function (err) {
			// handle any errors
		});
	}
	
	function initAgents(){
		$db.query(function (doc, emit) {
			emit(doc.type);
		}, {key: "agent", include_docs : true, descending: true}).then(function (doc) {
			
			var agents = doc.rows;
			$('#agentName').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'agents',
				displayKey: function(agent) {
					return agent.doc.company;
				},
				source: function findMatches(query, process) {
					var matches, substringRegex;
					matches = [];
					substrRegex = new RegExp(query, 'i');
					$.each(agents, function(i, agent) {
						var name = agent.doc.firstName +" "+agent.doc.lastName;
						var company = agent.doc.company;
						
						if (substrRegex.test(name) || substrRegex.test(company)) {
							matches.push(agent);
						}
					});

					process(matches);
				},
				templates: {
					suggestion: function(data){
						return "<div class='agent-select'><span class='agent-select-company'>"+data.doc.company+"</span><br/><span class='agent-select-name'>"+data.doc.firstName +" "+ data.doc.lastName+"</span></div>";
					}
				}
			});
			
			$('#agentName').bind('typeahead:select', function(ev, suggestion) {
				$scope.editItem.agentId=suggestion.doc._id;
				$scope.$digest();
			});
			
			$('#agentName').keydown(function() {
				$scope.editItem.agentId='';
				$scope.$digest();
			});
			
		}).catch(function (err) {
			// handle any errors
		});
	}
	function initCustomers(){
		$db.query(function (doc, emit) {
			emit(doc.type);
		}, {key: "customer", include_docs : true, descending: true}).then(function (doc) {
			
			var customers = doc.rows;
			$('#customerName').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'customers',
				displayKey: function(customer) {
					return customer.doc.company;
				},
				source: function findMatches(query, process) {
					var matches, substringRegex;
					matches = [];
					substrRegex = new RegExp(query, 'i');
					$.each(customers, function(i, customer) {
						var name = customer.doc.firstName +" "+customer.doc.lastName;
						var company = customer.doc.company;
						
						if (substrRegex.test(name) || substrRegex.test(company)) {
							matches.push(customer);
						}
					});

					process(matches);
				},
				templates: {
					suggestion: function(data){
						return "<div class='customer-select'><span class='customer-select-company'>"+data.doc.company+"</span><br/><span class='customer-select-name'>"+data.doc.firstName +" "+ data.doc.lastName+"</span></div>";
					}
				}
			});
			
			$('#customerName').bind('typeahead:select', function(ev, suggestion) {
				$scope.editItem.customerId=suggestion.doc._id;
				$scope.$digest();
			});
			
			$('#customerName').keydown(function() {
				$scope.editItem.customerId='';
				$scope.$digest();
			});
			
		}).catch(function (err) {});
	}
	function initYarns(){
		$db.query(function (doc, emit) {
			if(doc.type==="yarn"){
				emit(doc.createdAt,{_id:doc.spinningMillId, yarn:doc});
			}
		}, {include_docs:true, descending: true}).then(function (doc) {
			
			var yarns =[];
			for(var i=0;i<doc.rows.length;i++){
				var yarn={};
				yarn = doc.rows[i].value.yarn;
				yarn.spinningMill=doc.rows[i].doc;
				yarns.push(yarn);
			}
			
			$('#warpYarnNameInput').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'yarnNameInput',
				displayKey: function(yarn) {
					return yarn.name + ' ' + yarn.spinningMill.company;
				},
				source: function findMatches(query, process) {
					var matches, substringRegex;
					matches = [];
					substrRegex = new RegExp(query, 'i');
					$.each(yarns, function(i, yarn) {
						var name = yarn.name + " "+yarn.spinningMill.company;
						if (substrRegex.test(name)) {
							matches.push(yarn);
						}
					});

					process(matches);
				},
				templates: {
					suggestion: function(yarn){
						return "<div class='yarn-select'>"+yarn.name + " " +yarn.spinningMill.company+"</div>";
					}
				}
			});
			
			$('#weftYarnNameInput').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'yarnNameInput',
				displayKey: function(yarn) {
					return yarn.name + ' ' + yarn.spinningMill.company;
				},
				source: function findMatches(query, process) {
					var matches, substringRegex;
					matches = [];
					substrRegex = new RegExp(query, 'i');
					$.each(yarns, function(i, yarn) {
						var name = yarn.name + " "+yarn.spinningMill.company;
						if (substrRegex.test(name)) {
							matches.push(yarn);
						}
					});

					process(matches);
				},
				templates: {
					suggestion: function(yarn){
						return "<div class='yarn-select'>"+yarn.name + " " +yarn.spinningMill.company+"</div>";
					}
				}
			});
			
			$('#warpYarnNameInput').bind('typeahead:select', function(ev, suggestion) {
				if(!$scope.editItem.warp){
					$scope.editItem.warp={};
				}
				$scope.editItem.warp.yarn=suggestion;
				$scope.$digest();
				
			});
			$('#warpYarnNameInput').keydown(function() {
				if($scope.editItem.warp){
					delete $scope.editItem.warp.yarn;
				}
				
				$scope.$digest();
			});
			
			$('#weftYarnNameInput').bind('typeahead:select', function(ev, suggestion) {
				if(!$scope.editItem.weft){
					$scope.editItem.weft={};
				}
				
				$scope.editItem.weft.yarn=suggestion;
				$scope.$digest();
			});
			$('#weftYarnNameInput').keydown(function() {
				if($scope.editItem.weft){
					delete $scope.editItem.weft.yarn;
				}
				
				$scope.$digest();
			});
			
		}).catch(function (err) {});
	}
	function initWeavingUnits(){
		$db.query(function (doc, emit) {
			if(doc.type=="weavingUnit"){
				emit(doc.name);
			}
		}, {include_docs : true, ascending: true}).then(function (doc) {
			$scope.weavingUnits = doc.rows;
			$scope.$digest();
		}).catch(function (err) {});
	}
	function initFabricWidths(){
		
		var fabricWidths = [{width:56,shrinkage:7}, {width:58,shrinkage:7}];
		$('#fabricWidthInput').typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		},
		{
			name: 'fabricWidths',
			displayKey: function(fabricWidth) {
				return fabricWidth.width;
			},
			source: function findMatches(query, process) {
				var matches, substringRegex;
				matches = [];
				substrRegex = new RegExp(query, 'i');
				$.each(fabricWidths, function(i, fabricWidth) {
					if (substrRegex.test(fabricWidth.width.toString())) {
						matches.push(fabricWidth);
					}
				});

				process(matches);
			},
			templates: {
				suggestion: function(data){
					return "<div class='fabric-width-select'><span class='fabric-width-select-width'>"+data.width+"</span></div>";
				}
			}
		});
		
		$('#fabricWidthInput').bind('typeahead:select', function(ev, suggestion) {
			$scope.editItem.fabricWidth=suggestion;
			$scope.$digest();
		});
		$('#fabricWidthInput').keydown(function() {
			$scope.editItem.fabricWidth=null;
			$scope.$digest();
		});
	}
	
	$scope.$watch('editItem.fabricWidth.width', function(){
		setWarpWeight();
		setWeftWeight();
	});
	$scope.$watch('editItem.fabricWidth.shrinkage', function(){
		setWarpWeight();
		setWeftWeight();
	});
	$scope.$watch('editItem.warp.reed.dentsPerInch', function(){
		setWarpWeight();
	});
	$scope.$watch('editItem.warp.reed.yarnThreadsPerDent', function(){
		setWarpWeight();
	});
	$scope.$watch('editItem.warp.yarn.yarnCount', function(){
		setWarpWeight();
	});
	$scope.$watch('editItem.weft.pickCount', function(){
		setWeftWeight();
	});
	$scope.$watch('editItem.weft.yarn.yarnCount', function(){
		setWeftWeight();
	});
	
	function setWarpWeight(){
		var editItem=$scope.editItem;
		if(editItem && editItem.warp){
			editItem.warp.weightInGms=toDecimal((((((editItem.warp.reed.dentsPerInch/2)*(editItem.fabricWidth.width+editItem.fabricWidth.shrinkage))*editItem.warp.reed.yarnThreadsPerDent)*0.64)/editItem.warp.yarn.yarnCount));
		}
	}
	function setWeftWeight(){
		var editItem=$scope.editItem;
		if(editItem && editItem.warp){
			editItem.weft.weightInGms=toDecimal((editItem.weft.pickCount*(editItem.fabricWidth.width+editItem.fabricWidth.shrinkage)*0.6)/editItem.weft.yarn.yarnCount);
		}
	}
	function toDecimal(val){
		return parseFloat(Math.round(val * 100) / 100);
	}
}]);
