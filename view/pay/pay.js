/**
 * 域名/端口资源支付模块
 */
define(['app', 'jquery', 'layer', 'css!../console/subpage.css', 'css!./pay.css'], function (app, $, layer) {

    var callback = ["$rootScope", "$scope", "$routeParams", "$utils", function ($rootScope, $scope, $routeParams, $utils) {
        $('body').addClass('console-refactor');
        $scope.consoleMenuActive = 'metrics';

        $scope.active = 'domain';
        $scope.payMoney = 0;
        $scope.salesPrice = 0;
        $scope.discountMoney = 0;
        $scope.amount = 7;
        $scope.payType = 2;
        $scope.showPackagePay = false;
        $scope.isSubmitting = false;
        $scope.isLoading = true;
        $scope.loadFailed = false;
        $scope.calculateFailed = false;
        $scope.quickAmounts = [
            { label: '1天', days: 1 },
            { label: '1周', days: 7 },
            { label: '1个月', days: 30 },
            { label: '2个月', days: 60 },
            { label: '3个月', days: 90 },
            { label: '6个月', days: 180 },
            { label: '12个月', days: 360 }
        ];
        $scope.data = {
            type: 1
        };

        if ($rootScope.user && $rootScope.user.resourcePackageLevel > 0) {
            $scope.showPackagePay = true;
            $scope.payType = 4;
        }

        $scope.domainId = $routeParams.domainId;

        function applyScope(handler) {
            if ($scope.$root.$$phase) {
                handler();
                return;
            }
            $scope.$apply(handler);
        }

        function normalizeAmount(amount) {
            var value = parseInt(String(amount || '').replace(/^(0+)|[^\d]+/g, ''), 10);
            if (!value || value < 1) {
                value = 1;
            }
            return value;
        }

        function finishSubmit() {
            applyScope(function () {
                $scope.isSubmitting = false;
            });
        }

        function showError(message) {
            layer.msg((message || '操作失败，请稍后重试').replace(/\n/g, '<br/>'), { icon: 9 });
        }

        function loadDomainInfo() {
            faceinner.get(api["user.domain.info"], { domainId: $scope.domainId }, function (res) {
                if (res.code === 'S00') {
                    applyScope(function () {
                        $scope.data = res.data || {};
                        $scope.isLoading = false;
                        $scope.loadFailed = false;
                        calculate();
                    });
                    return;
                }

                applyScope(function () {
                    $scope.isLoading = false;
                    $scope.loadFailed = true;
                });
                showError(res.msg);
            });
        }

        function loadUserInfo() {
            faceinner.get(api['user.login.info'], function (res) {
                if (res.code === 'S00') {
                    applyScope(function () {
                        $scope.user = res.data || {};
                        if ($scope.user.resourcePackageLevel > 0) {
                            $scope.showPackagePay = true;
                        }
                    });
                }
            });
        }

        function calculate() {
            if (!$scope.domainId || !$scope.data.type) {
                return;
            }

            $scope.calculateFailed = false;
            var params = {
                resourceType: $scope.data.type,
                amount: normalizeAmount($scope.amount),
                resId: $scope.domainId,
                payType: Number($scope.payType)
            };

            faceinner.postJson(api["user.orders.calculate"], params, function (res) {
                if (res.code === 'S00') {
                    applyScope(function () {
                        $scope.calculateFailed = false;
                        $scope.payMoney = res.data.payAmount;
                        $scope.salesPrice = res.data.price;
                        $scope.discountMoney = res.data.discountAmount;
                        $scope.dueTime = res.data.dueTime;
                        if (res.data.amount) {
                            $scope.amount = res.data.amount;
                        }
                    });
                    return;
                }

                applyScope(function () {
                    $scope.calculateFailed = true;
                });
                showError(res.msg);
            });
        }

        $scope.fixDays = function () {
            $scope.amount = normalizeAmount($scope.amount);
        };

        $scope.setAmount = function (days) {
            $scope.amount = normalizeAmount(days);
        };

        $scope.isQuickAmount = function (days) {
            return Number($scope.amount) === Number(days);
        };

        $scope.selectPayType = function (payType) {
            $scope.payType = Number(payType);
        };

        $scope.getResourceTypeName = function () {
            return Number($scope.data.type) === 2 ? '域名资源' : '端口资源';
        };

        $scope.getPayTypeName = function () {
            var type = Number($scope.payType);
            if (type === 4) {
                return 'VIP权益支付';
            }
            if (type === 3) {
                return '微信支付';
            }
            if (type === 1) {
                return '余额支付';
            }
            return '支付宝';
        };

        $scope.$watch('amount', function (newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            var normalized = normalizeAmount(newVal);
            if (normalized !== Number(newVal)) {
                $scope.amount = normalized;
                return;
            }
            calculate();
        });

        $scope.$watch('payType', function (newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }

            var normalized = Number(newVal);
            if (normalized !== 1 && normalized !== 2 && normalized !== 3 && normalized !== 4) {
                normalized = 2;
            }
            if (normalized === 4 && !$scope.showPackagePay) {
                normalized = 2;
            }
            if (normalized !== Number(newVal)) {
                $scope.payType = normalized;
                return;
            }

            $scope.payType = normalized;
            calculate();
        });

        $scope.pay = function () {
            if ($scope.isSubmitting || $scope.isLoading) {
                return;
            }

            $scope.isSubmitting = true;
            var params = {
                resourceType: $scope.data.type,
                amount: normalizeAmount($scope.amount),
                resId: $scope.domainId,
                payType: Number($scope.payType)
            };

            faceinner.postJson(api["user.orders.create"], params, function (res) {
                if (res.code !== 'S00') {
                    finishSubmit();
                    showError(res.msg);
                    return;
                }

                if (params.payType === 2) {
                    finishSubmit();
                    layer.msg('正在跳转支付宝付款页面');
                    window.location.href = faceinner.server + '/api/open/orders/alipay?orderId=' + res.data;
                    return;
                }

                if (params.payType === 3) {
                    finishSubmit();
                    var wechatParams = {
                        orderId: res.data
                    };
                    faceinner.postJson('/api/open/orders/wechat', wechatParams, function (wechatRes) {
                        if (wechatRes.code !== 'S00') {
                            layer.msg('唤起微信支付二维码失败：' + wechatRes.msg);
                            return;
                        }

                        $utils.openWechatPayQrCode(wechatRes.data, function () {
                            var count = 0;
                            var timer = setInterval(function () {
                                faceinner.postJson(api["user.orders.confirm"], { orderId: wechatParams.orderId }, function (confirmRes) {
                                    if (confirmRes.code === 'S00' && confirmRes.data.status !== 0) {
                                        layer.msg('购买成功');
                                        window.location.href = '#/user/domain';
                                        window.location.reload();
                                        clearInterval(timer);
                                        return;
                                    }

                                    count++;
                                    if (count >= 100) {
                                        clearInterval(timer);
                                    }
                                });
                            }, 2000);
                        });
                    });
                    return;
                }

                finishSubmit();
                layer.msg('购买成功');
                window.location.href = '#/user/domain';
                window.location.reload();
            });
        };

        loadUserInfo();
        loadDomainInfo();

        $scope.$on('$destroy', function () {
            $('body').removeClass('console-refactor');
        });
    }];

    return callback;
});
