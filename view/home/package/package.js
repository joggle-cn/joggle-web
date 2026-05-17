/**
 * 产品定价模块
 */
define(['app', 'jquery', 'css!../index.css', 'css!./package.css'], function (app, $) {
    var callback = ["$scope", "$timeout", function ($scope, $timeout) {
        $('body').addClass('home-refactor package-refactor');

        $scope.loading = true;
        $scope.list = [];
        $scope.recommendedPlanId = null;
        $scope.hotPlanId = null;
        $scope.recommendedPlanName = '';

        faceinner.get(api['user.login.info'], function (res) {
            if (res.code === '040006' && localStorage.token) {
                window.location.href = '#/login';
            }
        });

        function applyScope(handler) {
            if ($scope.$root.$$phase) {
                handler();
                return;
            }
            $scope.$apply(handler);
        }

        function formatFlowGb(flowNum) {
            var gb = Number(flowNum || 0) / 1024 / 1024;
            if (!isFinite(gb) || gb <= 0) {
                return '0';
            }
            var rounded = Math.round(gb * 100) / 100;
            return String(rounded).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
        }

        function refreshTooltips() {
            if (!$.fn || !$.fn.tooltip) {
                return;
            }
            $timeout(function () {
                $('[data-toggle="tooltip"]').tooltip({
                    container: 'body'
                });
            }, 0, false);
        }

        function markPlans(list) {
            var paidPlans = [];
            var i = 0;
            for (i = 0; i < list.length; i++) {
                if (Number(list[i].level) > 0) {
                    paidPlans.push(list[i]);
                }
            }

            if (!paidPlans.length) {
                $scope.recommendedPlanId = null;
                $scope.hotPlanId = null;
                $scope.recommendedPlanName = '';
                return;
            }

            $scope.recommendedPlanId = paidPlans[0].id;
            $scope.recommendedPlanName = paidPlans[0].name;
            $scope.hotPlanId = paidPlans.length > 1 ? paidPlans[paidPlans.length - 1].id : null;
        }

        function normalizeList(records) {
            var list = [];
            var i = 0;

            for (i = 0; i < records.length; i++) {
                var item = $.extend({}, records[i]);
                item.level = Number(item.level || 0);
                item.flowNumGb = formatFlowGb(item.flowNum);
                list.push(item);
            }

            list.sort(function (a, b) {
                return Number(a.level || 0) - Number(b.level || 0);
            });
            return list;
        }

        function render() {
            faceinner.get(api['user.package.list'], function (res) {
                applyScope(function () {
                    $scope.loading = false;
                    if (res.code !== 'S00') {
                        $scope.list = [];
                        markPlans([]);
                        return;
                    }

                    var records = res.data && res.data.records ? res.data.records : [];
                    var list = normalizeList(records);
                    $scope.list = list;
                    markPlans(list);
                });
                refreshTooltips();
            });
        }

        $scope.isFeatured = function (item) {
            if (!item) {
                return false;
            }
            if ($scope.recommendedPlanId) {
                return item.id === $scope.recommendedPlanId;
            }
            return Number(item.level) === 0;
        };

        $scope.isHot = function (item) {
            if (!item || !$scope.hotPlanId) {
                return false;
            }
            return item.id === $scope.hotPlanId && item.id !== $scope.recommendedPlanId;
        };

        $scope.getBadgeText = function (item) {
            if (!item) {
                return '';
            }
            if ($scope.recommendedPlanId && item.id === $scope.recommendedPlanId) {
                return '推荐';
            }
            if ($scope.hotPlanId && item.id === $scope.hotPlanId) {
                return '热门';
            }
            return Number(item.level) === 0 ? '免费' : '';
        };

        $scope.getActionLink = function (item) {
            if (!item || Number(item.level) === 0) {
                return '#/register';
            }
            return '#/user/package/pay?packageId=' + item.id;
        };

        render();

        $scope.$on('$destroy', function () {
            $('body').removeClass('home-refactor package-refactor');
            if ($.fn && $.fn.tooltip) {
                $('[data-toggle="tooltip"]').tooltip('destroy');
            }
        });
    }];

    return callback;
});
