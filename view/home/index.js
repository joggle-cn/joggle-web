/**
 * Home 首页模块
 */
define(['app', 'jquery', 'css!./index.css'], function (app, $) {
    var callback = ["$scope", "$timeout", function ($scope, $timeout) {
        $('body').addClass('home-refactor');

        $scope.packageLoading = true;
        $scope.homePlans = [];
        $scope.recommendedPlanId = null;
        $scope.hotPlanId = null;
        var packageRequestGuard = null;

        // 兼容旧 token：服务端识别未登录时引导重新登录
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

        function getFallbackPlans() {
            return [
                {
                    id: 'fallback-free',
                    name: '普通用户',
                    level: 0,
                    price: 0,
                    deviceNum: 2,
                    flowNumGb: '1',
                    broadbandRate: 3,
                    portNum: 4,
                    p2pNum: 2,
                    concurrentNum: '-',
                    wolEnable: 1,
                    isFallback: true
                },
                {
                    id: 'fallback-vip1',
                    name: 'VIP1',
                    level: 1,
                    price: 19.99,
                    deviceNum: 4,
                    flowNumGb: '10',
                    broadbandRate: 5,
                    portNum: 10,
                    p2pNum: 5,
                    concurrentNum: 200,
                    wolEnable: 1,
                    isFallback: true
                },
                {
                    id: 'fallback-vip2',
                    name: 'VIP2',
                    level: 2,
                    price: 29.99,
                    deviceNum: 6,
                    flowNumGb: '30',
                    broadbandRate: 10,
                    portNum: 20,
                    p2pNum: 6,
                    concurrentNum: 400,
                    wolEnable: 1,
                    isFallback: true
                }
            ];
        }

        function normalizeList(records) {
            var list = [];
            var i = 0;
            for (i = 0; i < records.length; i++) {
                var item = $.extend({}, records[i]);
                item.level = Number(item.level || 0);
                item.price = Number(item.price || 0);
                item.flowNumGb = item.flowNumGb || formatFlowGb(item.flowNum);
                list.push(item);
            }

            list.sort(function (a, b) {
                return Number(a.level || 0) - Number(b.level || 0);
            });
            return list;
        }

        function pickHomePlans(list) {
            var freePlan = null;
            var paidPlans = [];
            var result = [];
            var i = 0;

            for (i = 0; i < list.length; i++) {
                if (Number(list[i].level) <= 0 && !freePlan) {
                    freePlan = list[i];
                } else if (Number(list[i].level) > 0) {
                    paidPlans.push(list[i]);
                }
            }

            if (freePlan) {
                result.push(freePlan);
            }

            for (i = 0; i < paidPlans.length && result.length < 3; i++) {
                result.push(paidPlans[i]);
            }

            for (i = 0; i < list.length && result.length < 3; i++) {
                if (result.indexOf(list[i]) === -1) {
                    result.push(list[i]);
                }
            }

            return result.slice(0, 3);
        }

        function markPlans(list) {
            var paidPlans = [];
            var i = 0;
            for (i = 0; i < list.length; i++) {
                if (Number(list[i].level) > 0) {
                    paidPlans.push(list[i]);
                }
            }

            $scope.recommendedPlanId = paidPlans.length ? paidPlans[0].id : null;
            $scope.hotPlanId = paidPlans.length > 1 ? paidPlans[paidPlans.length - 1].id : null;
        }

        function setHomePlans(list) {
            var displayPlans = pickHomePlans(list);
            $scope.homePlans = displayPlans;
            markPlans(displayPlans);
        }

        function loadPackages() {
            if (packageRequestGuard) {
                $timeout.cancel(packageRequestGuard);
                packageRequestGuard = null;
            }

            packageRequestGuard = $timeout(function () {
                if (!$scope.packageLoading) {
                    return;
                }
                applyScope(function () {
                    $scope.packageLoading = false;
                    setHomePlans(getFallbackPlans());
                });
            }, 8000, false);

            faceinner.get(api['user.package.list'], function (res) {
                if (packageRequestGuard) {
                    $timeout.cancel(packageRequestGuard);
                    packageRequestGuard = null;
                }

                applyScope(function () {
                    $scope.packageLoading = false;

                    if (res.code !== 'S00') {
                        setHomePlans(getFallbackPlans());
                        return;
                    }

                    var records = res.data && res.data.records ? res.data.records : [];
                    var list = normalizeList(records);
                    setHomePlans(list.length ? list : getFallbackPlans());
                });
            });
        }

        $scope.isFeaturedPlan = function (item) {
            if (!item) {
                return false;
            }
            if ($scope.recommendedPlanId) {
                return item.id === $scope.recommendedPlanId;
            }
            return Number(item.level || 0) === 0;
        };

        $scope.isHotPlan = function (item) {
            return !!(item && $scope.hotPlanId && item.id === $scope.hotPlanId && item.id !== $scope.recommendedPlanId);
        };

        $scope.getPlanBadge = function (item) {
            if (!item) {
                return '';
            }
            if ($scope.recommendedPlanId && item.id === $scope.recommendedPlanId) {
                return '推荐';
            }
            if ($scope.hotPlanId && item.id === $scope.hotPlanId) {
                return '热门推荐';
            }
            return Number(item.level || 0) === 0 ? '免费' : '';
        };

        $scope.getPlanTag = function (item) {
            var level = Number(item && item.level ? item.level : 0);
            if (level <= 0) {
                return '适合体验与轻量访问';
            }
            if (level === 1) {
                return '适合个人与小团队';
            }
            return '适合团队与企业需求';
        };

        $scope.getPlanActionLink = function (item) {
            if (!item || Number(item.level || 0) <= 0) {
                return '#/register';
            }
            if (item.isFallback) {
                return '#/package';
            }
            return '#/user/package/pay?packageId=' + item.id;
        };

        loadPackages();

        $scope.$on('$destroy', function () {
            if (packageRequestGuard) {
                $timeout.cancel(packageRequestGuard);
                packageRequestGuard = null;
            }
            $('body').removeClass('home-refactor');
        });
    }];

    app.controller('IndexController', callback);
    return callback;
});
