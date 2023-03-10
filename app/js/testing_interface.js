// Internal state.
var CURRENT_INPUT_GRID = new Grid(3, 3);
var CURRENT_OUTPUT_GRID = new Grid(3, 3);
var TEST_PAIRS = new Array();
var CURRENT_TEST_PAIR_INDEX = 0;
var COPY_PASTE_DATA = new Array();
var TASK_ID = "";

// Cosmetic.
var EDITION_GRID_HEIGHT = 500;
var EDITION_GRID_WIDTH = 500;
var MAX_CELL_SIZE = 100;

let task_list;

function loadTaskList(){
// Define a function to use the numeric row
	function setTaskList(task_list) {
	  // Do something with the numeric row
	  console.log(task_list);
	}

	//Read in task list
	$.get('https://raw.githubusercontent.com/ahn-cj/ARC-behavioral/main/eye-tracking/ARCsubOrder_withBreaks.csv', function(csvData) {
		// Parse the CSV file into an array of arrays
		const dataArray = $.csv.toArrays(csvData);

		// Convert strings to arrays for each row
		const rows = dataArray.map(row => row.toString().split(','));
  
		// Select a specific row by index
		const rowIndex = document.getElementById("rowIndex").value;// Index starts at 0
	
		const selectedRow = rows[rowIndex];
  
		// Convert strings to numbers using parseInt
		task_list = selectedRow.map(value => parseInt(value));
  
		// Call the callback function with the numeric row
		callback(task_list);
	});

	// Call the get function with the callback function
	$.get('https://raw.githubusercontent.com/ahn-cj/ARC-behavioral/main/eye-tracking/ARCsubOrder_withBreaks.csv', function(csvData) {
	  // Call the doSomething function with the numeric row
	  setTaskList(task_list);
	});
}

console.log(task_list);

// Task progress
var task_num = 1;
//var task_list = [-1,45,40,3,7,20,27,12,21,31,41,5,18,9,28,35,24,15,39,42,26,19,4,22,11,34,36,10,43,38,2,23,16,13,6,33,29,44,32,30,14,1,37,25,17,8];
var task_break_1 = 10; //break no.1
var task_break_2 = 19; //break no.2
var task_break_3 = 28; //break no.3
var task_break_4 = 37; //break no.4
var task_length = 46; //end of session
var success = 0; //this var defines a success or failure trial
var error_counter = 0;
var correct_counter = 0

// Data structure
var jsondata = new Object(); //JSON.parse(text);
var taskArray = [];
var task = new Object();
var attemptArray = [];
var attempt = new Object();
var actionArray = [];
var action = new Object();

var counter = 0;

// Show progress
function showProgress() {
   document.getElementById("percentage").innerHTML = Math.round((task_num/task_length)*100)+"%";
}

//CORS
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
                    // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    }
    else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    }
    else {
        // CORS not supported.
        xhr = null;
        }
        return xhr;
    }

//for communicating with Python
function sendToPy(message) {
  //var xhr = new XMLHttpRequest();
  //xhr.open('POST', '/local', true);
  //xhr.setRequestHeader('Content-Type', 'application/json');
  //xhr.onload = function() {
  	// handle response from server
 // 	var text = xhr.responseText;
  //};
  //xhr.onerror = function() {
  	// handle error
  //	alert("Error sending data to server");
  //};
  //console.log("hiiii")
   	var xhr = createCORSRequest('POST','/python')
    if (!xhr){
        throw new Error('CORS not supported');
    }
    xhr.setRequestHeader('Content-Type','application/json');
    //xhr.onload = function(){
    //    var text = xhr.responseText;
    //    console.log(text)
    //};
    //xhr.onerror = function(){
    //    alert("Error sending data to server");
    //    console.log("err")
    //};
  //xhr.send(data);
  	//console.log("send")
	xhr.send(JSON.stringify({ message: message }));
}


function createSubj(){
	var data = JSON.stringify(jsondata);
	//Running locally
	//var url = 'http://127.0.0.1:3000/SubjectData';
	var url = '/subject';
    var xhr = createCORSRequest('POST',url)
    if (!xhr){
        throw new Error('CORS not supported');
    }
    xhr.setRequestHeader('Content-Type','application/json');
    //xhr.onload = function(){
    //    var text = xhr.responseText;
    //};
    //xhr.onerror = function(){
    //    alert("Error sending data to server");
    //};
    xhr.send(data);
    taskArray = [];
    attemptArray = [];
    actionArray = [];
    sendToPy(data)
}

