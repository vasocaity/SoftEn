var player = {
	id: "",
	score: 0,
	highName: "",
	highScore: 0,
	num: 0,
	PlayerWin: "",
	counter: 0
};
var totalPlayer = 0;
var socket = io();
var this_player;

function addScoreToserver(position) {
	socket.emit('addScore', { //send position from client to server when client corect answer
		position: position
	});

}
socket.on('checkAmoutPlayer', function (data) {
	totalPlayer = data.totalPlayer;
	document.getElementById("totalPlayer").innerHTML = totalPlayer;
});
socket.on('createPlayer', function (data) {
	player.id = data.id;
	player.score = data.score;
	player.highScore = data.highScore;
	document.getElementById("name").innerHTML = null;
	document.getElementById("name").innerHTML += player.id;
});

socket.on('Point', function (data) { //function แสดงpoint ของแต่ละ player
	if (data.score1 == null) {
		$("#p1_score").html("0 points");
	} else {
		$("#p1_score").html(data.score1 + " points");
		$("#p1_score").css("color", "#008800");

	}
	if (data.score2 == null) {
		$("#p2_score").html("0 points");
	} else {

		$("#p2_score").html(data.score2 + " points");
		$("#p2_score").css("color", "#660000");

	}
});

socket.on('T', function (data) {
	var turn = data.turn;
	if (turn == null) {
		turn = 1;
	}
	alert("ตา Player " + turn);
	document.getElementById("Wow").innerHTML = turn;
});
socket.on('Tim', function (data) {
	var time = data.time;
	time != 0 ? document.getElementById("Time").innerHTML = 60 - time : document.getElementById("Time").innerHTML = 0;

});
socket.on('sendDone', function (data) { // functionที่คอยรับ position ที่ถูกต้องจากผู้เล่น และแสดงผล
	var Done = data.DonePosition;
	var answer = puzz.data[Done].answer;
	var Setbox = $('.position-' + Done + ' input'); //
	for (var i in Setbox) {
		Setbox[i].value = answer[i]; //เมื่อคำตอบถูกต้องก็จะทำการ แสดงคำตอบบนกระดานไปยังplayer ทั้งสอง
		Setbox[i].disabled = true;
	}	
	var currVal;
	currVal = $('.position-' + Done + ' input')
		.map(function () {
			return $(this)
				.val()
				.toLowerCase();
		})
		.get()
		.join('');
	if (valToCheck===currVal) {

		$('.active')
			.addClass('done')
			.removeClass('active');

		$('.clues-active').addClass('clue-done');
	}
});

socket.on('Winner', function (data) { //เมื่อมีผู้เล่นชนะก็จะทำการแสดงว่าใครคือผู้ชนะ
	player.highName = data.highId;
	player.score = data.score;
	var msg = 'Player';
	var message = 'Win !!!!!!!';
	if (document.getElementById("Winname") != null) {
		document.getElementById("Win").innerHTML = msg;
		document.getElementById("Winname").innerHTML = player.highName;
	}
	document.getElementById("WinScore").innerHTML = message;
});