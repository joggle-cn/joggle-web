/**
 * 节点状态页面
 */
define(['app', 'jquery', 'layer', 'pagintation', 'css!../../console/subpage.css', 'css!./list.css'], function (app, $, layer) {

    var callback = ["$scope", "$timeout", function ($scope, $timeout) {
        $('body').addClass('console-refactor');
        $scope.consoleMenuActive = 'metrics';

        $scope.loading = true;
        $scope.normalCount = 0;
        $scope.busyCount = 0;
        $scope.fullCount = 0;
        $scope.page = {
            records: [],
            total: 0,
            current: 1,
            pages: 1,
            size: 10
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
                    $scope.normalCount = 0;
                    $scope.busyCount = 0;
                    $scope.fullCount = 0;
                });
            }, 8000, false);
        }

        function rebuildNodeStats(records) {
            var normal = 0;
            var busy = 0;
            var full = 0;
            var i = 0;
            for (i = 0; i < records.length; i++) {
                if (Number(records[i].status) === 1) {
                    normal += 1;
                } else if (Number(records[i].status) === 2) {
                    busy += 1;
                } else if (Number(records[i].status) === 3) {
                    full += 1;
                }
            }
            $scope.normalCount = normal;
            $scope.busyCount = busy;
            $scope.fullCount = full;
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
                    $scope.searchNodes(page);
                }
            });
        }

        $scope.searchNodes = function (pageNo) {
            $scope.loading = true;
            startRequestGuard();

            var params = {
                current: Number(pageNo || 1)
            };

            faceinner.get(api["device.tunnel.nodes"], params, function (res) {
                stopRequestGuard();
                applyScope(function () {
                    $scope.loading = false;

                    if (res.code !== 'S00') {
                        $scope.page.records = [];
                        $scope.page.total = 0;
                        $scope.page.current = params.current;
                        $scope.page.pages = 1;
                        rebuildNodeStats([]);
                        return;
                    }

                    var page = res.data || {};
                    var records = page.records || [];

                    $scope.page = {
                        records: records,
                        total: Number(page.total || 0),
                        current: Number(page.current || params.current),
                        pages: Number(page.pages || 1),
                        size: Number(page.size || 10)
                    };
                    rebuildNodeStats(records);
                    renderPagination($scope.page.pages, $scope.page.current);
                });
            });
        };

        $scope.searchNodes(1);

        $scope.$on('$destroy', function () {
            stopRequestGuard();
            $('body').removeClass('console-refactor');
        });
    }];

    return callback;
});
