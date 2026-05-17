'use strict';

/**
 * 注册账号模块
 */
define(['app', 'jquery', 'x18n', 'layer', 'css!./register.css'], function (app, $, x18n, layer) {

    return ['$scope', '$http', '$location', 'res', 'userService', '$routeParams',
        function ($scope, $http, $location, res, userService, $routeParams) {
            $('body').addClass('register-refactor');

            $scope.isOk = false;
            $scope.showPassword = false;
            $scope.showPassword2 = false;
            $scope.user = {
                pass: "",
                sex: 0,
                age: 18,
                agree: false,
                inviteCode: $routeParams.c
            };

            $scope.togglePassword = function () {
                $scope.showPassword = !$scope.showPassword;
            };

            $scope.togglePassword2 = function () {
                $scope.showPassword2 = !$scope.showPassword2;
            };

            // 获取第三方平台信息（如果存在）
            var params = $location.search();
            if (params.from) {
                userService.getUserInfo(params.from, function (json) {
                    if (!json.status) {
                        return;
                    }
                    $scope.$apply(function () {
                        $scope.user.name = "" + json.data.name;
                        $scope.user.sex = json.data.sex;
                        $scope.user.icon = json.data.icon;
                        $scope.user.openId = json.data.openId;
                    });
                });
            }

            $scope.reg = function () {
                validate($scope.user);
                if (!$scope.isOk) {
                    return;
                }

                if (!$scope.user.password || $scope.user.password !== $scope.password2) {
                    $scope.password2Msg = res.error(res.code.passwordInputNotEquals);
                    return;
                }

                faceinner.post(api['user.register'], $scope.user, function (result) {
                    if (result.code === 'S00') {
                        layer.msg(res.t('register.success'));
                        layer.open({
                            type: 1,
                            area: ['500px', '300px'],
                            title: '欢迎您使用 Bullet',
                            shade: 0.6,
                            maxmin: true,
                            anim: 1,
                            content: '<div style="padding:40px 36px;line-height:1.9;">' +
                                '恭喜您，<br/>&nbsp;&nbsp;&nbsp;&nbsp;您的账号 ' + $scope.user.email + ' 已注册成功！' +
                                '请登录邮箱查收激活邮件并完成激活。' +
                                '</div>'
                        });
                        return;
                    }

                    $scope.$apply(function () {
                        var errors = Array.isArray(result.data) ? result.data : [];
                        var i = 0;
                        for (i = 0; i < errors.length; i++) {
                            var fieldErrorInfo = errors[i];
                            $scope[fieldErrorInfo.field + "Msg"] = fieldErrorInfo.msg;
                        }
                    });
                });
            };

            function clearMessages() {
                $scope.emailMsg = '';
                $scope.nicknameMsg = '';
                $scope.passwordMsg = '';
                $scope.password2Msg = '';
            }

            function validate(user) {
                clearMessages();
                $scope.isOk = true;

                if (!user.email) {
                    $scope.emailMsg = res.error(res.code.mustFillInput);
                    $scope.isOk = false;
                }

                var emailReg = /^[a-zA-Z0-9_-]+@([a-zA-Z0-9]+\.)+(com|cn|net|org)$/;
                if (user.email && !emailReg.test(user.email)) {
                    $scope.emailMsg = res.error(res.code.mustFillInput);
                    $scope.isOk = false;
                }

                if (!user.nickname) {
                    $scope.nicknameMsg = res.error(res.code.mustFillInput);
                    $scope.isOk = false;
                }

                if (!user.password) {
                    $scope.passwordMsg = res.error(res.code.mustFillInput);
                    $scope.isOk = false;
                }

                if (!$scope.password2) {
                    $scope.password2Msg = res.error(res.code.mustFillInput);
                    $scope.isOk = false;
                }

                if (!$scope.user.agree) {
                    layer.msg(res.t('register.alertAgreeService'));
                    $scope.isOk = false;
                }
            }

            $scope.$on('$destroy', function () {
                $('body').removeClass('register-refactor');
            });
        }];
});
