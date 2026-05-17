/**
 *
 * 激活用户 模块
 *
 * @author marker
 * @date 2020-03-18
 */
define(['app', 'layer', 'jquery', 'css!../../console/subpage.css', 'css!./invite.css'], function (app, layer, $) {
	let callback = ["$scope","$routeParams","$rootScope", function ($scope, $routeParams, $rootScope) {
        $('body').addClass('console-refactor');
        $scope.consoleMenuActive = 'invite';

        function renderInvite(activateCode) {
            if (!activateCode) {
                return;
            }

            let url = $rootScope.config.websiteUrl + "/#/register?c=" + activateCode;
            $scope.inviteUrl = url;

            new QRCode('imgQRcode', {
                text: url,
                width: 256,
                height: 256,
                colorDark : '#000000',
                colorLight : '#ffffff',
                correctLevel : QRCode.CorrectLevel.H
            });
        }

        // 优先使用全局用户信息，不存在则补拉一次
        let activateCode = $rootScope.user && $rootScope.user.activateCode;
        if (activateCode) {
            renderInvite(activateCode);
        } else {
            faceinner.get(api['user.login.info'], function (res) {
                if (res.code === 'S00' && res.data) {
                    $scope.$apply(function () {
                        $rootScope.user = res.data;
                        renderInvite(res.data.activateCode);
                    });
                }
            });
        }



        /**
         * 复制邀请链接
         */
        $scope.copyInviteUrl = function(){
            let transfer = document.getElementById('inviteUrlInput');
            if (!transfer || !transfer.value) {
                layer.msg("邀请链接尚未生成");
                return;
            }
            transfer.focus();
            transfer.select();
            if (document.execCommand('copy')) {
                document.execCommand('copy');
            }
            layer.msg("复制成功")
        }

        $scope.$on('$destroy', function () {
            $('body').removeClass('console-refactor');
        });

    }];
	return callback;
});