function updateAttempts(){
	attempt = actionArray;
	attemptArray.push(attempt);
	actionArray = [];
}

function sendData(){
	//attempt = actionArray;
	//attemptArray.push(attempt);
	task.attempts = attemptArray;
	task.id = task_num;
	//task.push(attemptArray);
	taskArray.push(task);
	jsondata.session = taskArray;
	var data = JSON.stringify(jsondata);
	//writing to local
	//var url = 'http://127.0.0.1:3000/SubjectData';
	var url = '/subject';
	var xhr = createCORSRequest('PUT',url)
	if (!xhr){
		throw new Error('CORS not supported');
	}
	xhr.setRequestHeader('Content-Type','application/json');
	//xhr.onload = function(){
	//	var text = xhr.responseText;
	//};
	//xhr.onerror = function(){
	//	alert("Error sending data to server");
	//};
	xhr.send(data);
	//console.log("data sent to server");
	actionArray = [];
	attemptArray = [];
}

function beginTask(){
	jsondata.subj_ID = Math.random().toString(36).substring(2,10);
	jsondata.start_time = Date();
	createSubj();
	presentTask();
}

function startStudy(){
	loadTaskList();
	beginTask();
}

function nextTask(){
    //disabled submit button
    $('#submit_solution_btn').attr('disabled','disabled');
	task_num++;
    error_counter = 0;
	//console.log("next button click");
	if (task_num == task_length) {
        setTimeout('studyEnd()', 4000);
    }	else {
    	setTimeout('presentTask()', 4000);
    		if (task_num == task_break_1 || task_num == task_break_2 || task_num == task_break_3 || task_num == task_break_4) {
				setTimeout('studyBreak()', 4000);
			}
    	}
}

function studyBreak() {
	document.getElementById("brkoverlay").style.display = "block";
	action = new Object();
	action.desc = "breakStart";
	action.time = Date.now();
	action.timestamp = Date();
	actionArray.push(action);
	sendToPy("Start Break");
}

function breakOver() {
  	document.getElementById("brkoverlay").style.display = "none";
  	action = new Object();
	action.desc = "breakEnd";
	action.time = Date.now();
	action.timestamp = Date();
	actionArray.push(action);
	sendToPy("End Break");
}

function studyEnd() {
	document.getElementById("endoverlay").style.display = "block";
	action = new Object();
	action.desc = "taskEnd";
	action.time = Date.now();
	action.timestamp = Date();
	actionArray.push(action);
	sendToPy("Correct solutions: " + correct_counter);
	sendToPy("End time: " + Date());
	sendToPy("End");
}

//function endOfStudy() {
//	action = new Object();
//	action.desc = "end study";
//	action.time = Date.now();
//	action.timestamp = Date();
//	actionArray.push(action);
//	sendToPy("End");
//	alert("You have reached the end of the study. Thank you for participating. You may close the window now. Goodbye!");
//}

function resetTask() {
    CURRENT_INPUT_GRID = new Grid(3, 3);
    TEST_PAIRS = new Array();
    CURRENT_TEST_PAIR_INDEX = 0;
    $('#task_preview').html('');
    resetOutputGrid(false);
}

function refreshEditionGrid(jqGrid, dataGrid) {
    fillJqGridWithData(jqGrid, dataGrid);
    setUpEditionGridListeners(jqGrid);
    fitCellsToContainer(jqGrid, dataGrid.height, dataGrid.width, 600, 600);
    initializeSelectable();
}

function syncFromEditionGridToDataGrid() {
    copyJqGridToDataGrid($('#output_grid .edition_grid'), CURRENT_OUTPUT_GRID);
}

function syncFromDataGridToEditionGrid() {
    refreshEditionGrid($('#output_grid .edition_grid'), CURRENT_OUTPUT_GRID);
}

function getSelectedSymbol() {
    selected = $('#symbol_picker .selected-symbol-preview')[0];
    return $(selected).attr('symbol');
}

function showInstructions() {
	var x = document.getElementById("instructions");
 	if (x.style.display === "block") {
	  x.style.display = "none";
 	 } else {
   		 x.style.display = "block";
 	 }
	action = new Object();
	action.desc = "show instructions";
	action.time = Date.now();
	actionArray.push(action);
}

