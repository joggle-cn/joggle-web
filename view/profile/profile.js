/**
 *
 * 我的资料
 *
 * @author marker
 * @date 2016-06-05
 */
define(['app','layer','bootstrap-switch','css!./profile.css'], function (app,layer) {// 加载依赖js,

	return ['$rootScope','$scope','$location','userService', '$AjaxService',
	        function ($rootScope, $scope, $location, userService, $AjaxService, $session) {
		$scope.entity= {

		}
		// 加载用户登录信息
		faceinner.get(api['user.login.info'], function(res){
			if(res.code == 'S00'){
				$scope.$apply(function() {
					$rootScope.user = res.data;
				});

				$("#systemNoticeSwitch").bootstrapSwitch({
					size: 'mini',
					onText : "开",      // 设置ON文本
					offText : "关",    // 设置OFF文本
					onColor : "success",// 设置ON文本颜色(info/success/warning/danger/primary)
					// offColor : "warning",  // 设置OFF文本颜色 (info/success/warning/danger/primary)
					state: $rootScope.user.systemNotice,
					onSwitchChange:function (event, state) {
						$rootScope.user.systemNotice = state;
						$scope.submitSystemNotice();
					}
				});
				$("#systemNoticeSwitch").bootstrapSwitch('state', $scope.user.systemNotice, true);
			}
		});


		/**
		 * 提交系统通知配置
		 */
		$scope.submitSystemNotice = function () {
			let params = {
				status: $rootScope.user.systemNotice ? 1 : 0,
			}
			faceinner.postJson('/api/user/notice/switch', params, function (res) {
				if (res.code == 'S00') {
					$rootScope.user.systemNotice ?layer.msg('系统通知已打开'):layer.msg('系统通知已关闭');
				} else {
					layer.msg(res.msg);
				}
			});
		}

		$scope.save= function() {

			let params = {
				newPassword : $scope.entity.newPassword,
				oldPassword : $scope.entity.oldPassword,
			}

			faceinner.post(api['user.login.password'],params , function(res) {
				if (res.code == 'S00') {
					$("#addMapping").modal('hide');
					layer.msg('修改成功');
					$("#modifyPasswordDialog").modal('hide');
				} else{
					layer.msg(res.msg);
				}
			});

		}

		$scope.modifyPasswordDialog= function() {
			$("#modifyPasswordDialog").modal({
				backdrop: false
			});

		}
		$scope.closeModifyPasswordDialog= function() {
			$("#modifyPasswordDialog").modal('hide');
			$scope.entity.newPassword = "";
			$scope.entity.oldPassword = "";

		}
	}];

});
