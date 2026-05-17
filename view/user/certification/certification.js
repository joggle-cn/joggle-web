/**
 * 实名认证页面
 */
define(['app', 'jquery', 'layer', 'css!../../console/subpage.css', 'css!./certification.css'], function (app, $, layer) {
    return ['$scope', '$rootScope', '$interval', function ($scope, $rootScope, $interval) {
        $('body').addClass('console-refactor');
        $scope.consoleMenuActive = 'profile';

        $scope.smsButtonText = '获取验证码';
        $scope.smsDisabled = false;
        $scope.submitDisabled = false;
        $scope.submitSuccess = false;
        $scope.certRejectMsg = '';
        $scope.certStatusValue = 0;
        $scope.certStatusText = '未认证';
        $scope.certStatusClass = 'is-none';
        $scope.certStatusIcon = 'fa-id-card-o';

        $scope.data = {
            realName: '',
            type: '1',
            idcard: '',
            phone: '',
            code: ''
        };

        var smsTimer = null;
        var smsCountdown = 0;

        function applyScope(handler) {
            if ($scope.$root.$$phase) {
                handler();
                return;
            }
            $scope.$apply(handler);
        }

        function trim(value) {
            return String(value || '').replace(/^\s+|\s+$/g, '');
        }

        function updateStatusView(status) {
            $scope.certStatusValue = status;
            if (status === 1) {
                $scope.certStatusText = '已认证';
                $scope.certStatusClass = 'is-pass';
                $scope.certStatusIcon = 'fa-check-circle';
                return;
            }
            if (status === 2) {
                $scope.certStatusText = '认证驳回';
                $scope.certStatusClass = 'is-reject';
                $scope.certStatusIcon = 'fa-times-circle';
                return;
            }
            if (status === 3) {
                $scope.certStatusText = '审核中';
                $scope.certStatusClass = 'is-pending';
                $scope.certStatusIcon = 'fa-clock-o';
                return;
            }

            $scope.certStatusText = '未认证';
            $scope.certStatusClass = 'is-none';
            $scope.certStatusIcon = 'fa-id-card-o';
        }

        function stopSmsTimer() {
            if (smsTimer) {
                $interval.cancel(smsTimer);
                smsTimer = null;
            }
        }

        function startSmsCountdown(seconds) {
            stopSmsTimer();
            smsCountdown = seconds;
            $scope.smsDisabled = true;
            $scope.smsButtonText = '等待' + smsCountdown + '秒可重发';

            smsTimer = $interval(function () {
                smsCountdown -= 1;
                if (smsCountdown <= 0) {
                    stopSmsTimer();
                    $scope.smsDisabled = false;
                    $scope.smsButtonText = '获取验证码';
                    return;
                }
                $scope.smsButtonText = '等待' + smsCountdown + '秒可重发';
            }, 1000);
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
                $rootScope.user = res.data;
                $scope.user = res.data;
                $scope.certRejectMsg = res.data.ucResultMsg || '';
                $scope.data.phone = res.data.phone || res.data.mobile || '';
                updateStatusView(Number(res.data.userCertification || 0));
            });
        });

        $scope.getSmsCode = function () {
            if ($scope.smsDisabled) {
                return;
            }

            var phone = trim($scope.data.phone);
            if (!phone) {
                layer.msg('请填写手机号');
                return;
            }
            if (!/^1\d{10}$/.test(phone)) {
                layer.msg('请输入正确的手机号');
                return;
            }

            $scope.smsDisabled = true;
            $scope.smsButtonText = '发送中...';

            faceinner.postJson(api['user.auth.sms'], {
                phone: phone,
                type: 'AUTH'
            }, function (res) {
                if (res.code === 'S00') {
                    applyScope(function () {
                        startSmsCountdown(90);
                    });
                    layer.msg('验证码已发送');
                    return;
                }

                applyScope(function () {
                    $scope.smsDisabled = false;
                    $scope.smsButtonText = '获取验证码';
                });
                layer.msg(res.msg || '验证码发送失败，请稍后重试');
            });
        };

        $scope.submitData = function () {
            if ($scope.submitDisabled) {
                return;
            }

            $scope.data.realName = trim($scope.data.realName);
            $scope.data.idcard = trim($scope.data.idcard);
            $scope.data.phone = trim($scope.data.phone);
            $scope.data.code = trim($scope.data.code);

            if (!$scope.data.realName) {
                layer.msg('姓名不能为空');
                return;
            }
            if (!$scope.data.idcard) {
                layer.msg('身份证号码不能为空');
                return;
            }
            if (!/^(\d{15}|\d{17}[\dXx])$/.test($scope.data.idcard)) {
                layer.msg('请输入正确的身份证号码');
                return;
            }
            if (!$scope.data.phone) {
                layer.msg('手机号不能为空');
                return;
            }
            if (!/^1\d{10}$/.test($scope.data.phone)) {
                layer.msg('请输入正确的手机号');
                return;
            }
            if (!$scope.data.code) {
                layer.msg('验证码不能为空');
                return;
            }

            $scope.submitDisabled = true;
            $scope.submitSuccess = false;

            faceinner.postJson(api['user.auth.submit'], $scope.data, function (res) {
                applyScope(function () {
                    $scope.submitDisabled = false;
                });

                if (res.code === 'S00') {
                    applyScope(function () {
                        $scope.submitSuccess = true;
                        updateStatusView(3);
                    });
                    layer.msg('提交成功，请等待系统审核。', {icon: 1});
                    return;
                }

                layer.msg(res.msg || '提交失败，请稍后重试', {icon: 9});
            });
        };

        $scope.$on('$destroy', function () {
            stopSmsTimer();
            $('body').removeClass('console-refactor');
        });
    }];
});