function setUpEditionGridListeners(jqGrid) {
    jqGrid.find('.cell').click(function(event) {
        cell = $(event.target);
        symbol = getSelectedSymbol();

        mode = $('input[name=tool_switching]:checked').val();
        if (mode == 'floodfill') {
            // If floodfill: fill all connected cells.
            syncFromEditionGridToDataGrid();
            grid = CURRENT_OUTPUT_GRID.grid;
            floodfillFromLocation(grid, cell.attr('x'), cell.attr('y'), symbol);
            syncFromDataGridToEditionGrid();

            if (typeof symbol !== 'undefined')
                PDDL.push("FILL " + cell.attr("x") + " " + cell.attr("y") + " " + symbol)
                console.log("user click Fill and at o\pos x and y = ..")
        }
        else if (mode == 'edit') {
            // Else: fill just this cell.
            setCellSymbol(cell, symbol);

            if (typeof symbol !== 'undefined')
                PDDL.push("EDIT " + cell[0].getAttribute("x") + " " + cell[0].getAttribute("y") + " " + symbol)
        }
    });

    //add drag and drop
    var clicking = false;

    jqGrid.find('.cell').mousedown(function(){
        clicking = true;
        mode = $('input[name=tool_switching]:checked').val();

        if (mode == 'trace') {
            // Else: fill just this cell.
            cell = $(event.target);
            symbol = getSelectedSymbol();
            setCellSymbol(cell, symbol);
            action = new Object();
			action.desc = "edit";
			action.x = cell[0].getAttribute("x");
			action.y = cell[0].getAttribute("y");
			action.color = symbol;
			action.time = Date.now();
			actionArray.push(action);
        }
    });

    jqGrid.find('.cell').mouseup(function(){
        clicking = false;
    })

    jqGrid.find('.cell').mousemove(function(){
        if(clicking == false) return;
        mode = $('input[name=tool_switching]:checked').val();

        if (mode == 'trace') {
            // Else: fill just this cell.

            cell = $(event.target);
            symbol = getSelectedSymbol();
            setCellSymbol(cell, symbol);
			action = new Object();
			action.desc = "edit";
			action.x = cell[0].getAttribute("x");
			action.y = cell[0].getAttribute("y");
			action.color = symbol;
			action.time = Date.now();
			actionArray.push(action);
            //if (typeof symbol !== 'undefined')
            //    PDDL.push("EDIT " + cell[0].getAttribute("x") + " " + cell[0].getAttribute("y") + " " + symbol)
        }
        // Mouse click + moving logic here

    });
}

function resizeOutputGrid(from_ui) {
    size = $('#output_grid_size').val();
    size = parseSizeTuple(size);
    height = size[0];
    width = size[1];
    jqGrid = $('#output_grid .edition_grid');
    syncFromEditionGridToDataGrid();
    dataGrid = JSON.parse(JSON.stringify(CURRENT_OUTPUT_GRID.grid));
    CURRENT_OUTPUT_GRID = new Grid(height, width, dataGrid);
    refreshEditionGrid(jqGrid, CURRENT_OUTPUT_GRID);
	action = new Object();
	action.desc = "resize grid";
	action.height = height;
	action.width = width;
	action.time = Date.now();
	actionArray.push(action);
    //if (from_ui) PDDL.push("RESIZE " + CURRENT_OUTPUT_GRID['height'] + " " + CURRENT_OUTPUT_GRID['width']);
}

function resetOutputGrid(from_ui) {
    syncFromEditionGridToDataGrid();
    CURRENT_OUTPUT_GRID = new Grid(3, 3);
    syncFromDataGridToEditionGrid();
    resizeOutputGrid(false);
    action = new Object();
	action.desc = "reset grid";
	action.time = Date.now();
	actionArray.push(action);

    if (from_ui) PDDL.push('RESET_GRID')
}

function copyFromInput() {
    syncFromEditionGridToDataGrid();
    CURRENT_OUTPUT_GRID = convertSerializedGridToGridObject(CURRENT_INPUT_GRID.grid);
    syncFromDataGridToEditionGrid();
    $('#output_grid_size').val(CURRENT_OUTPUT_GRID.height + 'x' + CURRENT_OUTPUT_GRID.width);

    //PDDL.push('COPY_INPUT');
    action = new Object();
	action.desc = "copyfrominput";
	action.time = Date.now();
	actionArray.push(action);
}

