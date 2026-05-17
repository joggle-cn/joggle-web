/**
 * Download 下载中心模块
 */
define(['app', 'layer', 'jquery', 'css!./download.css'], function (app, layer, $) {
    var callback = ["$scope", function ($scope) {
        $('body').addClass('download-refactor');
        $scope.islogin = false;
        $scope.user = {};

        function applyScope(handler) {
            if ($scope.$root.$$phase) {
                handler();
                return;
            }
            $scope.$apply(handler);
        }

        faceinner.get(api['user.login.info'], function (res) {
            if (res.code === 'S00') {
                applyScope(function () {
                    $scope.islogin = true;
                    $scope.user = res.data || {};
                });
                return;
            }

            applyScope(function () {
                $scope.islogin = false;
                $scope.user = {};
            });
        });

        /**
         * 下载服务端
         */
        $scope.downloadServer = function () {
            layer.open({
                type: 1,
                area: ['560px', '340px'],
                title: '欢迎下载 Joggle Server',
                shade: 0.55,
                maxmin: true,
                anim: 1,
                content: '<div style="padding:36px 32px;line-height:1.9;">' +
                    '下载地址：<a href="https://pan.baidu.com/s/1Xy5_R_ezPFft9vsZrLNBSA" target="_blank">https://pan.baidu.com/s/1Xy5_R_ezPFft9vsZrLNBSA</a><br/>' +
                    '提取码：wq2e<br/><br/>' +
                    '蓝奏云：<a href="https://wwbgw.lanzouv.com/b01bjdhv8h" target="_blank">https://wwbgw.lanzouv.com/b01bjdhv8h</a><br/>' +
                    '密码：a4co' +
                    '</div>'
            });
        };

        /**
         * 下载客户端
         */
        $scope.downloadClient = function () {
            layer.open({
                type: 1,
                area: ['560px', '340px'],
                title: '欢迎下载 Joggle Client',
                shade: 0.55,
                maxmin: true,
                anim: 1,
                content: '<div style="padding:36px 32px;line-height:1.9;">' +
                    '下载地址：<a href="https://pan.baidu.com/s/1dy2qzPtN3CmftuHGm3BJgA" target="_blank">https://pan.baidu.com/s/1dy2qzPtN3CmftuHGm3BJgA</a><br/>' +
                    '提取码：h9hf<br/><br/>' +
                    '蓝奏云：<a href="https://wwbgw.lanzouv.com/b01bjdhv8h" target="_blank">https://wwbgw.lanzouv.com/b01bjdhv8h</a><br/>' +
                    '密码：a4co' +
                    '</div>'
            });
        };

        $scope.$on('$destroy', function () {
            $('body').removeClass('download-refactor');
        });
    }];

    return callback;
});
