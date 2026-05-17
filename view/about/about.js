/**
 * About 页面模块
 *
 * @author marker
 * @date 2016-06-05
 */
define(['app', 'jquery', 'css!../home/index.css', 'css!./about.css'], function (app, $) {
    var callback = ["$scope", function ($scope) {
        $('body').addClass('home-refactor about-refactor');

        faceinner.get(api['user.login.info'], function (res) {
            if (res.code === '040006' && localStorage.token) {
                window.location.href = '#/login';
            }
        });

        $scope.$on('$destroy', function () {
            $('body').removeClass('home-refactor about-refactor');
        });
    }];

    return callback;
});
