/**
 * 平台登录模块
 */
define(['app', 'layer', 'jquery', 'css!./login.css'], function (app, layer, $) {
    return ['$rootScope', '$scope', '$location', 'userService', '$AjaxService',
        function ($rootScope, $scope, $location, userService, $AjaxService) {
            $('body').addClass('login-refactor');

            $scope.user = $scope.user || {};
            $scope.showPass = false;
            $scope.loginBtnDisable = false;

            $scope.togglePassword = function () {
                $scope.showPass = !$scope.showPass;
            };

            $scope.wechatLogin = function () {
                layer.msg('微信登录暂未开放，请使用账号密码登录');
            };

            // 登录操作
            $scope.login = function () {
                $scope.loginBtnDisable = true;

                if (!$scope.user.name || !$scope.user.pass) {
                    layer.msg('请输入账号和密码');
                    $scope.loginBtnDisable = false;
                    return;
                }

                var params = {
                    username: $scope.user.name,
                    password: $scope.user.pass,
                    grant_type: 'password'
                };

                // 表单验证
                faceinner.post(api['user.token'], params, function (res) {
                    if (res.access_token) {
                        localStorage.tokenInfo = JSON.stringify(res);
                        localStorage.token = res.access_token;
                        localStorage.tokenExpires = res.expires_in; // 有效期，单位：秒
                        localStorage.tokenTime = new Date().getTime(); // 当前时间

                        // 加载用户登录信息
                        faceinner.get(api['user.login.info'], function (infoRes) {
                            if (infoRes.code === 'S00') {
                                $scope.$apply(function () {
                                    $rootScope.user = infoRes.data;
                                    $rootScope.islogin = true;
                                    $location.path('/index').replace();
                                    $scope.loginBtnDisable = false;
                                });
                            } else {
                                $scope.$apply(function () {
                                    $scope.loginBtnDisable = false;
                                });
                            }
                        });
                    } else {
                        layer.msg(res.msg || '登录失败，请稍后重试');
                        $scope.$apply(function () {
                            $scope.loginBtnDisable = false;
                        });
                    }
                });
            };

            $scope.$on('$destroy', function () {
                $('body').removeClass('login-refactor');
            });
        }];
});
