const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const {fetchAudios,generateRandomNumbers} = require('./firebase');


const app = express();
const server = createServer(app);
const io = new Server(server);


app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


const backEndPlayers = {}
let playerCount = 0


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('initPlayer',(username) => {
	  backEndPlayers[socket.id] = {
	  	score: 0,
	  	username,
	  	avatar: ".",
			}
		playerCount += 1
  })


  // socket.on('init',({username,avatar}) => {
	//   backEndPlayers[socket.id] = {
	//   	score: 0,
	//   	username,
	//   	avatar,
	// 		}
	// 	playerCount += 1
 	// })


  socket.on('disconnect',() => {
  	if (backEndPlayers[socket.id])
  	{
	  	delete backEndPlayers[socket.id]
	  	playerCount -= 1
  	}

  })

  socket.on('playerChoice',(choice) => {
  	if (backEndPlayers[socket.id])
  		backEndPlayers[socket.id].choice = choice
  })

});

const DURATION = 15
let state = -1
let timeleft = DURATION
let round = -1
let randomNumbers = [1,2,3,4]

let audios = null
const MAX_ROUND = 6

let fetching = false

setInterval(() => {
	io.emit('updatePlayers',backEndPlayers)

	const roundInfo = {}

	if (state == -1)
	{
		 // transition to preparing stage
		if (playerCount >= 2)
		{
			for (const id in backEndPlayers)
			{
				backEndPlayers[id].score = 0
			}
			state = 0
			fetching = false
		}
	}
	else if (state == 0) // preparing stage
	{
			// fetching sound info from firestore database
		if (!fetching) // fetch only once
		{
			fetching = true
			fetchAudios(MAX_ROUND)
			.then(FetchedAudios => { // preparing is done
    			console.log('Fetched audios:', FetchedAudios);
    			audios = FetchedAudios // !!!!!
    			state = 50
					timeleft = DURATION
					round = 0
					randomNumbers = generateRandomNumbers(4,4)
			})
			.catch(error => { // error fetching go to state -1 and repeat process.
    			console.error('Error fetching audios:', error);
    			state = -1
			})
		}
	}
	else if(state == 50) // on going round
	{
			if(timeleft < 0)
			{
				for (const id in backEndPlayers) // increasing score if player's choice is correct
				{
					const backEndPlayer = backEndPlayers[id]
					if (backEndPlayer.choice && backEndPlayer.choice == audios[round].answer)
					{
						backEndPlayer.score += 1
					}
				}

				round++
				timeleft = DURATION
				if (round >= MAX_ROUND)
				{
					state = 100
					timeleft = 15
				}
				randomNumbers = generateRandomNumbers(4,4)
			}
			else
			{
				const options = [audios[round].answer,audios[round].wchoice1,audios[round].wchoice2,audios[round].wchoice3]

				roundInfo.audio = {
					round,
					src:audios[round].link,
					A: options[randomNumbers[0]-1],
					B: options[randomNumbers[1]-1],
					C: options[randomNumbers[2]-1],
					D: options[randomNumbers[3]-1],
					img: audios[round].mlogo}
			}
	}
	else // state 100 - game is finished. 
	{
		if (timeleft < 0)
		{
			state = -1
		}
	}

	// console.log(state + " : " + timeleft + "\n")
	io.emit('updateRound',{state,timeleft,audio: roundInfo.audio})


},20)


setInterval(() => {
	timeleft -= 1
},1000)

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});