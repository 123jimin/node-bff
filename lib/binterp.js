/**
**  binterp.js - BrainFuck interpreter
**         License: WTFPL
**/

var _default_printer = function default_printer(data, callback){
	callback();
}, _default_reader = function default_getchar(callback){
	callback([0, 0, 0, 0]);
}, _default_debugger = function default_debugger(debug_info, callback){
	callback();
};

var BI = function BrainFuckInterpreter(option, print, read, debug){
	if(typeof option == 'function'){
		debug = read;
		read  = print
		print = option;
		option = {};
	}
	this.option = option;
	this._print = print || _default_printer;
	this._read  = read  || _default_reader;
	this._debug = debug || _default_debugger;
};

var INIT_ARR_SIZE = 1024,
	INIT_STACK_SIZE = 16;
BI.prototype.execute = function BI$execute(bir, done){
	var self = this;

	var arr_size = INIT_ARR_SIZE,
		arr = new Uint8Array(arr_size);
	
	var arr_ptr = 0,
		current_block = bir.root,
		stack_size = INIT_STACK_SIZE,
		stack = new Uint32Array(stack_size),
		stack_top_ptr = 0;
	
	var print_buffer = [],
		read_buffer = [];
	
	var done_err = function(msg){
		done(new Error(msg), arr, arr_ptr);
	}, flush_print_buffer = function(callback){
		if(print_buffer.length){
			self._print(print_buffer, function(){
				print_buffer = []; callback();
			});
		}else{
			callback();
		}
	};
	
	(function execute(){
		outer_loop: for(;;){
			var curr = stack[stack_top_ptr]++;
			while(curr >= current_block[1].length){
				if(stack_top_ptr == 0) break outer_loop;
				else if(arr[arr_ptr]){
					curr = 0;
					stack[stack_top_ptr] = 1;
				}else{
					curr = stack[--stack_top_ptr]++;
					current_block = current_block[0].parent;
				}
			}
			var curr_elem = current_block[1][curr];
			switch(curr_elem[0].name){
				case 'move':
					arr_ptr += curr_elem[1];
					if(arr_ptr < 0){
						done_err("Tried to access array with negative index");
						return;
					}
					if(arr_ptr >= arr_size){
						var new_arr = new Uint8Array(arr_size*2);
						for(var i=0; i<arr_size; i++) new_arr[i] = arr[i];
						arr = new_arr; arr_size *= 2;
					}
					break;
				case 'add':
					arr[arr_ptr] += curr_elem[1];
					break;
				case 'write':
					print_buffer.push(arr[arr_ptr]);
					if(arr[arr_ptr] == 10){
						flush_print_buffer(execute); return;
					}
					break;
				case 'read':
					if(read_buffer.length){
						arr[arr_ptr] = read_buffer.shift();
					}else{
						self._read(function(data){
							read_buffer = data.slice();
							execute();
						});
						return;
					}
					break;
				case 'debug':
					break;
				case 'loop':
					if(arr[arr_ptr]){
						if(++stack_top_ptr >= stack_size){
							var new_stack = new Uint32Array(stack_size);
							for(var i=0; i<stack_size; i++) new_stack[i] = stack[i];
							stack = new_stack; stack_size *= 2;
						}
						stack[stack_top_ptr] = 0;
						current_block = curr_elem[1];
					}
					break;
				default:
					done_err("Unknown instruction: "+curr_elem[0].name);
					return;
			}
		}
		
		flush_print_buffer(done.bind(null, null, arr, arr_ptr));
	}());
};

module.exports = BI;
