/**
 * 购买流量模块
 */
define(['app', 'jquery', 'layer', 'css!../../console/subpage.css', 'css!./pay.css'], function (app, $, layer) {

    var callback = ["$scope", "$utils", function ($scope, $utils) {
        $('body').addClass('console-refactor');
        $scope.consoleMenuActive = 'metrics';

        $scope.payMoney = 0;
        $scope.amount = 1;
        $scope.payType = 2;
        $scope.isSubmitting = false;
        $scope.quickAmounts = [1, 2, 3, 6, 12, 24];

        $scope.data = {
            salesPrice: 1.60,
            originalPrice: 2.00,
            typeName: "流量"
        };

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

        $scope.normalizeInputAmount = function () {
            $scope.amount = normalizeAmount($scope.amount);
        };

        $scope.setAmount = function (size) {
            $scope.amount = normalizeAmount(size);
        };

        $scope.isQuickAmount = function (size) {
            return Number($scope.amount) === Number(size);
        };

        $scope.selectPayType = function (payType) {
            $scope.payType = Number(payType);
        };

        $scope.getPayTypeName = function () {
            if (Number($scope.payType) === 3) {
                return '\u5fae\u4fe1\u652f\u4ed8';
            }
            if (Number($scope.payType) === 1) {
                return '\u4f59\u989d\u652f\u4ed8';
            }
            return '\u652f\u4ed8\u5b9d';
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
            if (normalized !== 1 && normalized !== 2 && normalized !== 3) {
                normalized = 2;
            }
            if (normalized !== Number(newVal)) {
                $scope.payType = normalized;
                return;
            }
            $scope.payType = normalized;
            calculate();
        });

        function calculate() {
            var params = {
                resourceType: 3,
                amount: normalizeAmount($scope.amount),
                payType: $scope.payType
            };
            faceinner.postJson(api["user.orders.calculate"], params, function (res) {
                if (res.code === 'S00') {
                    applyScope(function () {
                        $scope.payMoney = res.data.payAmount;
                        if (res.data.amount) {
                            $scope.amount = res.data.amount;
                        }
                    });
                }
            });
        }

        function loadUserInfo() {
            faceinner.get(api['user.login.info'], function (res) {
                if (res.code === 'S00') {
                    applyScope(function () {
                        $scope.user = res.data || {};
                    });
                }
            });
        }

        $scope.pay = function () {
            if ($scope.isSubmitting) {
                return;
            }
            $scope.isSubmitting = true;

            var params = {
                resourceType: 3,
                amount: normalizeAmount($scope.amount),
                payType: $scope.payType
            };

            faceinner.postJson(api["user.orders.create"], params, function (res) {
                if (res.code !== 'S00') {
                    finishSubmit();
                    layer.msg(res.msg || '\u4e0b\u5355\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5');
                    return;
                }

                if (params.payType === 2) {
                    finishSubmit();
                    layer.msg('\u6b63\u5728\u8df3\u8f6c\u652f\u4ed8\u5b9d\u4ed8\u6b3e\u9875\u9762');
                    window.location.href = faceinner.server + '/api/open/orders/alipay?orderId=' + res.data;
                    return;
                }

                if (params.payType === 3) {
                    finishSubmit();
                    var wechatParams = { orderId: res.data };
                    faceinner.postJson('/api/open/orders/wechat', wechatParams, function (wechatRes) {
                        if (wechatRes.code !== 'S00') {
                            layer.msg('\u5524\u8d77\u5fae\u4fe1\u652f\u4ed8\u4e8c\u7ef4\u7801\u5931\u8d25\uff1a' + wechatRes.msg);
                            return;
                        }

                        $utils.openWechatPayQrCode(wechatRes.data, function () {
                            var count = 0;
                            var t = setInterval(function () {
                                faceinner.postJson(api["user.orders.confirm"], { orderId: wechatParams.orderId }, function (confirmRes) {
                                    if (confirmRes.code === 'S00' && confirmRes.data.status !== 0) {
                                        layer.msg('\u8d2d\u4e70\u6210\u529f');
                                        window.location.href = '#/user/profile';
                                        window.location.reload();
                                        clearInterval(t);
                                        return;
                                    }
                                    count++;
                                    if (count >= 100) {
                                        clearInterval(t);
                                    }
                                });
                            }, 2000);
                        });
                    });
                    return;
                }

                finishSubmit();
                layer.msg('\u8d2d\u4e70\u6210\u529f');
                window.location.href = '#/user/profile';
                window.location.reload();
            });
        };

        loadUserInfo();
        calculate();

        $scope.$on('$destroy', function () {
            $('body').removeClass('console-refactor');
        });
    }];

    return callback;
});
