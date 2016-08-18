var masterDataManager = function($scope, $http, url, objectName){

  $scope[objectName].masterData = {};

  if($scope[objectName].init) $scope[objectName].init();

  $scope[objectName].edittingMode = false;

  $scope[objectName].refresh = function(){
    $http.get(url).success(function(response){
      $scope[objectName].masterDataList = response;
    }).error(function(response){
      $scope[objectName].error(response);
    });
  };

  var postAdd = function(){
    $http.post(url, $scope[objectName].masterData).success(function(response){
      $scope[objectName].refresh();
      $scope[objectName].clear();
    }).error(function(response){

      $scope[objectName].error(response);
    });
  };

  $scope[objectName].add = function(){
    if($scope[objectName].preAdd) $scope[objectName].preAdd($scope[objectName].masterData, postAdd);
    else postAdd();
  }

  $scope[objectName].remove = function(masterData){
    $http.delete(url + '/' + masterData._id).success(function(response){
      $scope[objectName].refresh();
    }).error(function(response){
      $scope[objectName].error(response);
    });
  }

  $scope[objectName].postEdit = function(masterData, next){
    angular.copy(masterData, $scope[objectName].masterData);
    $scope[objectName].edittingMode = true;
    if(next) next();
  }

  $scope[objectName].edit = function(masterData){
    if($scope[objectName].preEdit) $scope[objectName].preEdit(masterData, $scope[objectName].postEdit);
    else $scope[objectName].postEdit(masterData);
  }

  $scope[objectName].postUpdate = function(){
    $http.put(url + '/' + $scope[objectName].masterData._id, $scope[objectName].masterData).success(function(response){
      $scope[objectName].refresh();
      $scope[objectName].clear();
    }).error(function(response){
      $scope[objectName].error(response);
    });
  }

  $scope[objectName].update = function(){
    if($scope[objectName].preUpdate) $scope[objectName].preUpdate($scope[objectName].masterData, $scope[objectName].postUpdate);
    else $scope[objectName].postUpdate();

  }

  $scope[objectName].postClear = function(next){
    $scope[objectName].masterData = {};

    $scope[objectName].edittingMode = false;
    if(next) next();
  }

  $scope[objectName].clear = function(){
    if($scope[objectName].preClear) $scope[objectName].preClear($scope[objectName].postClear);
    else{
      $scope[objectName].postClear();
    }

  }

  $scope[objectName].refresh();

  return 0;
};


/* export Chess object for any RequireJS compatible environment */
if (typeof define !== 'undefined') define( function () { return masterDataManager;  });
