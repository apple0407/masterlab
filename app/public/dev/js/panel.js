var Panel = (function () {

    var _options = {};

    // constructor
    function Panel(options) {
        _options = options;
    };

    Panel.prototype.getOptions = function () {
        return _options;
    };

    Panel.prototype.setOptions = function (options) {
        for (i in  options) {
            // if( typeof( _options[options[i]] )=='undefined' ){
            _options[i] = options[i];
            // }
        }
    };

    Panel.prototype.fetchPanelOrgs = function (page) {
        // url,  list_tpl_id, list_render_id
        var params = {format: 'json'};
        $.ajax({
            type: "GET",
            dataType: "json",
            async: true,
            url: '/org/fetchAll',
            data: {page: page},
            success: function (resp) {
                if(resp.data.orgs.length){
                    var source = $('#org_li_tpl').html();
                    var template = Handlebars.compile(source);
                    var result = template(resp.data);
                    $('#panel_orgs').html(result);
                }else{
                    var emptyHtml = defineStatusHtml({
                        wrap: '#panel_orgs',
                        message : '数据为空',
                        handleHtml: ' '
                    })
                }
            },
            error: function (res) {
                notify_error("请求数据错误" + res);
            }
        });
    }

    Panel.prototype.fetchPanelAssigneeIssues = function (page) {
        // url,  list_tpl_id, list_render_id
        var params = {format: 'json'};
        $.ajax({
            type: "GET",
            dataType: "json",
            async: true,
            url: '/dashboard/fetchPanelAssigneeIssues',
            data: {page: page},
            success: function (resp) {
                if(resp.data.issues.length){
                    var source = $('#assignee_issue_tpl').html();
                    var template = Handlebars.compile(source);
                    var result = template(resp.data);
                    $('#panel_assignee_issues').html(result);

                    window._cur_page = parseInt(page);
                    var pages = parseInt(resp.data.pages);
                    if (pages > 1) {
                        $('#panel_assignee_issues').append($('#assignee_more').html());
                    }
                }else{
                    var emptyHtml = defineStatusHtml({
                        message : '数据为空',
                        handleHtml: ' '
                    })
                    $('#panel_assignee_issues').append($('<tr><td colspan="4" id="panel_assignee_issues_wrap"></td></tr>'))
                    $('#panel_assignee_issues_wrap').append(emptyHtml.html)
                }
            },
            error: function (res) {
                notify_error("请求数据错误" + res);
            }
        });
    }

    Panel.prototype.fetchPanelActivity = function (page) {
        // url,  list_tpl_id, list_render_id
        var params = {format: 'json'};
        $.ajax({
            type: "GET",
            dataType: "json",
            async: true,
            url: '/dashboard/fetchPanelActivity',
            data: {page: page},
            success: function (resp) {
                if(resp.data.activity.length){
                    var activitys = [];
                    for(var i=0; i<resp.data.activity.length;  i++) {
                        var user_id = resp.data.activity[i].user_id;
                        resp.data.activity[i].user = getValueByKey(_issueConfig.users,user_id);
                    }

                    var source = $('#activity_tpl').html();
                    var template = Handlebars.compile(source);
                    var result = template(resp.data);
                    $('#panel_activity').append(result);

                    window._cur_page = parseInt(page);
                    var pages = parseInt(resp.data.pages);
                    if(window._cur_page<pages){
                        $('#panel_activity_more').removeClass('hide');
                    }else{
                        $('#panel_activity_more').addClass('hide');
                    }
                }else{
                    var emptyHtml = defineStatusHtml({
                        wrap: '#panel_activity',
                        message : '数据为空',
                        handleHtml: ' ',
                        showIcon: false
                    })
                }
                
            },
            error: function (res) {
                notify_error("请求数据错误" + res);
            }
        });
    }

    Panel.prototype.fetchPanelJoinProjects = function () {
        // url,  list_tpl_id, list_render_id
        var params = {format: 'json'};
        $.ajax({
            type: "GET",
            dataType: "json",
            async: true,
            url: '/user/fetchUserHaveJoinProjects',
            data: {},
            success: function (resp) {
                if(resp.data.projects.length){
                    var source = $('#join_project_tpl').html();
                    var template = Handlebars.compile(source);
                    var result = template(resp.data);
                    $('#panel_join_projects').html(result);

                    var pages = parseInt(resp.data.pages);
                    if (pages > 1) {
                        $('#panel_join_projects').append($('#panel_join_projects_more').html());
                    }
                }else{
                    var emptyHtml = defineStatusHtml({
                        wrap: '#panel_join_projects',
                        message : '数据为空',
                        direction: 'horizontal',
                        handleHtml: '<a class="btn btn-default" href="#"><svg class="logo" style="font-size: 20px; opacity: .6"><use xlink:href="#logo-svg"></use></svg>返回首页</a><a class="btn btn-success" href="/project/main/_new">创建项目</a>'
                    })
                }
                
            },
            error: function (res) {
                notify_error("请求数据错误" + res);
            }
        });
    }

    Panel.prototype.fetchProjectStat = function (project_id) {
        // url,  list_tpl_id, list_render_id
        var params = {format: 'json'};
        loading.show('#priority_stat');
        loading.show('#type_stat');
        loading.show('#status_stat');
        loading.show('#assignee_stat');
        $.ajax({
            type: "GET",
            dataType: "json",
            async: true,
            url: '/project/stat/fetchIssue',
            data: {project_id:project_id},
            success: function (resp) {
                console.log(resp)
                loading.hide('#priority_stat');
                loading.hide('#type_stat');
                loading.hide('#status_stat');
                loading.hide('#assignee_stat');

                $('#issues_count').html(resp.data.count);
                $('#no_done_count').html(resp.data.no_done_count);
                $('#closed_count').html(resp.data.closed_count);
                $('#sprint_count').html(resp.data.sprint_count);

                var source = $('#priority_stat_tpl').html();
                var template = Handlebars.compile(source);
                var result = template(resp.data);
                $('#priority_stat').html(result);

                source = $('#status_stat_tpl').html();
                template = Handlebars.compile(source);
                result = template(resp.data);
                $('#status_stat').html(result);

                source = $('#type_stat_tpl').html();
                template = Handlebars.compile(source);
                result = template(resp.data);
                $('#type_stat').html(result);

                source = $('#assignee_stat_tpl').html();
                template = Handlebars.compile(source);
                result = template(resp.data);
                $('#assignee_stat').html(result);
            },
            error: function (res) {
                loading.hide('#priority_stat');
                loading.hide('#type_stat');
                loading.hide('#status_stat');
                loading.hide('#assignee_stat');
                notify_error("请求数据错误" + res);
            }
        });
    }


    return Panel;
})();
