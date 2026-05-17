/**
 * 忘记密码模块
 */
define(['app', 'layer', 'jquery', 'css!../login/login.css', 'css!./app.css'], function (app, layer, $) {
    return ['$scope', '$location',
        function ($scope, $location) {
            $('body').addClass('login-refactor forget-refactor');

            $scope.user = {};
            $scope.showPass = false;
            $scope.showConfirmPass = false;
            $scope.resetSubmitting = false;
            $scope.changeSubmitting = false;

            var code = $location.search().code;
            if (code) {
                $scope.user.code = code;
                $scope.showChangePass = true;
            } else {
                $scope.showChangePass = false;
            }

            function applyScope(handler) {
                if ($scope.$root.$$phase) {
                    handler();
                    return;
                }
                $scope.$apply(handler);
            }

            $scope.togglePass = function () {
                $scope.showPass = !$scope.showPass;
            };

            $scope.toggleConfirmPass = function () {
                $scope.showConfirmPass = !$scope.showConfirmPass;
            };

            // 修改密码
            $scope.changePassword = function () {
                if (!$scope.user.pass) {
                    layer.msg('请输入新密码');
                    return;
                }

                if ($scope.user.pass !== $scope.user.confirmPass) {
                    layer.msg('两次密码不一致');
                    return;
                }

                $scope.changeSubmitting = true;

                faceinner.postJson(api['user.changepass'], {
                    code: $scope.user.code,
                    pass: $scope.user.pass
                }, function (res) {
                    applyScope(function () {
                        $scope.changeSubmitting = false;
                    });

                    if (res.status === 0 || res.code === 'S00') {
                        layer.msg('重置成功');
                        applyScope(function () {
                            $location.path('/login').replace();
                        });
                        return;
                    }

                    if (res.status === 100014 || res.code === '100014') {
                        layer.msg('重置链接已失效，请重新申请');
                        applyScope(function () {
                            $location.path('/forget').replace();
                        });
                        return;
                    }

                    faceinner.handleFieldError($scope, res);
                    layer.msg(res.msg || '修改失败，请稍后重试');
                });
            };

            // 提交忘记密码申请
            $scope.submitResetPass = function () {
                if (!$scope.email) {
                    layer.msg('请输入邮箱地址');
                    return;
                }

                $scope.resetSubmitting = true;

                var siteUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
                var data = {
                    email: $scope.email,
                    siteUrl: siteUrl
                };

                faceinner.postJson(api['user.forget'], data, function (res) {
                    applyScope(function () {
                        $scope.resetSubmitting = false;
                    });

                    if (res.status === 0 || res.code === 'S00') {
                        layer.msg('申请成功，请检查您的邮箱');
                        window.location.href = '#/login';
                        return;
                    }

                    faceinner.handleFieldError($scope, res);
                    layer.msg(res.msg || '提交失败，请稍后重试');
                });
            };

            $scope.$on('$destroy', function () {
                $('body').removeClass('login-refactor forget-refactor');
            });
        }];
});
