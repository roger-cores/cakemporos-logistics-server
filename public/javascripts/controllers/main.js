angular.module('galvanie')
  .controller('LoginCtrl',[
    '$scope',
    '$http',
    '$localStorage',
    '$sessionStorage',
    '$mdToast',
    '$mdDialog',
    '$mdMedia',
    '$rootScope',
    '$window',
    function ($scope, $http, $localStorage, $sessionStorage, $mdToast, $mdDialog, $mdMedia, $rootScope, $window) {

    $scope.$storage = $localStorage;



    $scope.login = function(){
      $http.post('/api/user/oauth/token', {
        username: $scope.email,
        password: $scope.password,
        grant_type: "password",
        client_id: "efOeHY5Ovf",
        client_secret: "r18sAsEsxR"
      }).then(function(res){
        console.log(res);
        $localStorage.access_token = res.data.access_token;
        $localStorage.refresh_token = res.data.refresh_token;
        $http.post('/api/user/validate-token', {
          access_token: $localStorage.access_token,
          client_id: "efOeHY5Ovf",
          client_secret: "r18sAsEsxR"
        }).success(function(response){
          console.log(response);
          $window.location.href = '/admin/home';
        }).error(function(response){});

      }, function(err){
        $scope.showSimpleToast();
      });
    }




    $scope.showSimpleToast = function() {
      $mdToast.show(
        $mdToast.simple()
          .textContent('Authentication Failed!')
          .position("top right")
          .hideDelay(3000)
      );
    };

    $rootScope.$emit('LoginPageCalled', {isLogin: true});

  }]);
