'use strict'

padpanelControllers = angular.module 'padpanelControllers', []

padpanelControllers.controller 'RepoListCtrl', [ '$scope', '$location', 'Repo', ($scope, $location, Repo) ->
    {repo} = $location.search()

    if repo
      $scope.selectedRepo = repo
    else
      repo = 'local'

    Repo.get (info) ->
      $scope.repos = info.repos

    $scope.selectedRepo = repo

    $scope.searchText = ''
    
    $scope.changeRepo = (item) ->
      $scope.selectedRepo = item
      $location.search({repo:item})
  ]

padpanelControllers.controller 'PackageDetailCtrl', [ '$scope', '$location', '$routeParams', ($scope, $location, $routeParams) ->
    {repo} = $location.search()
    if repo
      $scope.selectedRepo = repo
    else
      repo = 'local'

    {id} = $routeParams

    $.get '/panel/package/' + id
      .success (data) ->
        $scope.$apply () ->
          $scope.tangible = data
        console.log $scope.tangible  
      .error (err) ->
        console.log err
    
    $scope.changeRepo = (item) ->
      $scope.selectedRepo = item
      $location.search({repo:item})
  ]

padpanelControllers.controller 'PackageListCtrl', [ '$scope', '$location', 'Package', ($scope, $location, Package) ->
    {repo} = $location.search()
    {filter} = $location.search()

    if !repo
      repo = 'local'

    if filter
      $scope.searchText = filter
    else
      $scope.searchText = ''

    $scope.selectedRepo = repo
    $scope.packages = Package.query({repo: repo})
  ]

padpanelControllers.controller 'ShareCtrl', [ '$scope', '$location', 'Package', 'RepositoryInfo', ($scope, $location, Package, RepositoryInfo) ->
    {repo} = $location.search()
    if !repo
      repo = 'local'
    RepositoryInfo
      .getAddress repo
      .then (ad) ->
        $scope.address = ad
  ]

padpanelControllers.controller 'RepositoryAddCtrl', [ '$scope', '$location', 'Package', 'RepositoryInfo', ($scope, $location, Package, RepositoryInfo) ->
    {repo} = $location.search()
    if !repo
      repo = 'local'
    $scope.packages = []
    $scope.selectedRepo = repo
    $scope.readingQr = false
    $scope.epmUri = ''
    $scope.isScanning = true
    $scope.isFinding = false
    $scope.loadingMessage = 'Buscando paquetes, espere por favor ...'
    $scope.hasFinded = false

    $scope.packagesLocal = []

    $scope.find = (uri) ->
      $scope.isScanning = false
      $scope.isFinding = true
      url = "#{uri}?expand=content"
      $.getJSON "/request?uri=#{url}"
        .done (data) ->
          $.getJSON "/package?repo=#{repo}"
            .done (local) ->
              $scope.packagesLocal = local
              pkgs = _.map data, (p) ->
                uid: p.uid
                title: p.content.title
                content: p.content.content
                img: "/request?uri=" + encodeURIComponent "#{uri}?uid=#{p.uid}&asset=front"
                hasLocal: _.any local, (l) ->
                  # check the build
                  console.log exp: "#{l.uid} == #{p.uid} ", value: l.uid == p.uid
                  l.uid == p.uid
              $scope.$apply () ->
                $scope.packages = pkgs
                $scope.isFinding = false
                $scope.hasFinded = true
    # qr
    $('#reader').html5_qrcode(
      (data) ->
        $scope.$apply () ->
          $scope.epmUri = data
          $('#reader').attr('data-qr-remove', '');
          $scope.find data
      (error) ->
        console.debug error
      (videoError) ->
        console.debug videoError
     )

  ]

padpanelControllers.controller 'PackageAddCtrl', [ '$scope', '$location', 'Package', 'RepositoryInfo', ($scope, $location, Package, RepositoryInfo) ->
    $scope.package = 
      title: ''

    Dropzone.options.myDropzone = init: ->
      self = this
      # config
      self.options.addRemoveLinks = true
      self.options.dictRemoveFile = 'Delete'
      # load already saved files
      $.get '/upload', (data) ->
        files = JSON.parse(data).files
        i = 0
        while i < files.length
          mockFile = 
            name: files[i].name
            size: files[i].size
            type: 'image/jpeg'
          self.options.addedfile.call self, mockFile
          self.options.thumbnail.call self, mockFile, files[i].url
          i++
        return
      # bind events
      #New file added
      self.on 'addedfile', (file) ->
        console.log 'new file added ', file
        return
      # Send file starts
      self.on 'sending', (file) ->
        console.log 'upload started', file
        $('.meter').show()
        return
      # File upload Progress
      self.on 'totaluploadprogress', (progress) ->
        console.log 'progress ', progress
        $('.roller').width progress + '%'
        return
      self.on 'queuecomplete', (progress) ->
        $('.meter').delay(999).slideUp 999
        return
      # On removing file
      self.on 'removedfile', (file) ->
        console.log file
        $.ajax
          url: '/uploaded/files/' + file.name
          type: 'DELETE'
          success: (result) ->
            console.log result
            return
        return
      return
      
    $('document').ready () ->
      $(".dropzone").dropzone()


  ]
  