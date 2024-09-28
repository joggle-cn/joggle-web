/**
 *
 * 支付 模块
 *
 * @author marker
 * @date 2019-12-26
 */
define(['app','jquery','layer', 'css!./pay.css'], function (app, $, layer) {//加载依赖js,


	var callback = ["$scope","$routeParams",'$location', '$utils', function ($scope, $routeParams, $location, $utils) {

        $scope.active = 'domain';
        $scope.payMoney = 0;
        $scope.amount  = 1; // 天
        $scope.payType  = 2; // 支付方式
        $scope.data = {
            salesPrice: 1.60,
            originalPrice: 2.00,
            typeName: "流量"
        }

        $scope.$watch('amount', function(newVal, b){

            $scope.amount  = newVal;
            calculate();
        });
        $scope.$watch('payType', function(newVal, b){
            $scope.payType  = newVal;
            calculate();
        });


        /**
         * 计算价格
         * @param newVal
         */
        function calculate(){
            let params = {
                resourceType: 3,
                amount: $scope.amount,
                resId: $scope.domainId,
                payType: $scope.payType,
            }
            faceinner.postJson(api["user.orders.calculate"], params, function(res){
                if (res.code == 'S00') {
                    $scope.$apply(function() {
                        $scope.payMoney = res.data.payAmount;
                        $scope.dueTime = res.data.dueTime;
                    });
                }
            });
        }


        /**
         * 调用支付
         */
		$scope.pay = function(){
            let params = {
                resourceType: 3,
                amount: $scope.amount,
                payType: $scope.payType,
            }
            faceinner.postJson(api["user.orders.create"], params, function(res){
                if (res.code === 'S00') {
                    if (params.payType == 2) {// 支付宝
                        layer.msg('正在跳转支付宝付款网页');
                        window.location.href = faceinner.server + '/api/open/orders/alipay?orderId=' + res.data;
                        return
                    }
                    if (params.payType == 3) {// 微信
                        let params2 = {
                            orderId:  res.data
                        }
                        faceinner.postJson('/api/open/orders/wechat', params2, function(res){
                            if (res.code !== 'S00') {
                                layer.msg("唤起微信支付二维码失败" + res.msg);
                                return;
                            }
                            $utils.openWechatPayQrCode(res.data, function(){
                                let count = 0;
                                let t = setInterval(function () {
                                    let params = {
                                        orderId: params2.orderId,
                                    }
                                    faceinner.postJson(api["user.orders.confirm"], params, function (res) {
                                        if (res.code === 'S00') {
                                            if (res.data.status !== 0) {
                                                layer.msg("购买成功");
                                                window.location.reload();
                                                clearInterval(t);
                                            }
                                        }
                                        count++;
                                        if (count >= 100) {
                                            clearInterval(t);
                                        }
                                    });
                                },2000)
                            })
                        });
                        return;
                    }
                    layer.msg("购买成功");
                } else { //错误提示
                    layer.msg(res.msg);
                }
            });



        }
 	}];
	

	return callback;
});