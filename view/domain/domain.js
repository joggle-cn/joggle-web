/**
 *
 * 我的域名 模块
 *
 * @author marker
 * @date 2019-12-26
 */
define(['app', 'jquery', 'layer','pagintation', 'css!./domain.css'], function (app, $, layer) {//加载依赖js,


    var callback = ["$scope", function ($scope) {

        $scope.active = 'domain';
        $scope.userDomain = {};

        $scope.tab = 1;/*设置默认*/
        $scope.selectTab = function (setTab) {/*设置tab点击事件*/
            this.tab = setTab;
            if (setTab === 2) {
                faceinner.get(api["user.domain"], function (res) {
                    if (res.status == 0) {
                        $scope.$apply(function () {
                            $scope.list = res.data;
                        });
                    }
                });
            }
            if (setTab === 1) {
                renderCustomDomain(1);
            }
        };
        $scope.isSelected = function (checkedTab) {/*页面的切换*/
            return this.tab === checkedTab;
        }

        $scope.selectTab(2);

        function renderCustomDomain(page) {
            let params = {
                current: page
                // orderNo: $scope.orderNo,
            }

            faceinner.get('/api/user/domain/list', params, function (res) {

                $scope.$apply(function () {
                    $scope.page = res.data;

                    let $pager = $('#pagination');
                    $pager.empty();
                    $pager.removeData("twbs-pagination");
                    $pager.unbind("page");
                    $pager.twbsPagination({
                        totalPages: res.data.pages,
                        visiblePages: 10,
                        // href: "#/user/orders/list?current={{number}}",
                        first: "首页",
                        prev: "上一页",
                        next: "下一页",
                        last: "尾页",
                        hideOnlyOnePage: true,
                        onPageClick: function (event, page) {
                            // renderCustomDomain(page)
                        }
                    });
                });
            });
        }

        /**
         * 购买域名
         */
        $scope.buyDomain = function (item) {

        }

        /** 关闭ip白名单弹框 */
        $scope.closeDomainCertDialog = function () {
            $("#domainCertDialog").modal('hide');
        }

        $scope.openUserDomainDialog = function ( ) {
            $scope.selectTab(1);
            $("#UserDomainDialog").modal({
                backdrop: false
            });
        }
        /** 关闭ip白名单弹框 */
        $scope.closeUserDomainDialog = function () {
            $("#UserDomainDialog").modal('hide');
        }

        /** 保存  */
        $scope.submitUserDomain = function () {
            faceinner.postJson('/api/user/domain', $scope.userDomain, function (res) {
                if (res.code === 'S00') {
                    $("#UserDomainDialog").modal('hide');
                    renderCustomDomain(1);
                } else {
                    layer.msg(res.msg);
                }
            });
        }

        $scope.openDomainCertDialog = function (item) {
            $scope.currentDomain = item;
            $scope.domainCertInfo = {
                id: item.id,
            }
            let params = {
                id: item.id,
            }
            faceinner.get('/api/user/domain/detail', params, function (res) {
                if (res.code === 'S00') {
                    $scope.$apply(function () {
                        $scope.domainCertInfo.certKey = res.data.certKey;
                        $scope.domainCertInfo.certPem = res.data.certPem;
                    });
                }
            });
            $("#domainCertDialog").modal({
                backdrop: false
            });
        }


        /** 保存  */
        $scope.submitDomainCert = function () {
            faceinner.putJson('/api/user/domain/cert', $scope.domainCertInfo, function (res) {
                if (res.code === 'S00') {
                    $("#domainCertDialog").modal('hide');
                    renderCustomDomain(1);
                } else {
                    layer.msg(res.msg);
                }
            });
        }


        /**
         * 确认删除
         */
        $scope.deleteDomain = function (item) {
            faceinner.delete('/api/user/domain/', {id: item.id}, function (res) {
                if (res.code == 'S00') {
                    // $("#delDevice").modal('hide');
                    // window.history.back();
                    renderCustomDomain(1);
                } else {
                    layer.msg(res.msg);
                }
            });
        };


    }];


    // app.controller('IndexController', callback );
    return callback;
});