function fillPairPreview(pairId, inputGrid, outputGrid) {
    var pairSlot = $('#pair_preview_' + pairId);
    if (!pairSlot.length) {
        // Create HTML for pair.
        pairSlot = $('<div id="pair_preview_' + pairId + '" class="pair_preview" index="' + pairId + '"></div>');
        pairSlot.appendTo('#task_preview');
    }
    var jqInputGrid = pairSlot.find('.input_preview');
    if (!jqInputGrid.length) {
        jqInputGrid = $('<div class="input_preview"></div>');
        jqInputGrid.appendTo(pairSlot);
    }
    var jqOutputGrid = pairSlot.find('.output_preview');
    if (!jqOutputGrid.length) {
        jqOutputGrid = $('<div class="output_preview"></div>');
        jqOutputGrid.appendTo(pairSlot);
    }

    fillJqGridWithData(jqInputGrid, inputGrid);
    fitCellsToContainer(jqInputGrid, inputGrid.height, inputGrid.width, 250, 250);
    fillJqGridWithData(jqOutputGrid, outputGrid);
    fitCellsToContainer(jqOutputGrid, outputGrid.height, outputGrid.width, 250, 250);
}

function loadJSONTask(train, test) {
    resetTask();
    //enable submit button
    $('#submit_solution_btn').removeAttr('disabled');

    $('#modal_bg').hide();
    $('#error_display').hide();
    $('#info_display').hide();

    for (var i = 0; i < train.length; i++) {
        pair = train[i];
        values = pair['input'];
        input_grid = convertSerializedGridToGridObject(values)
        values = pair['output'];
        output_grid = convertSerializedGridToGridObject(values)
        fillPairPreview(i, input_grid, output_grid);
    }
    for (var i=0; i < test.length; i++) {
        pair = test[i];
        TEST_PAIRS.push(pair);
	}
    values = TEST_PAIRS[0]['input'];
    CURRENT_INPUT_GRID = convertSerializedGridToGridObject(values)
    fillTestInput(CURRENT_INPUT_GRID);
    CURRENT_TEST_PAIR_INDEX = 0;
    $('#current_test_input_id_display').html('1');
    $('#total_test_input_count_display').html(test.length);
    //initPDDL();
}

function loadTaskFromFile(e) {
    var file = e.target.files[0];
    TASK_ID = file['name'];
    if (!file) {
        errorMsg('No file selected');
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;

        try {
            contents = JSON.parse(contents);
            train = contents['train'];
            test = contents['test'];
        } catch (e) {
            errorMsg('Bad file format');
            return;
        }
        loadJSONTask(train, test);
    };
    reader.readAsText(file);
}

function presentTask() {
    var subset = "training";
    attemptArray =[]; //clear attempt array each time a task is presented
    actionArray = [];
    task = new Object();
    attempt = new Object();
    action = new Object();
    $.getJSON("https://api.github.com/repos/ahn-cj/ARC-behavioral/contents/eye-tracking/" + subset, function(tasks) {
      var task_presented = tasks[task_list[task_num]-1];

      TASK_ID = task_presented['name'];
      action.problem = TASK_ID;
      console.log(task_list[task_num]);
      console.log(TASK_ID);
      $.getJSON(task_presented["download_url"], function(json) {
          try {
              train = json['train'];
			  test = json['test'];
          } catch (e) {
              errorMsg('Bad file format');
              return;
          }
          loadJSONTask(train, test);
            if (task_list[task_num] > 40){
                copyFromInput(); //copy from input for the test one
            }
            else{ //convoluted way to copy from input and reset grid at the same time
                syncFromEditionGridToDataGrid();
                CURRENT_OUTPUT_GRID = convertSerializedGridToGridObject(CURRENT_INPUT_GRID.grid);
                syncFromDataGridToEditionGrid();
                $('#output_grid_size').val(CURRENT_OUTPUT_GRID.height + 'x' + CURRENT_OUTPUT_GRID.width);
                jqGrid = $('#output_grid .edition_grid');
                refreshEditionGrid(jqGrid, CURRENT_OUTPUT_GRID);
                CURRENT_OUTPUT_GRID = new Grid(1, 1);
                resizeOutputGrid(false)
            }
      })
      .error(function(){
        errorMsg('Error loading task');
      });
    })
    .error(function(){
      errorMsg('Error loading task list');
    });
    action.desc = "new problem";
	action.time = Date.now();
	actionArray.push(action);
	sendToPy("Task")
    showProgress();
}

