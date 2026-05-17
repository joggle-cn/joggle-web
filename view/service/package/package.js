/**
 * 用户套餐页面
 */
define(['app', 'jquery', 'css!../../console/subpage.css', 'css!./package.css'], function (app, $) {
    var callback = ["$scope", "$timeout", function ($scope, $timeout) {
        $('body').addClass('console-refactor');
        $scope.consoleMenuActive = 'profile';

        $scope.loading = true;
        $scope.list = [];
        $scope.currentPackageLevel = 0;
        $scope.currentPackageName = '';
        $scope.currentPackageFlowText = '--';
        $scope.recommendedPlanId = null;
        $scope.hotPlanId = null;
        $scope.recommendedPlanName = '';
        var packageRequestGuard = null;

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

        function normalizeList(records) {
            var list = [];
            var i = 0;
            for (i = 0; i < records.length; i++) {
                var item = $.extend({}, records[i]);
                item.level = Number(item.level || 0);
                item.price = Number(item.price || 0);
                item.flowNumGb = formatFlowGb(item.flowNum);
                list.push(item);
            }

            list.sort(function (a, b) {
                return Number(a.level || 0) - Number(b.level || 0);
            });
            return list;
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

        function loadUserInfo() {
            faceinner.get(api['user.login.info'], function (res) {
                if (res.code === '040006' && localStorage.token) {
                    window.location.href = '#/login';
                    return;
                }

                if (res.code !== 'S00' || !res.data) {
                    return;
                }

                applyScope(function () {
                    $scope.currentPackageLevel = Number(res.data.resourcePackageLevel || 0);
                    $scope.currentPackageName = res.data.resourcePackageName || '基础套餐';
                    $scope.currentPackageFlowText = formatFlowGb(res.data.userPackageFlow) + ' GB';
                });
            });
        }

        function loadPackageList() {
            if (packageRequestGuard) {
                $timeout.cancel(packageRequestGuard);
                packageRequestGuard = null;
            }

            packageRequestGuard = $timeout(function () {
                if (!$scope.loading) {
                    return;
                }
                applyScope(function () {
                    $scope.loading = false;
                    $scope.list = [];
                    markPlans([]);
                });
            }, 8000, false);

            faceinner.get(api['user.package.list'], function (res) {
                if (packageRequestGuard) {
                    $timeout.cancel(packageRequestGuard);
                    packageRequestGuard = null;
                }

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

        $scope.isCurrentPackage = function (item) {
            if (!item) {
                return false;
            }
            return Number(item.level || 0) === Number($scope.currentPackageLevel || 0);
        };

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
            if ($scope.isCurrentPackage(item)) {
                return '当前';
            }
            if ($scope.recommendedPlanId && item.id === $scope.recommendedPlanId) {
                return '推荐';
            }
            if ($scope.hotPlanId && item.id === $scope.hotPlanId) {
                return '热门';
            }
            return Number(item.level) === 0 ? '免费' : '';
        };

        $scope.getPlanScene = function (item) {
            var level = Number(item && item.level ? item.level : 0);
            if (level <= 0) {
                return '适合体验与轻量访问场景';
            }
            if (level === 1) {
                return '适合个人远程办公与家庭设备管理';
            }
            if (level === 2) {
                return '适合小团队协作与多设备在线';
            }
            return '适合企业级持续运行与高并发连接';
        };

        loadUserInfo();
        loadPackageList();

        $scope.$on('$destroy', function () {
            if (packageRequestGuard) {
                $timeout.cancel(packageRequestGuard);
                packageRequestGuard = null;
            }
            $('body').removeClass('console-refactor');
            if ($.fn && $.fn.tooltip) {
                $('[data-toggle="tooltip"]').tooltip('destroy');
            }
        });
    }];

    return callback;
});
