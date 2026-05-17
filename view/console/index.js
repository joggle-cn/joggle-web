/**
 * Console 控制台模块
 */
define(['app', 'jquery', 'css!./index.css'], function (app, $) {
    var callback = ["$scope", function ($scope) {
        $('body').addClass('console-refactor');

        $scope.userInfo = {};
        $scope.onlineDeviceCount = 0;
        $scope.metricCards = [];
        $scope.deviceRows = [];
        $scope.p2pRows = [];
        $scope.wolRows = [];
        $scope.orderRows = [];

        $scope.flowUsed = '0.00';
        $scope.flowTotal = '0.00';
        $scope.flowUsedPercent = 0;
        $scope.flowRemain = '0.00';
        $scope.flowRemainPercent = '0.0';

        $scope.p2pActive = 0;
        $scope.p2pTotal = 0;

        $scope.dashboardStats = {
            monthFlow: 0,
            monthFlowOn: 0,
            monthLink: 0,
            monthLinkOn: 0,
            todayFlow: 0,
            todayFlowOn: 0,
            yearFlow: 0,
            yearFlowOn: 0
        };
        $scope.dashboardTrendFlow = 0;
        $scope.monthOrderCount = 0;
        $scope.monthOrderAmount = 0;

        function isOk(res) {
            return res && (res.code === 'S00' || res.code === 0 || res.code === '0' || typeof res.code === 'undefined');
        }

        function isNoLogin(res) {
            return res && res.code === '040006';
        }

        function safeApply(fn) {
            if ($scope.$$phase || $scope.$root.$$phase) {
                fn();
            } else {
                $scope.$apply(fn);
            }
        }

        function toNumber(val) {
            if (val === null || val === undefined) {
                return 0;
            }
            if (typeof val === 'number') {
                return isNaN(val) ? 0 : val;
            }
            var text = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
            var num = parseFloat(text);
            return isNaN(num) ? 0 : num;
        }

        function toFixed(val, digits) {
            return toNumber(val).toFixed(digits);
        }

        function formatRate(val) {
            var n = toNumber(val);
            var sign = n > 0 ? '+' : '';
            return sign + n.toFixed(1) + '%';
        }

        function formatDate(dateValue) {
            if (!dateValue) {
                return '-';
            }
            var d = new Date(dateValue);
            if (isNaN(d.getTime())) {
                return String(dateValue);
            }
            var y = d.getFullYear();
            var m = ('0' + (d.getMonth() + 1)).slice(-2);
            var day = ('0' + d.getDate()).slice(-2);
            return y + '-' + m + '-' + day;
        }

        function timeAgo(dateValue) {
            if (!dateValue) {
                return '-';
            }
            var d = new Date(dateValue);
            if (isNaN(d.getTime())) {
                return '-';
            }
            var diff = Date.now() - d.getTime();
            if (diff < 0) {
                diff = 0;
            }
            var min = Math.floor(diff / 60000);
            if (min < 1) {
                return '刚刚';
            }
            if (min < 60) {
                return min + ' 分钟前';
            }
            var hour = Math.floor(min / 60);
            if (hour < 24) {
                return hour + ' 小时前';
            }
            var day = Math.floor(hour / 24);
            return day + ' 天前';
        }

        function rebuildDashboardView() {
            var stats = $scope.dashboardStats || {};
            var monthFlowMB = toNumber(stats.monthFlow);
            if (monthFlowMB <= 0 && $scope.dashboardTrendFlow > 0) {
                monthFlowMB = $scope.dashboardTrendFlow;
            }

            var remainFlowMB = toNumber($scope.userInfo.userPackageFlow) + toNumber($scope.userInfo.userFlow);
            var totalFlowMB = monthFlowMB + remainFlowMB;
            var usedPercent = totalFlowMB > 0 ? monthFlowMB / totalFlowMB * 100 : 0;
            var remainPercent = totalFlowMB > 0 ? remainFlowMB / totalFlowMB * 100 : 0;

            $scope.flowUsed = toFixed(monthFlowMB / 1024, 2);
            $scope.flowTotal = toFixed(totalFlowMB / 1024, 2);
            $scope.flowUsedPercent = Math.max(0, Math.min(100, usedPercent));
            $scope.flowRemain = toFixed(remainFlowMB / 1024, 2);
            $scope.flowRemainPercent = toFixed(remainPercent, 1);

            $scope.metricCards = [
                { icon: 'fa-bar-chart', title: '今日流量', value: toFixed(stats.todayFlow, 0), unit: 'MB', sub: '同比昨日 ' + formatRate(stats.todayFlowOn) },
                { icon: 'fa-line-chart', title: '本月流量', value: toFixed(stats.monthFlow, 0), unit: 'MB', sub: '同比上月 ' + formatRate(stats.monthFlowOn) },
                { icon: 'fa-area-chart', title: '今年流量', value: toFixed(stats.yearFlow, 0), unit: 'MB', sub: '同比去年 ' + formatRate(stats.yearFlowOn) },
                { icon: 'fa-pie-chart', title: '本月连接', value: toFixed(stats.monthLink, 0), sub: '同比上月 ' + formatRate(stats.monthLinkOn) },
                { icon: 'fa-desktop', title: '在线设备数', value: $scope.onlineDeviceCount, sub: '总设备 ' + ($scope.deviceRows.length || 0) + ' 台' },
                { icon: 'fa-list-alt', title: '订单总览', value: $scope.monthOrderCount, sub: '近单金额 ¥' + toFixed($scope.monthOrderAmount, 2) }
            ];
        }

        function loadDashboardStatistics() {
            faceinner.get(api['user.dashboard.statistics'], {}, function (res) {
                if (isNoLogin(res)) {
                    window.location.href = '#/login';
                    return;
                }
                if (!isOk(res)) {
                    return;
                }
                safeApply(function () {
                    $scope.dashboardStats = res.data || $scope.dashboardStats;
                    rebuildDashboardView();
                });
            });
        }

        function loadDashboardTrend() {
            faceinner.get(api['user.dashboard.device.trend'], { deviceId: null }, function (res) {
                if (isNoLogin(res)) {
                    window.location.href = '#/login';
                    return;
                }
                if (!isOk(res)) {
                    return;
                }

                safeApply(function () {
                    var list = Array.isArray(res.data) ? res.data : [];
                    var trendSum = 0;
                    for (var i = 0; i < list.length; i++) {
                        trendSum += toNumber(list[i].flow);
                    }
                    $scope.dashboardTrendFlow = trendSum;
                    rebuildDashboardView();
                });
            });
        }

        function loadDashboardRankForTasks() {
            faceinner.get(api['user.dashboard.device.rank'], { type: 1 }, function (res) {
                if (isNoLogin(res)) {
                    window.location.href = '#/login';
                    return;
                }
                if (!isOk(res)) {
                    return;
                }

                safeApply(function () {
                    var list = Array.isArray(res.data) ? res.data : [];
                    $scope.wolRows = list.slice(0, 4).map(function (item, index) {
                        return {
                            name: '活跃设备 #' + (index + 1),
                            device: item.deviceName || '-',
                            success: true,
                            time: toFixed(item.flow, 2) + ' MB'
                        };
                    });
                });
            });
        }

        function loadDeviceStatus() {
            faceinner.get(api['user.device'], {}, function (res) {
                if (isNoLogin(res)) {
                    window.location.href = '#/login';
                    return;
                }
                if (!isOk(res)) {
                    return;
                }

                safeApply(function () {
                    var list = Array.isArray(res.data) ? res.data : [];
                    var onlineCount = 0;
                    $scope.deviceRows = list.slice(0, 5).map(function (item) {
                        var online = item.status === 1;
                        if (online) {
                            onlineCount += 1;
                        }
                        return {
                            name: item.name || item.deviceNo || '-',
                            online: online,
                            region: item.intranetIp || '-',
                            lastSeen: online ? timeAgo(item.onlineTime) : '-'
                        };
                    });
                    $scope.onlineDeviceCount = onlineCount;
                    rebuildDashboardView();
                });
            });
        }

        function loadP2pOverview() {
            faceinner.get(api['device.peer.list'], { current: 1 }, function (res) {
                if (isNoLogin(res)) {
                    window.location.href = '#/login';
                    return;
                }
                if (!isOk(res)) {
                    return;
                }

                safeApply(function () {
                    var page = res.data || {};
                    var records = Array.isArray(page.records) ? page.records : [];
                    var active = 0;
                    for (var i = 0; i < records.length; i++) {
                        if (records[i].status === 1) {
                            active += 1;
                        }
                    }

                    $scope.p2pRows = records.slice(0, 3).map(function (item) {
                        return {
                            name: item.remark || ((item.serverLocalHost || '0.0.0.0') + ':' + (item.serverLocalPort || '-')),
                            target: 'tcp://' + (item.clientDeviceIp || '0.0.0.0') + ':' + (item.clientProxyPort || '-')
                        };
                    });
                    $scope.p2pActive = active;
                    $scope.p2pTotal = toNumber(page.total || records.length);
                });
            });
        }

        function loadRecentOrders() {
            faceinner.get(api['user.orders.list'], { current: 1 }, function (res) {
                if (isNoLogin(res)) {
                    window.location.href = '#/login';
                    return;
                }
                if (!isOk(res)) {
                    return;
                }

                safeApply(function () {
                    var page = res.data || {};
                    var records = Array.isArray(page.records) ? page.records : [];
                    var amount = 0;

                    $scope.orderRows = records.slice(0, 5).map(function (item) {
                        amount += toNumber(item.payAmount);
                        return {
                            no: item.orderNo || '-',
                            product: item.name || item.resourceTypeName || '-',
                            amount: item.payAmount ? ('¥' + toFixed(item.payAmount, 2)) : '¥0.00',
                            status: item.statusName || '-',
                            time: formatDate(item.createTime)
                        };
                    });

                    $scope.monthOrderCount = toNumber(page.total || records.length);
                    $scope.monthOrderAmount = amount;
                    rebuildDashboardView();
                });
            });
        }

        function loadLoginInfoAndBootstrap() {
            faceinner.get(api['user.login.info'], function (res) {
                if (isNoLogin(res)) {
                    window.location.href = '#/login';
                    return;
                }
                if (!isOk(res)) {
                    return;
                }

                safeApply(function () {
                    $scope.userInfo = res.data || {};
                    rebuildDashboardView();
                });

                // 统一加载控制台真实数据（包含原 #/user/dashboard 的接口）
                loadDashboardStatistics();
                loadDashboardTrend();
                loadDashboardRankForTasks();
                loadDeviceStatus();
                loadP2pOverview();
                loadRecentOrders();
            });
        }

        loadLoginInfoAndBootstrap();

        $scope.$on('$destroy', function () {
            $('body').removeClass('console-refactor');
        });
    }];

    app.controller('ConsoleController', callback);
    return callback;
});