function nextTestInput() {
    if (TEST_PAIRS.length <= CURRENT_TEST_PAIR_INDEX + 1) {
        errorMsg('No next test input. Pick another file?')
        return
    }
    CURRENT_TEST_PAIR_INDEX += 1;
    values = TEST_PAIRS[CURRENT_TEST_PAIR_INDEX]['input'];
    CURRENT_INPUT_GRID = convertSerializedGridToGridObject(values);
    fillTestInput(CURRENT_INPUT_GRID);
    $('#current_test_input_id_display').html(CURRENT_TEST_PAIR_INDEX + 1);
    $('#total_test_input_count_display').html(test.length);
}

function submitSolution() {
    syncFromEditionGridToDataGrid();
    reference_output = TEST_PAIRS[CURRENT_TEST_PAIR_INDEX]['output'];
    submitted_output = CURRENT_OUTPUT_GRID.grid;
    for (var i = 0; i < reference_output.length; i++){
        ref_row = reference_output[i];
        for (var j = 0; j < ref_row.length; j++){
            if (ref_row[j] != submitted_output[i][j]) {
                errorMsg(`Wrong solution. ${2 - error_counter} out of 3 attempts left.`);
				success = 0;
                error_counter = error_counter + 1;
                action = new Object();
				action.desc = "submit";
				action.time = Date.now();
				action.attempt_num = error_counter;
				action.outcome = "fail";
				actionArray.push(action);
                //attempt = new Object(); //reset attempt
                //action = new Object();
                //action.desc = "new attempt"
                //action.taskid = task_num;
				//action.time = Date.now();
                //action.attempt = error_counter;
                //actionArray.push(action);
        		  if (error_counter > 2){
        		  	updateAttempts();
					sendData();
					console.log("submitted");
					sendToPy("Submit");
	      			nextTask();
				  }
				  else{
				  	updateAttempts();
				  	console.log("submitted");
				  	sendToPy("Submit");
					//sendData();
				  }
                return
            }
        }

    }
    infoMsg('Correct solution!');
	success = 1;
	correct_counter = correct_counter + 1;
	action = new Object();
	action.desc = "submit";
	action.time = Date.now();
	action.attempt_num = error_counter + 1;
	action.outcome = "success";
	actionArray.push(action);
	updateAttempts();
	sendData();
	console.log("submitted");
	sendToPy("Submit");
	nextTask();
}

function fillTestInput(inputGrid) {
    jqInputGrid = $('#evaluation_input');
    fillJqGridWithData(jqInputGrid, inputGrid);
    fitCellsToContainer(jqInputGrid, inputGrid.height, inputGrid.width, 600, 600);
}

function copyToOutput() {
    syncFromEditionGridToDataGrid();
    CURRENT_OUTPUT_GRID = convertSerializedGridToGridObject(CURRENT_INPUT_GRID.grid);
    syncFromDataGridToEditionGrid();
    $('#output_grid_size').val(CURRENT_OUTPUT_GRID.height + 'x' + CURRENT_OUTPUT_GRID.width);
}

function initializeSelectable() {
    try {
        $('.selectable_grid').selectable('destroy');
        // PDDL.push("DESELECT")
    }
    catch (e) {
    }
    toolMode = $('input[name=tool_switching]:checked').val();
    if (toolMode == 'select') {
        infoMsg('Select some cells and click on a color to fill in, or press C to copy');
        $('.selectable_grid').selectable(
            {
                autoRefresh: false,
                filter: '> .row > .cell',
                start: function(event, ui) {
                    $('.ui-selected').each(function(i, e) {
                        $(e).removeClass('ui-selected');
                    });
                }
            }
        );
    }
}

// PDDL Action Tracking
//function downloadPDDL() {
//    var blob = new Blob([PDDL.join('\n')],
//                { type: "" });
//    saveAs(blob, TASK_ID.split('.')[0] + ".json");
//}

