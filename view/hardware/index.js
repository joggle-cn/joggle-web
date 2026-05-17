/**
 * 硬件设备模块
 */
define(['app', 'jquery', 'css!../home/index.css', 'css!./index.css'], function (app, $) {
    var callback = ['$scope', function ($scope) {
        $('body').addClass('home-refactor hardware-refactor');

        faceinner.get(api['user.login.info'], function (res) {
            if (res.code === '040006') {
                if (localStorage.token) {
                    window.location.href = '#/login';
                }
                return;
            }

            if (res.code === 'S00') {
                if ($scope.$root.$$phase) {
                    $scope.islogin = true;
                    $scope.user = res.data || {};
                } else {
                    $scope.$apply(function () {
                        $scope.islogin = true;
                        $scope.user = res.data || {};
                    });
                }
            }
        });

        $scope.$on('$destroy', function () {
            $('body').removeClass('home-refactor hardware-refactor');
        });
    }];

    return callback;
});
