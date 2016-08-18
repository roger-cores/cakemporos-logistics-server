angular.module('galvanie')
  .controller('UserCtrl',[
    '$scope',
    '$http',
    '$localStorage',
    '$sessionStorage',
    '$mdToast',
    '$mdDialog',
    '$mdMedia',
    '$rootScope',
    '$location',
    '$window',
  function ($scope, $http, $localStorage, $sessionStorage, $mdToast, $mdDialog, $mdMedia, $rootScope, $location, $window) {

    $rootScope.$emit('LoginPageCalled', {isLogin: false});
    var orgId;
    $scope['bloodbankData'] = {};

    orgId = $localStorage.orgInfo._id;
    masterDataManager($scope, $http, '/api/login/org/'+orgId+'/bloodbank', 'bloodbankData');


    $scope.bloodbankData.init = function(){
      $scope.bloodbankData.masterData.copyAddress = true;
    }
    $scope.bloodbankData.init();

    $scope.login = {};


    


    $scope.bloodbankData.error = function(response){
      console.log(response);
      $mdToast.show(
        $mdToast.simple()
          .textContent('Something went wrong!')
          .position('left bottom')
          .hideDelay(3000)
      );
    }

    $scope.bloodbankData.preClear = function(next){
      angular.copy({}, $scope.login);
      $scope.cities = [];
      next(function(){
        $scope.bloodbankData.masterData.copyAddress = true;
      });
    }

    $scope.bloodbankData.preEdit = function(masterData, next){
      next(masterData, function(){
        $scope.refreshCities($scope.bloodbankData.masterData.address.state);
      });
    }


    $scope.bloodbankData.preAdd = function(bloodbank, next){
      $scope.bloodbankData.masterData.organization = orgId;
      if($scope.bloodbankData.masterData.copyAddress) $scope.bloodbankData.masterData.address = $localStorage.userInfo.address;
      if($scope.bloodbankData.masterData.loginActive){
        $scope.login.type = 'BLOODBANK';
        $scope.login.client_secret = 'r18sAsEsxR';
        $scope.login.client_id = 'efOeHY5Ovf';
        $http.post('/api/login/signup', $scope.login).success(function(usr){
          $scope.bloodbankData.masterData.login = usr._id;
          next();
        }).error($scope.bloodbankData.error);
      } else next();

    };

    $scope.bloodbankData.preUpdate = function(bloodbank, next){
      if($scope.bloodbankData.masterData.copyAddress) $scope.bloodbankData.masterData.address = $localStorage.userInfo.address;
      if($scope.bloodbankData.masterData.loginActive && $scope.bloodbankData.masterData.login == null){
        $scope.login.type = 'BLOODBANK';
        $scope.login.client_secret = 'r18sAsEsxR';
        $scope.login.client_id = 'efOeHY5Ovf';
        $http.post('/api/login/signup', $scope.login).success(function(usr){
          $scope.bloodbankData.masterData.login = usr._id;
          next();
        }).error($scope.bloodbankData.error);
      } else next();
    };

    $scope.bloodbankData.open = function(bloodBank){
      $window.location.href = '/org-home/bloodbank#/?bbId='+bloodBank._id;
    }













    $scope.repPasswordPattern = (function() {

      return {
          test: function(value) {

              return $scope.login.password === value;
          }
      };
    })();
    $scope.emailExists = false;
    $scope.emailPattern = (function() {
      var regex = /^.+@.+\..+$/;
      return {
          test: function(value) {
              if($scope.emailExists) {
                $scope.emailmsg = 'This email is already taken';
              }
              else {
                $scope.emailmsg = 'Please input a valid email address that ranges between 5 to 100 characters';
              }
              return regex.test(value) && !$scope.emailExists;
          }
      };
    })();
    $scope.emailmsg = 'Please input a valid email address that ranges between 5 to 100 characters';
    $scope.validateEmail = function(email){
      console.log(email);
      $http.get('/api/login/check-email/'+ email).success(function(response){
        if(!(response.result == null || response.result == undefined)) $scope.emailExists = response.result;
        console.log(response);
        console.log($scope.emailExists);

        $scope.account.email.$validate();
      }).error(function(response){
        console.log(response);
        $scope.account.email.$validate();
      })
    };

  }]);
