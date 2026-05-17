/**
 * 服务条款页面模块
 */
define(['app', 'jquery', 'css!../../home/index.css', 'css!./agreement.css'], function (app, $) {
    var callback = ['$scope', function ($scope) {
        $('body').addClass('home-refactor agreement-refactor');

        $scope.islogin = false;
        $scope.user = {};

        function applyScope(handler) {
            if ($scope.$root.$$phase) {
                handler();
                return;
            }
            $scope.$apply(handler);
        }

        faceinner.get(api['user.login.info'], function (res) {
            if (res.code === '040006' && localStorage.token) {
                window.location.href = '#/login';
                return;
            }

            if (res.code !== 'S00' || !res.data) {
                return;
            }

            applyScope(function () {
                $scope.islogin = true;
                $scope.user = res.data || {};
            });
        });

        $scope.$on('$destroy', function () {
            $('body').removeClass('home-refactor agreement-refactor');
        });
    }];

    return callback;
});
