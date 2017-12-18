(function ($) {

    var Html = {
        'createHtml': function ($container) {

            $container.html('\
            <div class="task_new">\
            <div class="alert alert-success">New task.</div>\
            <input type="text" id="task_name" maxlength="50" />\
            <span class="glyphicon glyphicon-plus" id="startBtn" title="Add"></span>\
            <br /><br />\
            \
            <span class="glyphicon glyphicon-floppy-open" id="loadBtn" title="Load"></span>\
            &nbsp;&nbsp;&nbsp;\
            <span class="glyphicon glyphicon-floppy-save" id="saveBtn" title="Save"></span>\
            &nbsp;&nbsp;&nbsp;\
            <span class="glyphicon glyphicon-floppy-remove" id="clearBtn" title="Clear"></span>\
            \
            <div id="task_info"></div>\
            </div>\
            <div class="task_manager" class="label label-primary">\
                    <div class="alert alert-info">Active tasks.</div>\
                    <div id="active_block"></div>\
            </div>\
            <div class="task_reset"></div>');
        },
        
        'getBlockHtml': function (id)
        {
            return '<div id="task_block_' + id + '">\
                <div>\
                       <div class="task_name">' + Task.collection[id]['name'] + ' <span class="start_date">[' + (TimeTool.formatStartTime(id)) + ']</span>' + '</div>\
                       <div id="time_rendered_' + id + '">' + TimeTool.format(Task.collection[id]['counter']) + '</div>\
                </div>\
                <div class="task_controls">\
                       <span class="glyphicon glyphicon-play" id="task_resume_' + id + '" title="Resume"></span>\
                       <span class="glyphicon glyphicon-pause" id="task_stop_' + id + '" title="Pause"></span>\
                       &nbsp;&nbsp;&nbsp;\
                       <span class="glyphicon glyphicon-trash" id="task_delete_' + id + '" title="Delete"></span>\
                </div>\
            </div>';
        }
    };

    var TimeTool = {
        'format': function (time)
        {
            var sec_num = parseInt(time, 10); // don't forget the second param
            var hours = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (hours < 10) {
                hours = "0" + hours;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return hours + ':' + minutes + ':' + seconds;
        },
        
        'formatStartTime': function (unix_timestamp)
        {
            // create a new javascript Date object based on the timestamp
            var date = new Date(parseFloat(unix_timestamp));
            // hours part from the timestamp
            var hours = '0' + date.getHours();
            // minutes part from the timestamp
            var minutes = "0" + date.getMinutes();
            // seconds part from the timestamp
            var seconds = "0" + date.getSeconds();

            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
                    + ' ' + hours.substr(hours.length - 2) + ':' + minutes.substr(minutes.length - 2) + ':' + seconds.substr(seconds.length - 2);
        },
        
        'increment': function (id)
        {
            Task.collection[id]['time'] = setTimeout(function () {
                Task.collection[id]['counter'] += 1;

                Task.printCounter(id);

                TimeTool.increment(id);
            }, 1000);
        }
    };

    var Task = {

        collection: {},

        'start': function ($name)
        {
            var name = $.trim($name.val());
            if (name.length == 0) {
                return false;
            }

            $name.val('');
            var id = new Date().getTime();
            if (!Task.collection.hasOwnProperty(id)) {
                Task.collection[id] = {'id': id, 'name': name, 'counter': 0, 'time': 0};
                $('#active_block').html($('#active_block').html() + Html.getBlockHtml(id));
                Actions.play(id);
            }

            TimeTool.increment(id);
        },
        
        'stop': function (id)
        {
            if (Task.collection.hasOwnProperty(id)) {
                clearTimeout(Task.collection[id]['time']);
                Task.collection[id]['time'] = 0;

                Actions.pause(id);
            }
        },
        
        'delete': function (id)
        {
            if (Task.collection.hasOwnProperty(id)) {
                clearTimeout(Task.collection[id]['time']);
                $('#task_block_' + id).remove();
                delete Task.collection[id];
            }
        },
        
        'printCounter': function (id)
        {
            $('#time_rendered_' + id).text(TimeTool.format(Task.collection[id]['counter']));
        },

        'resume': function (id)
        {
            Actions.play(id);
            TimeTool.increment(id);
        }
    };

    var Actions = {
        
        'pause': function (id)
        {
            $('#task_block_' + id).css({'background-color': 'rgb(214, 214, 214)'});
            $('#task_resume_' + id).show();
            $('#task_stop_' + id).hide();
        },
        
        'play': function (id)
        {
            $('#task_block_' + id).css({'background-color': '#FFFFFF'});
            $('#task_resume_' + id).hide();
            $('#task_stop_' + id).show();
        },
        
        'save': function ()
        {
            if (Object.keys(Task.collection).length > 0) {
                $.jStorage.set("tasks", Task.collection);
                $('#task_info').text('Saved...').fadeOut("slow", function () {
                    $(this).text('');
                });
            }
        },

        'load': function ()
        {
            if (Object.keys(Task.collection).length === 0) {
                var tasks = $.jStorage.get("tasks");

                if (tasks) {
                    $.each(tasks, function (id, v) {

                        Task.collection[id] = v;

                        $('#active_block').html($('#active_block').html() + Html.getBlockHtml(id));

                        Actions.pause(id);
                    });

                    $('#task_info').text('Loaded...').fadeOut("slow", function () {
                        $(this).text('');
                    });
                }
            }
        },
        
        'clear': function ()
        {
            $.jStorage.deleteKey("tasks");
        }
    };

    var init = function ($container, settings) {

        Html.createHtml($container);

        $('#startBtn').on('click', function () {
            Task.start($('#task_name'));
        });

        $('#task_name').on('keyup', function (event) {
            if (event.keyCode == 13) {
                Task.start($('#task_name'));
            }
        });

        $('#loadBtn').on('click', function (event) {
            Actions.load();
        });

        $('#saveBtn').on('click', function (event) {
            Actions.save();
        });

        $('#clearBtn').on('click', function (event) {
            Actions.clear();
        });

        $('#active_block').on('click', 'span[id^="task_resume_"]', function (event) {

            var id = $(this).attr('id').replace(/[^0-9]/g, '');
            Task.resume(id);
        });

        $('#active_block').on('click', 'span[id^="task_stop_"]', function (event) {

            var id = $(this).attr('id').replace(/[^0-9]/g, '');
            Task.stop(id);
        });

        $('#active_block').on('click', 'span[id^="task_delete_"]', function (event) {

            var id = $(this).attr('id').replace(/[^0-9]/g, '');
            Task.delete(id);
        });
    }

    $.fn.taskMasterWA = function (options) {

        var settings = $.extend({
            debug: false
        }, options);

        return init($(this), settings);
    };

}(jQuery));
