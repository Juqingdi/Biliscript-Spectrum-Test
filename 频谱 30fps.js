function uncompressA (input) {
	var numA = '';
	var output = '';
	for (var i = 0; i < input.length; i++) {
		if(input.charAt(i) == '('){
			i++;
			do{
				numA += input.charAt(i++);
			}
			while(input.charAt(i) != ')');
			numA = parseInt(numA, 16);
			for (var j = 0; j < numA; j++) {
				output += 'A';
			};
			numA = '';
		}
		else
			output += input.charAt(i);
	};
	return output;
}

function decode(input) {
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-=";
	var output = "";
	var chr1, chr2, chr3, enc1, enc2;
	var i = 0;
	var tail = '';

	while(i < input.length){
		if(input.charAt(i) != "'"){
			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 >> 2).toString(16);
			chr2 = ((enc1 % 4 << 2) + (enc2 >> 4)).toString(16);
			chr3 = (enc2 % 16).toString(16);
		}
		else{
			chr1 = chr2 = '';
			chr3 = input.substring(++i);
		}
		output = output + chr1 + chr2 + chr3;
	}

	return output;
}

function str2arr(str, length){
	if(length == null)
		length = 57;

	var j = 0;
	var arr = [];
	var i = 0;

	while(i < str.length){
		j++;
		if(j == 1)
			var subArr = [];
		subArr.push(parseInt(str.substr(i,2), 16));
		if(j == length){
			arr.push(subArr);
			j = 0;
		}
		i+=2;
	}

	return arr;
}

function initAnime(){
	spectrumCanvas = $.createCanvas({lifeTime:0, x:0, y:0});
	spectrumCanvas.y = DEFAULT_HEIGHT - spectrumAreaHeight - 5;

	spectrumShape = $.createShape({lifeTime:0, x:0, y:0, parent:spectrumCanvas});
	spectrumGraph = spectrumShape.graphics;

	matrix = $.createMatrix();
	matrix.createGradientBox(meterWidth, spectrumAreaHeight, Math.PI*0.5, 0, 0); 

	for (var i = 0; i < meterNum; i++) {
		var cap = $.createShape({x:0,y:0,lifeTime:0,parent:spectrumCanvas});
		cap.x = 12 * i;
		cap.y = spectrumAreaHeight;
		cap.graphics.beginFill(0xFFFF00);
		cap.graphics.drawRect(0,0,meterWidth,2);
		cap.graphics.endFill();
		caps.push(cap);
	};
}

function anime(){
	if(Player.state != 'playing')
		return;

	if(index < 0 || index >= arr.length){
		index++;
		return;
	}

	currentData = arr[index];
	spectrumGraph.clear();

	spectrumGraph.beginGradientFill('linear',[0xff0000,0x0000ff],[1,1],[0,255],matrix,'reflect','rgb');
	for (var i = 0; i < meterNum; i++) {
		meterHeight = currentData[i] / 256 * spectrumAreaHeight;
		if(meterHeight < 2)
			meterHeight = 2;
		spectrumGraph.drawRect(meterOffset*i, spectrumAreaHeight - meterHeight, meterWidth, meterHeight);

		if(caps[i].y + 2 >= spectrumAreaHeight - meterHeight)
			caps[i].y = spectrumAreaHeight - meterHeight;
		else
			caps[i].y+=2;
	}
	spectrumGraph.endFill();

	index++;
}

function checkJumped(){
	if( (Player.time - prevTime) * (Player.time - prevTime) > 90000){
		index = Math.round((Player.time / 1000) * $.frameRate) + indexOffset;
	}

	prevTime = Player.time;
}

function scaleScreen(){
	if(Player.width != screenWidth || Player.height != screenHeight) {
		screenWidth = Player.width;
		screenHeight = Player.height;

		spectrumCanvas.scaleX = screenWidth / DEFAULT_WIDTH;
		spectrumCanvas.scaleY = screenHeight / DEFAULT_HEIGHT;
		spectrumCanvas.y = Player.height - (spectrumAreaHeight + 5) * spectrumCanvas.scaleY;
	}
}


var DEFAULT_WIDTH = 682;
var DEFAULT_HEIGHT = 438;
var spectrumAreaWidth = DEFAULT_WIDTH;
var spectrumAreaHeight = 300;
var data, currentData;
var arr;
var spectrumCanvas, spectrumShape, spectrumGraph, matrix;
var meterNum = 57;
var meterWidth = 10;
var meterDistance = 2;
var meterOffset = meterWidth + meterDistance;
var meterHeight = 0;
var screenWidth = 0, screenHeight = 0;
var prevTime = 0;
var indexOffset = 0; //推迟为负数，提前为正数
var index = indexOffset;
var caps = [];

function main(){
	$G._set('running',true);
	Player.pause();
	$.frameRate = 30;
	indexOffset = -1.7 * $.frameRate;
	var messageBoard = $G._get('message');
	data = $G._get('data');
	arr = str2arr(decode(uncompressA(data)));
	messageBoard.remove();
	Player.seek(0);
	Player.play();

	initAnime();
	$.root.addEventListener('enterFrame', anime);
	$.root.addEventListener('enterFrame', checkJumped);
	$.root.addEventListener('enterFrame', scaleScreen);
	// debug();
}

function debug(){
	Player.keyTrigger(function(keyCode){
		trace('time: '+Player.time);
		trace('index: '+index);
		}, 2147483647);
}

if($G._get('running') != true && $G._get('data') != null)
	main();