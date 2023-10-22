/**
 * P2P映射管理
 *
 * @author marker
 * @date 2022-08-08
 */
define(['app','jquery','layer','pagintation','bootstrap-switch', 'css!./mapping.css'], function (app, $, layer, pagintation) {//加载依赖js,


	var callback = ["$scope","$routeParams",'$location',  function ($scope, $routeParams, $location) {
        $scope.current = $routeParams.current;
        $scope.page = {
            current: 1,
        }
        $scope.entity ={
            configEncryption: "none",
        }
        $scope.encOptions = [
            {"encrypt": "none", "desc": "不加密"},
            {"encrypt": "aes", "desc": "aes算法加密"},
            {"encrypt": "aes-128", "desc": "aes-128加密"},
            {"encrypt": "aes-192", "desc": "aes-192加密"},
            {"encrypt": "salsa20", "desc": "salsa20加密"},
            {"encrypt": "blowfish", "desc": "blowfish加密"},
            {"encrypt": "twofish", "desc": "twofish加密"},
            {"encrypt": "cast5", "desc": "cast5加密"},
            {"encrypt": "3des", "desc": "3des加密"},
            {"encrypt": "tea", "desc": "tea加密"},
            {"encrypt": "xtea", "desc": "xtea加密"},
            {"encrypt": "xor", "desc": "xor加密"},
            {"encrypt": "sm4",  "desc": "sm4国密加密"}]


        // 确认支付信息
        flushData();

        // //获取子控制器当中的跳转页数
        // $scope.$watch("current", function(event,val){
        //     console.log(val)
        //     $scope.page.current = val;
        //     queryOrderList()
        // });

        $("[name='my-checkbox']").bootstrapSwitch();

        /**
         * 计算价格
         * @param newVal
         */
        function flushData(){
            let params = {
                current: $scope.current
            }
            faceinner.get(api["device.peer.list"], params, function(res){
                if (res.code == 'S00') {
                    $scope.$apply(function() {
                        $scope.page = res.data;

                        let $pager = $('#pagination');
                        $pager.empty();
                        $pager.removeData("twbs-pagination");
                        $pager.unbind("page");
                        $pager.twbsPagination({
                            totalPages: res.data.pages,
                            visiblePages: 10,
                            href: "#/p2p/mapping/list?current={{number}}",
                            first:"首页",
                            prev:"上一页",
                            next :"下一页",
                            last :"尾页",
                            hideOnlyOnePage : false,
                            // onPageClick :function(event,page){
                            //     renderPage(page)
                            // }
                        });
                    });
                }
            });
        }


        $scope.deleteP2pMapping = function (peerId) {
            faceinner.delete(api['device.peer.save'], {id:peerId} , function(res) {
                if (res.code == 'S00') {
                    flushData();
                }else{
                    layer.msg(res.msg);
                }
            });
        }
        $scope.createP2pMapping = function (peerId) {
            if (peerId) {
                faceinner.get(api['device.peer.detail'], {id:peerId} , function(res) {
                    if (res.code == 'S00') {
                        $scope.$apply(function() {
                            $scope.entity = res.data
                            $("#devicePeerEnableCheckbox").bootstrapSwitch({
                                state: $scope.entity.status == 1,
                                onSwitchChange:function (event, state) {
                                    $scope.entity.status = state;
                                }
                            });
                        });
                    }else{
                        layer.msg(res.msg);
                    }
                });
            }else{
                $scope.entity = {
                    clientMtu: 1350,
                    configInterval: 40,
                    configEncryption: 'none',
                    clientProxyHost: "0.0.0.0",
                    serverLocalHost: "127.0.0.1"
                }
            }
            faceinner.get(api["device.options"], {}, function(res){
                if (res.code == 'S00') {
                    $scope.$apply(function() {
                        $scope.list = res.data;
                    });
                }
            });

            $('#createP2pMappingDialog').on('shown.bs.modal', function () {
                $("#devicePeerEnableCheckbox").bootstrapSwitch({
                    state: $scope.entity.status == 1,
                    onSwitchChange:function (event, state) {
                        $scope.entity.status = state;
                    }
                });
                $("#compressEnableCheckbox").bootstrapSwitch({
                    state: $scope.entity.configCompress == 1,
                    onSwitchChange:function (event, state) {
                        $scope.entity.configCompress = state;
                    }
                });
                $("#devicePeerEnableCheckbox").bootstrapSwitch('state', $scope.entity.status, true);
                $("#compressEnableCheckbox").bootstrapSwitch('state', $scope.entity.configCompress, true);
            })


            $("#createP2pMappingDialog").modal({
                backdrop: false
            });

            $('#collapseConfig').collapse({
                toggle: false
            })



        }


        $("#compressEnableCheckbox").bootstrapSwitch({
            state: $scope.entity.configCompress == 1,
            onSwitchChange:function (event, state) {
                $scope.entity.configCompress = state;
            }
        });

        $('#collapseConfig').on('shown.bs.collapse', function () {
            // do something…
            $("#compressEnableCheckbox").bootstrapSwitch('state', $scope.entity.configCompress, true);
        })


        // 高级配置
        $scope.toggleConfig = function ( ) {
            $("#collapseConfig").collapse('toggle');
        }


        // 关闭弹框
        $scope.closeP2pMappingDialog = function ( ) {
            $("#createP2pMappingDialog").modal('hide');
        }

        /**
         * 保存
         */
        $scope.submitP2pMapping = function(){
            $scope.entity.status = $scope.entity.status?1:0;
            $scope.entity.configCompress = $scope.entity.configCompress?1:0;

            if(!$scope.entity.id){
                faceinner.postJson(api['device.peer.save'], $scope.entity , function(res) {
                    if (res.code == 'S00') {
                        $("#createP2pMappingDialog").modal('hide');
                        flushData();
                    }else{
                        layer.msg(res.msg);
                    }
                });
            }else{
                faceinner.putJson(api['device.peer.save'], $scope.entity , function(res) {
                    if (res.code == 'S00') {
                        $("#createP2pMappingDialog").modal('hide');
                        flushData();
                    }else{
                        layer.msg(res.msg);
                    }
                });
            }

        }

 	}];
	

	return callback;
});