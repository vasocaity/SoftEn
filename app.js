var express = require('express');
var app = express();
var server = require('http').Server(app);
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client/'));
server.listen(3000);


var sList = {};
var counter = 0;
var io = require('socket.io')(server, {});
var highScore = 0;
var highId = "";
var PlayerWin = "";
var num = 0;
var done = 0;
var turn = 1;
var time = 0;
var timeLimit = 60; //ระยะเวลาในการตอบคำถามของแต่ละ player
var checkPosition = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //list ของคำตอบทั้งหมด
io.sockets.on('connection', function (socket) {
	counter++;
	++num;
	socket.id = counter;
	socket.score = 0;
	sList[socket.id] = socket;

	//console.log("Now have " + num + " player");
	//ส่งหา client ทุกคนว่า player ไหนเข้ามาไปบ้าง

	socket.emit('createPlayer', {
		id: socket.id,
		score: socket.score,
		totalPlayer: num
	});
	socket.emit('checkAmoutPlayer', {
		totalPlayer: num
	});
	socket.emit('Point', {
		score: socket.score,
		Player: socket.id
	});

	console.log("Have a New Player: Player " + socket.id);

	socket.on('addScore', function (data) {
		if (checkPosition[data.position] == 1) { //ถ้า positionถูกทำไปแล้วจะไม่ให้ทำซ้ำ
			console.log(checkPosition[data.position] + " has done");
		}
		if (socket.id == turn && counter == 2) {

			if (checkPosition[data.position] == 0) {

				checkPosition[data.position] = 1;
				socket.score++;
				done++; //เพิ่มค่า done เพื่อตรวจสอบว่าตอบคำถามครบหรือยัง
				console.log(">>> " + done);
				console.log("Player " + socket.id + " score++, score: " + socket.score);
				sendscoreback(socket);
				sendDone(socket, data.position);
			}
			//เปลี่ยนเทิร์น	
			if (turn == 1) {
				turn = 2;
			} else if (turn == 2) {
				turn = 1;
			}
			time = 0;
			socket.broadcast.emit('T', {
				turn: turn
			}); //ส่ง turn ไปให้clientว่า ถึงตาของใคร
		}
	});
	socket.on('disconnect', function () {
		console.log('Player  ' + socket.id + ' disconnected');
		--num;
		console.log("Now have " + num + " player");
		if (socket.id == 1) {
			delete sList[socket.id];
			counter = 0;
		} else {
			if (counter != 0) {
				counter--;
			}
			delete sList[socket.id];
		}

	});

	setInterval(function () { //function นับเวลา
		if (counter == 2) {
			time++;
		} else if (counter == 1) {
			time = 0;
		}
		if (time >= timeLimit) {
			time = 0;
			if (turn == 1) {
				turn = 2;
			} else {
				turn = 1;
			}
			socket.broadcast.emit('T', {
				turn: turn
			}); // ส่งturn ไปยัง client
		}
		socket.broadcast.emit('Tim', {
			time: time
		}); //ส่งเวลาแต่ละรอบไปให้ client
	}, 2000);
});

function sendscoreback(socket) { //ส่งคะแนนของแต่ละคนไปแสดงที่client
	var score1, score2;
	if (sList[1] == null) {
		score1 = 0;
	} else {
		score1 = sList[1].score;
	}
	if (sList[2] == null) {
		score2 = 0;
	} else {
		score2 = sList[2].score;
	}
	socket.broadcast.emit('Point', {
		score1: score1,
		score2: score2
	});

	if (done == 10) {
		console.log(done);
		score = socket.score;
		highId = socket.id;
		socket.broadcast.emit('Winner', {
			score: socket.score,
			highId: highId
		});

	}
}

function sendDone(socket, DonePosition) { //fucntion ส่งpositionที่ถูกต้องส่งกลับไปให้ client เพื่อแสดงคำตอบบนกระดาน
	socket.broadcast.emit('sendDone', {
		DonePosition: DonePosition
	});
}