/**
 * 帮助中心页面模块
 */
define(['app', 'jquery', 'css!../home/index.css', 'css!./document.css'], function (app, $) {
    var callback = ['$scope', function ($scope) {
        $('body').addClass('home-refactor document-refactor');

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
            if (res.code === 'S00') {
                applyScope(function () {
                    $scope.islogin = true;
                    $scope.user = res.data || {};
                });
                return;
            }

            applyScope(function () {
                $scope.islogin = false;
                $scope.user = {};
            });
        });

        $scope.scrollTo = function (id, $event) {
            if ($event && $event.preventDefault) {
                $event.preventDefault();
            }

            var target = document.getElementById(id);
            if (!target) {
                return;
            }

            var top = Math.max(target.getBoundingClientRect().top + window.pageYOffset - 86, 0);
            $('html, body').stop().animate({scrollTop: top}, 240);
        };

        $scope.$on('$destroy', function () {
            $('body').removeClass('home-refactor document-refactor');
        });
    }];

    return callback;
});