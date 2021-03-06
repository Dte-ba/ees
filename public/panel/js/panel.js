(function() {
  'use strict';
  var padpanelApp;

  padpanelApp = angular.module('panelApp', ['ngRoute', 'padpanelFactory', 'padpanelDirective', 'padpanelControllers', 'padpanelServices', 'xeditable']);

  padpanelApp.config([
    '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
      $locationProvider.html5Mode(false);
      return $routeProvider.when('/packages/:reponame?', {
        templateUrl: '/panel/partials/package-list.html',
        controller: 'PackageListCtrl'
      }).when('/package/view/:id', {
        templateUrl: '/panel/partials/package-detail.html',
        controller: 'PackageDetailCtrl'
      }).when('/share', {
        templateUrl: '/panel/partials/share.html',
        controller: 'ShareCtrl'
      }).when('/repository/add', {
        templateUrl: '/panel/partials/repository-add.html',
        controller: 'RepositoryAddCtrl'
      }).when('/package/add', {
        templateUrl: '/panel/partials/package-add.html',
        controller: 'PackageAddCtrl'
      }).otherwise({
        redirectTo: '/packages'
      });
    }
  ]);

  padpanelApp.run(function(editableOptions) {
    return editableOptions.theme = 'bs3';
  });

}).call(this);

(function() {
  'use strict';
  var padpanelDirective;

  padpanelDirective = angular.module('padpanelDirective', []);

  padpanelDirective.directive('qr', function($parse) {
    return {
      restrict: "EA",
      replace: true,
      link: function(scope, element, attrs) {
        return scope.$watch(attrs.qr, function(newValue, oldValue) {
          if (!newValue) {
            return;
          }
          return element.qrcode({
            "width": 100,
            "height": 100,
            "text": newValue
          });
        });
      }
    };
  });

}).call(this);

(function() {
  'use strict';
  var padpanelFactory;

  padpanelFactory = angular.module('padpanelFactory', []);

  padpanelFactory.factory('RepositoryInfo', function($q) {
    var getAddress;
    getAddress = function(reponame) {
      var def;
      def = $q.defer();
      $.getJSON('/panel/ipaddress', function(data) {
        var a;
        a = "http://" + data.ipaddress + ":" + data.port + "/" + reponame + ".epm";
        return def.resolve(a);
      });
      return def.promise;
    };
    return {
      getAddress: getAddress
    };
  });

}).call(this);

