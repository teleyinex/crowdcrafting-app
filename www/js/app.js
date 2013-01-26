// The code below uses require.js, a module system for javscript:
// http://requirejs.org/docs/api.html#define

require.config({ 
    baseUrl: 'js/lib',
    paths: {'jquery':
            ['//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
             'jquery'],}
});

// Include the in-app payments API, and if it fails to load handle it
// gracefully.
// https://developer.mozilla.org/en/Apps/In-app_payments
require(['https://marketplace.cdn.mozilla.net/mozmarket.js'],
        function() {},
        function(err) {
            window.mozmarket = window.mozmarket || {};
            window.mozmarket.buy = function() {
                alert('The in-app purchasing is currently unavailable.');
            };
        });

// When you write javascript in separate files, list them as
// dependencies along with jquery
define("app", function(require) {

    var $ = require('jquery');
    //require('d3');

    // If using Twitter Bootstrap, you need to require all the
    // components that you use, like so:
    // require('bootstrap/dropdown');
    // require('bootstrap/alert');


    // START HERE: Put your js code here

    var api_user = "http://crowdcrafting.org/api";
    var api_user = "http://localhost:5000";
    var limit = 100;
    var offset = 0;

    function get_tasks(app) {
        var xhr = $.ajax({
            url: api_user + "/api/task",
            dataType: 'json',
        });
        return xhr;
    }
    function get_apps(offset, limit) {
        var xhr = $.ajax({
            url: api_user + "/api/app",
            dataType: 'json',
            data: {"limit": limit, "offset": offset}
        });

        xhr.done(function(apps){
            var l = apps.length
            if (l > 0) {
                for(i=0;i<l;i++) {
                    var app = apps[i];
                    var local_app = localStorage.getItem('app_'+ apps[i].id);                   if (app.hidden == 1) {
                        localStorage.removeItem("app_" + app.id);
                    }
                    else {
                        manage_app(app);
                    }
                }
                offset += limit;
                get_apps(offset, limit);
            }
            else {
                console.log("All apps obtained");
            }
        });
    }


    function manage_app(app) {
        if (app.info.task_presenter) {
            var tasks = get_tasks(app);
            tasks.done(function(data){
                var n_tasks = data.length;
                app.tasks = n_tasks;
                var card = $("<div/>", {'id': app.id});
                card.attr("class", "card");
                var row = $("<div/>");
                var span2= $("<div/>");
                var span8= $("<div/>");
                var btn = $("<div/>");
                row.attr("class", "row-fluid");
                span2.attr("class", "span4");
                span8.attr("class", "span8");
                if (localStorage.getItem("app_" + app.id)) {
                    //console.log(app.name + ": Old application");
                    app.new = false;
                }
                else {
                    app.new = true;
                    //console.log(app.name + ": New application");
                    localStorage.setItem("app_" + app.id, app);
                }
                var h4 = $("<h4/>", {'text': app.name});
                h4.css("text-transform", "capitalize");
                var thumbnail = $("<img/>");
                thumbnail.attr("class", "img-polaroid");
                thumbnail.attr("rel", "prefetch");
                thumbnail.css("max-width", "100px");
                thumbnail.css("min-height", "100px");
                thumbnail.css("max-height", "100px");
                thumbnail.on("error", function(){
                    this.src = "img/placeholder.dark.png";
                });

                if (app.info.thumbnail) {
                    thumbnail.attr("src", app.info.thumbnail);
                }
                else{
                    thumbnail.attr("src", "img/placeholder.dark.png" );
                }
                span2.append(thumbnail);
                if (app.new) {
                    var star = $("<i/>");
                    star.attr("class", "icon-star-empty");
                    star.css("font-size", "100px");
                    star.css("padding-top", "50px");
                    star.css("padding-left", "50px");
                    star.css("position", "absolute");
                    span2.append(star);
                }
                //span8.append(h4);
                row.append(h4);
                if (app.description.length > 35) {
                    app.description = app.description.substring(0,35) + "...";

                }
                span8.append("<i class='icon-beaker'></i> " + app.description + "<br/>");
                span8.append("<i class='icon-tasks'></i> Tasks available: " + app.tasks + "<br/>");
                span8.append("<a href='" + api_user + "/app/" + app.short_name +"' class='btn'><i class='icon-chevron-right'></i> More info</a>");
                btn.css("vertical-align", "middle");
                row.append(span2);
                row.append(span8);
                row.append(btn);
                card.append(row);
                if (app.new) {
                    console.log("New");
                    $("#algo").show();
                    $("#algo").append(card);
                }
                else {
                    $("#apps").append(card);
                }
            });
        }
        else {
            console.log("App es un borrador");
        }
    }

    get_apps(offset, limit);

    var install = require('install');

    function updateInstallButton() {
        $(function() {
            var btn = $('.install-btn');
            if(install.state == 'uninstalled') {
                btn.show();
            }
            else if(install.state == 'installed' || install.state == 'unsupported') {
                btn.hide();
            }
        });
    }

    $(function() {
        $('.install-btn').click(install);        
    });

    install.on('change', updateInstallButton);

    install.on('error', function(e, err) {
        // Feel free to customize this
        $('.install-error').text(err.toString()).show();
    });

    install.on('showiOSInstall', function() {
        // Feel free to customize this
        var msg = $('.install-ios-msg');
        msg.show();
        
        setTimeout(function() {
            msg.hide();
        }, 8000);
    });
});
