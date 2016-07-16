//$.fn.taskMasterWA = function() {

//};

var _task = {};

function increment(id)
{
	_task[id]['time'] = setTimeout(function(){
		_task[id]['counter'] += 1;

		task_print_counter(id);

		increment(id);
	},1000);
}

function task_print_counter(id)
{
	$('#time_rendered_'+id).text(time_format(_task[id]['counter']));
}

function task_resume(id)
{
	setPlay(id);
	increment(id);
}

function time_format(time)
{
	var sec_num = parseInt(time, 10); // don't forget the second param
	var hours   = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours   < 10) {hours   = "0"+hours;}
	if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}
	var time    = hours+':'+minutes+':'+seconds;
	return time;
}

function format_task_start_time(unix_timestamp)
{
	// create a new javascript Date object based on the timestamp
	var date = new Date(parseFloat(unix_timestamp));
	// hours part from the timestamp
	var hours = '0' + date.getHours();
	// minutes part from the timestamp
	var minutes = "0" + date.getMinutes();
	// seconds part from the timestamp
	var seconds = "0" + date.getSeconds();

	return date.getFullYear() +'-'+ (date.getMonth()+1) +'-'+ date.getDate() 
	+' '+ hours.substr(hours.length-2) + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);	
}

function getBlockHtml(id)
{
	return '<div id="task_block_'+id+'">\
			 <div>\
				<div class="task_name">'+_task[id]['name']+ ' <span class="start_date">['+(format_task_start_time(id))+']</span>'+ '</div>\
				<div id="time_rendered_'+id+'">'+ time_format(_task[id]['counter']) +'</div>\
			 </div>\
			 <div class="task_controls">\
				<span class="glyphicon glyphicon-play" id="task_resume_'+id+'" title="Resume"></span>\
				<span class="glyphicon glyphicon-pause" id="task_stop_'+id+'" title="Pause"></span>\
				&nbsp;&nbsp;&nbsp;\
				<span class="glyphicon glyphicon-trash" id="task_delete_'+id+'" title="Delete"></span>\
			 </div>\
		 </div>';
}

function task_start($name)
{
	var name = $.trim($name.val());
	
	if(name.length == 0){
		return false;
	}
	
	$name.val('');
	var id = new Date().getTime();
	if(!_task.hasOwnProperty(id)){
		_task[id] = {'id' : id, 'name' : name, 'counter' : 0, 'time' : 0};

		$('#active_block').html($('#active_block').html()+getBlockHtml(id));

		setPlay(id);
	}

	increment(id);
}

function task_stop(id)
{
	if(_task.hasOwnProperty(id)){
		clearTimeout(_task[id]['time']);
		_task[id]['time'] = 0;

		setPaused(id);
	}
}

function setPaused(id)
{
	$('#task_block_'+id).css({'background-color':'rgb(214, 214, 214)'});
	$('#task_resume_'+id).show();
	$('#task_stop_'+id).hide();
}

function setPlay(id)
{
	$('#task_block_'+id).css({'background-color':'#FFFFFF'});
	$('#task_resume_'+id).hide();
	$('#task_stop_'+id).show();
}

function task_delete(id)
{
	if(_task.hasOwnProperty(id)){
		clearTimeout(_task[id]['time']);
		$('#task_block_'+id).remove();
		delete _task[id];
	}
}

function save()
{
	if(Object.keys(_task).length > 0){
		$.jStorage.set("tasks", _task);
		$('#task_info').text('Saved...').fadeOut( "slow", function() {
			$(this).text('');
		});
	}
}

function load()
{
	if(Object.keys(_task).length === 0){
		var tasks = $.jStorage.get("tasks");

		if(tasks){
			$.each(tasks, function(id,v){

				_task[id] = v;

				$('#active_block').html($('#active_block').html()+getBlockHtml(id));

				setPaused(id);
			});

			$('#task_info').text('Loaded...').fadeOut( "slow", function() {
				$(this).text('');
			});
		}
	}
}

function clear()
{
	$.jStorage.deleteKey("tasks");
}
