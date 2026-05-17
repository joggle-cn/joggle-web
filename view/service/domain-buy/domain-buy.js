/**
 * 购买资源页面
 */
define(['app', 'jquery', 'layer', 'pagintation', 'css!../../console/subpage.css', 'css!./domain-buy.css'], function (app, $, layer) {

    var callback = ["$scope", "$timeout", function ($scope, $timeout) {
        $('body').addClass('console-refactor');
        $scope.consoleMenuActive = 'metrics';

        $scope.loading = true;
        $scope.availableCount = 0;
        $scope.tunnels = [];
        $scope.page = {
            records: [],
            total: 0,
            current: 1,
            pages: 1,
            size: 10
        };
        $scope.params = {
            serverTunnelId: '',
            type: '',
            keyword: ''
        };

        var requestGuard = null;

        function applyScope(handler) {
            if ($scope.$root.$$phase) {
                handler();
                return;
            }
            $scope.$apply(handler);
        }

        function stopRequestGuard() {
            if (requestGuard) {
                $timeout.cancel(requestGuard);
                requestGuard = null;
            }
        }

        function startRequestGuard() {
            stopRequestGuard();
            requestGuard = $timeout(function () {
                if (!$scope.loading) {
                    return;
                }
                applyScope(function () {
                    $scope.loading = false;
                    $scope.page.records = [];
                    $scope.page.total = 0;
                    $scope.page.current = 1;
                    $scope.page.pages = 1;
                    $scope.availableCount = 0;
                });
            }, 8000, false);
        }

        function computeAvailableCount(records) {
            var count = 0;
            var i = 0;
            for (i = 0; i < records.length; i++) {
                if (Number(records[i].status) === 0) {
                    count++;
                }
            }
            return count;
        }

        function renderPagination(pages, current) {
            var totalPages = Number(pages || 1);
            if (totalPages < 1) {
                totalPages = 1;
            }

            var startPage = Number(current || 1);
            if (startPage < 1) {
                startPage = 1;
            }
            if (startPage > totalPages) {
                startPage = totalPages;
            }

            var $pager = $('#pagination');
            $pager.empty();
            $pager.removeData("twbs-pagination");
            $pager.unbind("page");
            $pager.twbsPagination({
                totalPages: totalPages,
                startPage: startPage,
                visiblePages: Math.min(8, totalPages),
                href: "",
                first: "首页",
                prev: "上一页",
                next: "下一页",
                last: "末页",
                hideOnlyOnePage: true,
                onPageClick: function (event, page) {
                    if (Number(page) === Number($scope.page.current || 1)) {
                        return;
                    }
                    $scope.searchDomain(page);
                }
            });
        }

        function loadTunnelOptions() {
            faceinner.get('/api/server/tunnel/options', {}, function (res) {
                if (res.code !== 'S00') {
                    return;
                }
                var shouldRefresh = false;
                applyScope(function () {
                    $scope.tunnels = res.data || [];
                    if (!$scope.params.serverTunnelId && $scope.tunnels.length) {
                        $scope.params.serverTunnelId = $scope.tunnels[0].id;
                        shouldRefresh = true;
                    }
                });
                if (shouldRefresh) {
                    $scope.searchDomain(1);
                }
            });
        }

        $scope.resetFilters = function () {
            $scope.params.type = '';
            $scope.params.keyword = '';
            if ($scope.tunnels.length) {
                $scope.params.serverTunnelId = $scope.tunnels[0].id;
            } else {
                $scope.params.serverTunnelId = '';
            }
            $scope.searchDomain(1);
        };

        $scope.searchDomain = function (page) {
            $scope.loading = true;
            startRequestGuard();

            var requestParams = {
                current: Number(page || 1),
                serverTunnelId: $scope.params.serverTunnelId || '',
                type: $scope.params.type || '',
                keyword: ($scope.params.keyword || '').trim()
            };

            faceinner.get(api["user.domain.search"], requestParams, function (res) {
                stopRequestGuard();
                applyScope(function () {
                    $scope.loading = false;

                    if (res.code !== 'S00') {
                        $scope.page.records = [];
                        $scope.page.total = 0;
                        $scope.page.current = requestParams.current;
                        $scope.page.pages = 1;
                        $scope.availableCount = 0;
                        return;
                    }

                    var pageData = res.data || {};
                    var records = pageData.records || [];
                    $scope.page = {
                        records: records,
                        total: Number(pageData.total || 0),
                        current: Number(pageData.current || requestParams.current),
                        pages: Number(pageData.pages || 1),
                        size: Number(pageData.size || 10)
                    };
                    $scope.availableCount = computeAvailableCount(records);

                    renderPagination($scope.page.pages, $scope.page.current);
                });
            });
        };

        loadTunnelOptions();
        $scope.searchDomain(1);

        $scope.$on('$destroy', function () {
            stopRequestGuard();
            $('body').removeClass('console-refactor');
        });
    }];

    return callback;
});
