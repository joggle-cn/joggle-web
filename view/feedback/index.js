/**
 * 问题反馈模块
 */
define(['app', 'jquery', 'layer', 'css!../home/index.css', 'css!./index.css'], function (app, $, layer) {
    var callback = ['$scope', function ($scope) {
        $('body').addClass('home-refactor feedback-refactor');

        $scope.entity = {
            title: '',
            content: '',
            contact: ''
        };
        $scope.submitting = false;

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

        faceinner.get(api['user.login.info'], function (res) {
            if (res.code === '040006') {
                window.location.href = '#/login';
                return;
            }

            applyScope(function () {
                $scope.islogin = true;
                $scope.user = res.data || {};
                $scope.entity.contact = $scope.user.email || $scope.user.username || '';
            });
        });

        $scope.submit = function () {
            var title = trim($scope.entity.title);
            var content = trim($scope.entity.content);
            var contact = trim($scope.entity.contact);

            if (!title) {
                layer.msg('请填写问题标题');
                return;
            }
            if (!content) {
                layer.msg('请填写问题内容');
                return;
            }

            applyScope(function () {
                $scope.submitting = true;
            });

            faceinner.postJson(api['user.feedback'], {
                title: title,
                content: content,
                contact: contact
            }, function (res) {
                applyScope(function () {
                    $scope.submitting = false;
                });

                if (res.code === 'S00') {
                    layer.msg('提交成功，感谢你的反馈。', {icon: 1, time: 2200});
                    applyScope(function () {
                        $scope.entity.title = '';
                        $scope.entity.content = '';
                        $scope.entity.contact = contact;
                    });
                    return;
                }

                layer.msg(res.msg || '提交失败，请稍后重试。');
            });
        };

        $scope.$on('$destroy', function () {
            $('body').removeClass('home-refactor feedback-refactor');
        });
    }];

    return callback;
});
