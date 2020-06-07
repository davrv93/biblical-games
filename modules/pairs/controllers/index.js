var app = angular.module('myApp', ['ui.bootstrap']);
app.controller('myCtrl', function($scope, $uibModal, $document, $timeout, $q) {
  $scope.firstName= "John";
  $scope.lastName= "Doe";

  $scope.options ={
  	start:false,
  	score:0
  }


    $scope.disabled = function(){
        var i;
        for (i = 0; i < $scope.data.length; i++) {
          $scope.data[i].disabled=true;
        }

    };


    $scope.evaluateFlip = function(item){
       
      if(item.disabled==false){
        var i;
        for (i = 0; i < $scope.data.length; i++) {
            if($scope.data[i].order==item.order){
              $scope.data[i].isFlipped=!$scope.data[i].isFlipped;

            }
          }
      }
    }

  function shuffle(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
	};
  $scope.result = [];

  $scope.unflip = function(){
    var i;
      for (i = 0; i < $scope.data.length; i++) {
          $scope.data[i].isFlipped=false;
          $scope.data[i].disabled=false;
        }

  }

  $scope.eval = function(code){
      var result = null;
     var defered = $q.defer();
      var promise = defered.promise;

      
      result=$scope.result[0].code + $scope.result[1].code;

      if((result/2) == code){
          
        $scope.options.score +=100;       
        
          
          $scope.result[0].solved = true;
          $scope.result[1].solved = true;

          

        
          defered.resolve(true);

          $scope.unflip();



      }else{
        //error
          $scope.error= true;
          defered.resolve(false);
          
          $scope.unflip();

      }
      $scope.result = [];
      return promise;
  }

  $scope.add = function(item){
    var code = null;

    if(item.disabled==false){
        $scope.evaluateFlip(item)

      if($scope.result.indexOf(item) === -1) {
          $scope.result.push(item);
      }
      
      if($scope.result.length==2){

          $scope.disabled();
          $timeout( function(){ 
            
            $scope.eval(item.code).then(function(success){
                $scope.unflip();              
                //alert('Muy bien, la respuesta es correcta');
              },function(error){
                $scope.unflip();
                //alert('Intenta nuevamente, la respuesta es incorrecta');
              }
            );

          }, 1000);
          
        }
    } 
    


  };

  $scope.data = [
  	{
  		value:"David",
  		help:"",
  		code:1,
  		order:1,
  		isFlipped:false,
  		solved:false,
      disabled:false
  	},
  	{
  		value:"Amnón",
  		help:"",
  		code:1,
  		order:2,
  		isFlipped:false,
  		solved:false,
      disabled:false

  	},
  	{
  		value:"Noé",
  		help:"",
  		code:2,
  		order:3,
  		isFlipped:false,
  		solved:false,
      disabled:false

  	},
  	{
  		value:"Sem",
  		help:"",
  		code:2,
  		order:4,
  		isFlipped:false,
  		solved:false,
      disabled:false

  	},
  	{
  		value:"Jacob",
  		help:"",
  		code:3,
  		order:5,
  		isFlipped:false,
  		solved:false,
      disabled:false

  	},
  	{
  		value:"Rubén",
  		help:"",
  		code:3,
  		order:6,
  		isFlipped:false,
  		solved:false,
      disabled:false

  	}

  ];
  $scope.error=false;

  shuffle($scope.data);

  $scope.dataEval = [];


    $scope.openComponentModal = function () {
    	console.log('open');
    var modalInstance = $uibModal.open({
      animation: true,
      component: 'modalComponent',
      resolve: {
        items: function () {
          return [];
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $ctrl.selected = selectedItem;
    }, function () {
      //$log.info('modal-component dismissed at: ' + new Date());
    });
  };


  $scope.restart = function(){
	window.location.reload(false); 
  };

});

angular.module('myApp').controller('ModalInstanceCtrl', function ($uibModalInstance, items) {
  var $ctrl = this;
  $ctrl.items = items;
  $ctrl.selected = {
    item: $ctrl.items[0]
  };

  $ctrl.ok = function () {
    $uibModalInstance.close($ctrl.selected.item);
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('myApp').component('modalComponent', {
  templateUrl: 'myModalContent.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function () {
    var $ctrl = this;

    $ctrl.$onInit = function () {
      $ctrl.items = $ctrl.resolve.items;
      $ctrl.selected = {
        item: $ctrl.items[0]
      };
    };

    $ctrl.ok = function () {
      $ctrl.close({$value: $ctrl.selected.item});
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

app.controller('modalCtrl', function($scope, $uibModal) {
  $scope.firstName= "John";
  $scope.lastName= "Doe";

  $scope.options ={
  	start:false,
  	score:0
  }

 

  $scope.restart = function(){
	window.location.reload(false); 
  };

});