//function initPDDL() {
//    PDDL = [];
//    PDDL.push("GRID " + CURRENT_OUTPUT_GRID['height'] + " " + CURRENT_OUTPUT_GRID['width']);
//}

// Initial event binding.

$(document).ready(function () {
    $('#symbol_picker').find('.symbol_preview').click(function(event) {
        symbol_preview = $(event.target);
        $('#symbol_picker').find('.symbol_preview').each(function(i, preview) {
            $(preview).removeClass('selected-symbol-preview');
        })
        symbol_preview.addClass('selected-symbol-preview');
		action = new Object();
		action.desc = "select color";
		action.color = getSelectedSymbol();
		action.time = Date.now();
		actionArray.push(action);
        toolMode = $('input[name=tool_switching]:checked').val();
        if (toolMode == 'select') {
            $('.edition_grid').find('.ui-selected').each(function(i, cell) {
                symbol = getSelectedSymbol();
                setCellSymbol($(cell), symbol);

                if (typeof symbol !== 'undefined')
                    PDDL.push("SELECT_FILL " + " " + cell.getAttribute("x") + " " + cell.getAttribute("y") + " "+ symbol)
            });
        }
    });

    $('.edition_grid').each(function(i, jqGrid) {
        setUpEditionGridListeners($(jqGrid));
    });

    $('.load_task').on('change', function(event) {
        loadTaskFromFile(event);
    });

    $('.load_task').on('click', function(event) {
      event.target.value = "";
    });

    $('input[type=radio][name=tool_switching]').change(function() {
        initializeSelectable();
    });

    $('body').keydown(function(event) {
        // Copy and paste functionality.
        if (event.which == 67) {
            // Press C

            selected = $('.ui-selected');
            if (selected.length == 0) {
                return;
            }

            // Map Source/Target Value
            source = selected[0].parentElement.parentElement.parentElement.getAttribute("id");

            COPY_PASTE_DATA = [];
            for (var i = 0; i < selected.length; i ++) {
                x = parseInt($(selected[i]).attr('x'));
                y = parseInt($(selected[i]).attr('y'));
                symbol = parseInt($(selected[i]).attr('symbol'));
                COPY_PASTE_DATA.push([x, y, symbol]);

                var s = 0;
                if (source == "evalution-input-view")
                    s = 0;
                else if (source == "output_grid")
                    s = 1;
                PDDL.push("SELECT_COPY "  + x + " " + y + " " + symbol + " " + s);
            }
            infoMsg('Cells copied! Select a target cell and press V to paste at location.');

        }
        if (event.which == 86) {
            // Press P
            if (COPY_PASTE_DATA.length == 0) {
                errorMsg('No data to paste.');
                return;
            }
            selected = $('.edition_grid').find('.ui-selected');
            if (selected.length == 0) {
                errorMsg('Select a target cell on the output grid.');
                return;
            }

            jqGrid = $(selected.parent().parent()[0]);

            // Map Source/Target Value
            source = selected[0].parentElement.parentElement.parentElement.getAttribute("id");

            if (selected.length == 1) {
                targetx = parseInt(selected.attr('x'));
                targety = parseInt(selected.attr('y'));

                xs = new Array();
                ys = new Array();
                symbols = new Array();

                for (var i = 0; i < COPY_PASTE_DATA.length; i ++) {
                    xs.push(COPY_PASTE_DATA[i][0]);
                    ys.push(COPY_PASTE_DATA[i][1]);
                    symbols.push(COPY_PASTE_DATA[i][2]);
                }

                minx = Math.min(...xs);
                miny = Math.min(...ys);
                for (var i = 0; i < xs.length; i ++) {
                    x = xs[i];
                    y = ys[i];
                    symbol = symbols[i];
                    newx = x - minx + targetx;
                    newy = y - miny + targety;
                    res = jqGrid.find('[x="' + newx + '"][y="' + newy + '"] ');
                    if (res.length == 1) {
                        cell = $(res[0]);
                        setCellSymbol(cell, symbol);

                        var s = 0;
                        if (source == "evalution-input-view")
                            s = 0;
                        else if (source == "output_grid")
                            s = 1;
                        PDDL.push("SELECT_PASTE "  + cell.attr('x') + " " + cell.attr('y') + " " + symbol + " " + s);
                    }
                }
            } else {
                errorMsg('Can only paste at a specific location; only select *one* cell as paste destination.');
            }
        }
    });
});
