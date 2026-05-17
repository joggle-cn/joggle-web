/**
 *
 * 支付套餐费 模块
 *
 * @author marker
 * @date 2019-12-26
 */
define(['app','jquery','layer', 'css!../../console/subpage.css', 'css!./package-pay.css'], function (app, $, layer) {//加载依赖js,

	var callback = ["$scope","$routeParams",'$utils',  function ($scope, $routeParams, $utils) {
        $('body').addClass('console-refactor');
        $scope.consoleMenuActive = 'orders';

        $scope.active = 'domain';
        $scope.payMoney = 0;
        $scope.payType = 2;
        $scope.amount  = 1;
        $scope.isSubmitting = false;
        $scope.quickAmounts = [1, 2, 3, 4, 6, 8, 10, 11, 12];
        $scope.data = {};

        let packageId = $routeParams.packageId;
        let params = {
            id: packageId,
        }

        function applyScope(handler){
            if ($scope.$root.$$phase) {
                handler();
                return;
            }
            $scope.$apply(handler);
        }

        function normalizeAmount(amount){
            let value = parseInt((amount + "").replace(/^(0+)|[^\d]+/g, ''), 10);
            if (!value || value < 1) {
                value = 1;
            }
            return value;
        }

        function finishSubmit(){
            applyScope(function(){
                $scope.isSubmitting = false;
            });
        }

	    function render(){
            faceinner.get(api["user.package.detail"], params, function(res){
                if (res.code == 'S00') {
                    applyScope(function() {
                        $scope.data = res.data;
                        calculate();
                    });
                }
            });
        }
        render();


        $scope.fixDays = function (){
            $scope.amount = normalizeAmount($scope.amount);
        }

        $scope.setAmount = function(month){
            $scope.amount = normalizeAmount(month);
        }

        $scope.isQuickAmount = function(month){
            return Number($scope.amount) === Number(month);
        }

        $scope.selectPayType = function(payType){
            $scope.payType = Number(payType);
        }


        $scope.$watch('amount', function(newVal, oldVal){
            if(newVal == oldVal){
                return;
            }
            let normalized = normalizeAmount(newVal);
            if (normalized !== Number(newVal)) {
                $scope.amount = normalized;
                return;
            }
            calculate();
        });
        $scope.$watch('payType', function(newVal, b){
            if(newVal == b){
                return;
            }
            let normalized = Number(newVal);
            if (normalized !== 2 && normalized !== 3) {
                normalized = 2;
            }
            if (normalized !== Number(newVal)) {
                $scope.payType = normalized;
                return;
            }
            $scope.payType = normalized;
            calculate();
        });



        /**
         * 计算价格
         * @param newVal
         */
        function calculate( ){
            let params = {
                resourceType: 5,
                amount: normalizeAmount($scope.amount),
                resId: packageId,
                payType: $scope.payType,
            }
            faceinner.postJson(api["user.orders.calculate"], params, function(res){
                if (res.code == 'S00') {
                    applyScope(function() {
                        $scope.payMoney = res.data.payAmount;
                        $scope.dueTime = res.data.dueTime;
                        if ($scope.amount != res.data.amount) {
                            layer.msg("该通道服务器到期时间：<br/><b>" + res.data.serverEndTime + "</b>", {icon: 9});
                        }
                        $scope.amount = res.data.amount;
                    });
                }else{
                    layer.msg(res.msg.replaceAll('\n', "<br/>"), {icon: 9});
                }
            });
        }


        /**
         * 调用支付
         */
		$scope.pay = function(){
            if($scope.isSubmitting){
                return;
            }
            $scope.isSubmitting = true;
            let params = {
                resourceType: 5,
                amount: normalizeAmount($scope.amount),
                resId: packageId,
                payType: $scope.payType,
            }
            faceinner.postJson(api["user.orders.create"], params, function(res){
                if (res.code == 'S00') {
                    if(params.payType == 2){// 支付宝
                        finishSubmit();
                        window.location.href = faceinner.server + '/api/open/orders/alipay?orderId='+ res.data;
                        layer.msg('正在跳转支付宝付款网页');
                        return;
                    }
                    if (params.payType == 3) {// 微信
                        finishSubmit();
                        let params2 = {
                            orderId: res.data
                        }
                        faceinner.postJson('/api/open/orders/wechat', params2, function (res) {
                            if (res.code !== 'S00') {
                                layer.msg("唤起微信支付二维码失败" + res.msg);
                                return;
                            }
                            $utils.openWechatPayQrCode(res.data, function () {
                                let count = 0;
                                let t = setInterval(function () {
                                    let params = {
                                        orderId: params2.orderId,
                                    }
                                    faceinner.postJson(api["user.orders.confirm"], params, function (res) {
                                        if (res.code === 'S00') {
                                            if (res.data.status !== 0) {
                                                layer.msg("购买成功");
                                                window.location.href = "#/user/package";
                                                window.location.reload();
                                                clearInterval(t);
                                            }
                                        }
                                        count++;
                                        if (count >= 100) {
                                            clearInterval(t);
                                        }
                                    });
                                }, 2000)
                            })
                        });
                        return;
                    }
                    finishSubmit();
                    window.location.href = "#/user/package";
                    layer.msg("购买成功");
                }else{ //错误提示
                    finishSubmit();
                    layer.msg(res.msg.replaceAll('\n', "<br/>"), {icon: 9});
                }
            });
        }

        $scope.$on('$destroy', function () {
            $('body').removeClass('console-refactor');
        });
 	}];
	

	return callback;
});
