angular.module('galvanie')
  .controller('AuthCheckerCtrl',[
    '$scope',
    '$http',
    '$localStorage',
    '$sessionStorage',
    '$rootScope',
    '$window',
    function ($scope, $http, $localStorage, $sessionStorage, $rootScope, $window) {





    $scope.showLogin = true;
    $scope.showLogout = false;
    $scope.isLogin = false;

    $scope.logout = function(){
      angular.copy({}, $localStorage.userInfo);
      angular.copy({}, $localStorage.concreteUserInfo);
      angular.copy({}, $localStorage.orgInfo);
      $localStorage.access_token = '';
      $localStorage.refresh_token = '';
      $localStorage.userInfo = undefined;

      $window.location.href = '/login';
    }


    checkAuth = function(){




      var getByRefresh = function(){
        if($localStorage.refresh_token){
          $http.post('/api/user/oauth/token', {
            refresh_token: $localStorage.refresh_token,
            grant_type: "refresh_token",
            client_id: "efOeHY5Ovf",
            client_secret: "r18sAsEsxR"
          }).success(function(res){
            $localStorage.access_token = res.access_token;
            $scope.showLogin = false;
            $scope.showLogout = !$scope.showLogin;
            console.log('login success2');
          }).error(function(err){
            $scope.showLogin = true;
            $scope.showLogout = !$scope.showLogin;
            console.log('login failed');
            $scope.logout();
            if(!$scope.index) $window.location.href = '/';
            else {
              $rootScope.$emit('LoggedOut', {});
            }
          });
        } else {$scope.showLogin = true; $scope.showLogout = !$scope.showLogin;}
      }

      if($scope.isLogin) {
        $scope.showLogin = false;
        $scope.showLogout = !$scope.showLogin;
        return;
      }

      if($localStorage.access_token){
        $http.post('/api/user/validate-token', {
          access_token: $localStorage.access_token,
          client_id: "efOeHY5Ovf",
          client_secret: "r18sAsEsxR"
        }).success(function(res){
          $scope.showLogin = false;
          $scope.showLogout = !$scope.showLogin;
          console.log('login success');
        }).error(function(err){
          getByRefresh();
        });
      } else getByRefresh();



    }
    $scope.index = false;
    $rootScope.$on('LoginPageCalled', function(event, data){
      if(data.index) $scope.index = true;
      $scope.isLogin = data.isLogin;
      if(data.isLogin) {
        $scope.showLogin = false;
        $scope.showLogout = false;
      }
      if(!$scope.isLogin)
        checkAuth();
    });




  }]);