(function() {
  'use strict';
  var padpanelControllers;

  padpanelControllers = angular.module('padpanelControllers', []);

  padpanelControllers.controller('RepoListCtrl', [
    '$scope', '$location', 'Repo', function($scope, $location, Repo) {
      var repo;
      repo = $location.search().repo;
      if (repo) {
        $scope.selectedRepo = repo;
      } else {
        repo = 'local';
      }
      Repo.get(function(info) {
        return $scope.repos = info.repos;
      });
      $scope.selectedRepo = repo;
      $scope.searchText = '';
      return $scope.changeRepo = function(item) {
        $scope.selectedRepo = item;
        return $location.search({
          repo: item
        });
      };
    }
  ]);

  padpanelControllers.controller('PackageDetailCtrl', [
    '$scope', '$location', '$routeParams', function($scope, $location, $routeParams) {
      var id, repo;
      repo = $location.search().repo;
      if (repo) {
        $scope.selectedRepo = repo;
      } else {
        repo = 'local';
      }
      id = $routeParams.id;
      $.get('/panel/package/' + id).success(function(data) {
        $scope.$apply(function() {
          return $scope.tangible = data;
        });
        return console.log($scope.tangible);
      }).error(function(err) {
        return console.log(err);
      });
      return $scope.changeRepo = function(item) {
        $scope.selectedRepo = item;
        return $location.search({
          repo: item
        });
      };
    }
  ]);

  padpanelControllers.controller('PackageListCtrl', [
    '$scope', '$location', 'Package', function($scope, $location, Package) {
      var filter, repo;
      repo = $location.search().repo;
      filter = $location.search().filter;
      if (!repo) {
        repo = 'local';
      }
      if (filter) {
        $scope.searchText = filter;
      } else {
        $scope.searchText = '';
      }
      $scope.selectedRepo = repo;
      return $scope.packages = Package.query({
        repo: repo
      });
    }
  ]);

  padpanelControllers.controller('ShareCtrl', [
    '$scope', '$location', 'Package', 'RepositoryInfo', function($scope, $location, Package, RepositoryInfo) {
      var repo;
      repo = $location.search().repo;
      if (!repo) {
        repo = 'local';
      }
      return RepositoryInfo.getAddress(repo).then(function(ad) {
        return $scope.address = ad;
      });
    }
  ]);

  padpanelControllers.controller('RepositoryAddCtrl', [
    '$scope', '$location', 'Package', 'RepositoryInfo', function($scope, $location, Package, RepositoryInfo) {
      var repo;
      repo = $location.search().repo;
      if (!repo) {
        repo = 'local';
      }
      $scope.packages = [];
      $scope.selectedRepo = repo;
      $scope.readingQr = false;
      $scope.epmUri = '';
      $scope.isScanning = true;
      $scope.isFinding = false;
      $scope.loadingMessage = 'Buscando paquetes, espere por favor ...';
      $scope.hasFinded = false;
      $scope.packagesLocal = [];
      $scope.find = function(uri) {
        var url;
        $scope.isScanning = false;
        $scope.isFinding = true;
        url = uri + "?expand=content";
        return $.getJSON("/request?uri=" + url).done(function(data) {
          return $.getJSON("/package?repo=" + repo).done(function(local) {
            var pkgs;
            $scope.packagesLocal = local;
            pkgs = _.map(data, function(p) {
              return {
                uid: p.uid,
                title: p.content.title,
                content: p.content.content,
                img: "/request?uri=" + encodeURIComponent(uri + "?uid=" + p.uid + "&asset=front"),
                hasLocal: _.any(local, function(l) {
                  console.log({
                    exp: l.uid + " == " + p.uid + " ",
                    value: l.uid === p.uid
                  });
                  return l.uid === p.uid;
                })
              };
            });
            return $scope.$apply(function() {
              $scope.packages = pkgs;
              $scope.isFinding = false;
              return $scope.hasFinded = true;
            });
          });
        });
      };
      return $('#reader').html5_qrcode(function(data) {
        return $scope.$apply(function() {
          $scope.epmUri = data;
          $('#reader').attr('data-qr-remove', '');
          return $scope.find(data);
        });
      }, function(error) {
        return console.debug(error);
      }, function(videoError) {
        return console.debug(videoError);
      });
    }
  ]);

  padpanelControllers.controller('PackageAddCtrl', [
    '$scope', '$location', 'Package', 'RepositoryInfo', function($scope, $location, Package, RepositoryInfo) {
      $scope["package"] = {
        title: ''
      };
      Dropzone.options.myDropzone = {
        init: function() {
          var self;
          self = this;
          self.options.addRemoveLinks = true;
          self.options.dictRemoveFile = 'Delete';
          $.get('/upload', function(data) {
            var files, i, mockFile;
            files = JSON.parse(data).files;
            i = 0;
            while (i < files.length) {
              mockFile = {
                name: files[i].name,
                size: files[i].size,
                type: 'image/jpeg'
              };
              self.options.addedfile.call(self, mockFile);
              self.options.thumbnail.call(self, mockFile, files[i].url);
              i++;
            }
          });
          self.on('addedfile', function(file) {
            console.log('new file added ', file);
          });
          self.on('sending', function(file) {
            console.log('upload started', file);
            $('.meter').show();
          });
          self.on('totaluploadprogress', function(progress) {
            console.log('progress ', progress);
            $('.roller').width(progress + '%');
          });
          self.on('queuecomplete', function(progress) {
            $('.meter').delay(999).slideUp(999);
          });
          self.on('removedfile', function(file) {
            console.log(file);
            $.ajax({
              url: '/uploaded/files/' + file.name,
              type: 'DELETE',
              success: function(result) {
                console.log(result);
              }
            });
          });
        }
      };
      return $('document').ready(function() {
        return $(".dropzone").dropzone();
      });
    }
  ]);

}).call(this);

(function() {
  'use strict';
  var padpanelServices;

  padpanelServices = angular.module('padpanelServices', ['ngResource']);

  padpanelServices.factory('Repo', [
    '$resource', function($resource) {
      return $resource('/repository', {});
    }
  ]);

  padpanelServices.factory('Package', [
    '$resource', function($resource) {
      return $resource('/package', {}, {
        query: {
          method: 'GET',
          isArray: true,
          params: {
            repo: '@repo'
          }
        }
      });
    }
  ]);

  padpanelServices.factory('Tangible', [
    '$resource', function($resource) {
      return $resource('/panel/package/:uid', {}, {
        query: {
          method: 'GET',
          isArray: false,
          params: {
            repo: '@repo'
          }
        }
      });
    }
  ]);

}).call(this);
