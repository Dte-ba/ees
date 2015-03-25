'use strict'

padpanelServices = angular.module 'padpanelServices', ['ngResource']

padpanelServices.factory 'Repo', [ '$resource', ($resource) ->
    $resource '/repository', {}
  ]

padpanelServices.factory 'Package', [ '$resource', ($resource) ->
    $resource '/package', { },
      query: method:'GET', isArray: true, params: repo: '@repo'
  ]

padpanelServices.factory 'Tangible', [ '$resource', ($resource) ->
    $resource '/panel/package/:uid', { },
      query: method:'GET', isArray: false, params: repo: '@repo'
  ]