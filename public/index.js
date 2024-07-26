


const socket = io()
const leaderboard = document.querySelector('#leaderboard')


const frontEndPlayer = {}
let round = -1
let firework_on = false

Howler.volume(0.5)


socket.on('updatePlayers',(backEndPlayers) => {

	for (const id in backEndPlayers)
	{
		const backEndPlayer = backEndPlayers[id]

		if (frontEndPlayer[id]) // if player exists 
		{

			frontEndPlayer[id].score = backEndPlayer.score
			const player_leaderboard = document.querySelector(`div[data-id="${id}"]`)
			player_leaderboard.setAttribute('data-score',backEndPlayer.score)
			const scoreLabel = document.querySelector(`span[score-id="${id}"]`)
			scoreLabel.innerHTML = `${backEndPlayer.score}`


		}
		else
		{
			frontEndPlayer[id] = {
				username: backEndPlayer.username,
				score: backEndPlayer.score
				}
// `<div data-id = ${id} style = "color: white"> ${backEndPlayer.username} : ${backEndPlayer.score}</div>`
			leaderboard.innerHTML += 
			`<div class = "left-border" data-score = "${backEndPlayer.score}" data-id = "${id}" style = "width: 80%; height: 40px; background-color: rgb(30,30,30); margin:0px ; padding: 0px; margin-left:15px; border-radius: 4px; display: flex; align-items: center; justify-content: space-between;">
							<span style = "margin-left: 20px">${backEndPlayer.username}</span>
							<span style = 'margin-right: 10px; color: rgb(254 240 138);'>
								<span score-id = "${id}">${backEndPlayer.score}</span> pts
							</span>

			</div>`;
		}
		// console.log(backEndPlayer)

	}

	for (const id in frontEndPlayer)
	{
		if (!backEndPlayers[id]) // player is disconnected 
		{
			delete frontEndPlayer[id]
			const player_leaderboard = document.querySelector(`div[data-id="${id}"]`)	
			player_leaderboard.parentNode.removeChild(player_leaderboard)
		}
	}


	const leaderboardArray = Array.from(leaderboard.querySelectorAll('div'))
	// console.log(leaderboardArray)

    leaderboardArray.sort((a,b) => {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))
        return scoreB-scoreA
    })

    leaderboardArray.forEach(element => {
        leaderboard.removeChild(element)
    })

    leaderboardArray.forEach(element => {
        leaderboard.appendChild(element)
    })

})

let displayActivity = {
	preparing: false,
	waiting: false,
	ongoing: false,
	finished : false
}


let lastTimeUpdate = -1

const FADE_TIME = 4 // in seconds
let state = -1

socket.on('updateRound',(stateInfo) => {
	state = stateInfo.state
	const timeleft = stateInfo.timeleft
	// console.log("state: " + state)
	// console.log("timeleft: " + timeleft + "\n")

	// console.log(state)

	let mainDisplay = null

	if (state == -1) // waiting for player
	{
		mainDisplay = document.querySelector('#waiting')
		const progressBar = document.querySelector('#progress-bar')
		progressBar.style.width = '100%'
		progressBar.style.backgroundColor = 'rgb(241 245 249)'

	}
	else if (state == 0) // preparing
	{
		mainDisplay = document.querySelector('#waiting')
		document.querySelector('#waitingInfo1').innerHTML = `Preparing for the game..` // optimize further
		document.querySelector('#waitingInfo2').innerHTML = `` // optimize further
	}
	else if (state == 50) // ongoing round
	{
		mainDisplay = document.querySelector('#ongoing')
		if (lastTimeUpdate != stateInfo.timeleft && stateInfo.timeleft >= 0)
		{
			lastTimeUpdate = stateInfo.timeleft
			const progressBar = document.querySelector('#progress-bar')

			// console.log(timeleft)

			const DURATION = 15
			if (timeleft == DURATION)
			{
				progressBar.style.width = '0%'
			}
			
			if (timeleft > DURATION/2)
			{
				progressBar.style.backgroundColor = 'rgb(25,135,85)';
			}
			else if(timeleft > DURATION/5)
			{
				progressBar.style.backgroundColor = 'rgb(255,193,3)';
			}
			else
			{
				progressBar.style.backgroundColor = 'rgb(220,54,69)';
			}

			if (timeleft > 0 ) // 12-4
			{
			    gsap.to(progressBar.style,{
		            width : `${100-(100/15*(timeleft-1))}%`,
		            duration : 1,
		            // console.log(`${100-(100/15*(timeleft-1))}%`)
		            ease: 'linear'
		        })
		        // console.log(`${100-(100/15*(timeleft-1))}%`)
			}

		}

		const BackEndAudio = stateInfo.audio

		if (BackEndAudio && round != BackEndAudio.round)
		{
			round = BackEndAudio.round

			document.querySelector('#og-roundCounter').innerHTML = `${round+1}/6`
			// console.log('deneme')

			// console.log(BackEndAudio)

			unselectRadioButton()

			document.querySelector(`label[choice="A"]`).innerHTML = BackEndAudio.A
			document.querySelector(`label[choice="B"]`).innerHTML = BackEndAudio.B
			document.querySelector(`label[choice="C"]`).innerHTML = BackEndAudio.C
			document.querySelector(`label[choice="D"]`).innerHTML = BackEndAudio.D

			const audio = {}
			audio.sound = new Howl({
			  src: [BackEndAudio.src],
			  autoplay: false,
			  volume: 0
			})


			const start_fadeOut = timeleft >= 10 ? (timeleft-(FADE_TIME+1)) : timeleft/2 
			const duration_fadeIn = Math.min(FADE_TIME,start_fadeOut)
			const duration_fadeOut = Math.min(timeleft-start_fadeOut,FADE_TIME)

			// console.log("timeleft " + timeleft)
			// console.log("start_fadeOut " + start_fadeOut)
			// console.log("duration_fadeIn " + duration_fadeIn)
			// console.log("duration_fadeOut " + duration_fadeOut)
			// console.log("\n")
			audio.sound.play()
			audio.sound.fade(0,1,duration_fadeIn*1000)

			setTimeout(() => {
				audio.sound.fade(1,0,duration_fadeOut*1000)
				setTimeout(() => {
				  audio.sound.stop();
				  // console.log('stop')
				}, duration_fadeOut*1000);
			},start_fadeOut*1000)
		}

	}
	else if (state == 100) // finished round 
	{

		if (!firework_on)
		{
			const container = document.getElementById('finished');
			if (container)
			{
				firework_on = true
	            const fireworks = new Fireworks.default(container)
				fireworks.start()


				const canvas = document.querySelector('canvas')
				canvas.id = 'fireworks-canvas';


				setTimeout(() => {
					fireworks.stop()
					container.removeChild(canvas)
					firework_on = false
				},stateInfo.timeleft*1000)
			}
		}
		round = -1
		mainDisplay = document.querySelector('#finished')
		if (lastTimeUpdate != stateInfo.timeleft && stateInfo.timeleft >= 0)
		{
			// lastTimeUpdate = stateInfo.timeleft
			// mainDisplay.innerHTML = `<span> finished..      timeleft:${stateInfo.timeleft} </span>`
			lastTimeUpdate = stateInfo.timeleft
			const progressBar = document.querySelector('#progress-bar')
			progressBar.style.backgroundColor = 'rgb(11,110,253)';
			// console.log(timeleft)

			const DURATION = 15
			if (timeleft == DURATION)
			{
				progressBar.style.width = '0%'
			}
			

			if (timeleft > 0) 
			{
			    gsap.to(progressBar.style,{
		            width : `${100-(100/DURATION*(timeleft-1))}%`,
		            duration : 1,
		            // console.log(`${100-(100/15*(timeleft-1))}%`)
		            ease: 'linear'
		        })
			}

		}

		const leaderboardArray = Array.from(leaderboard.querySelectorAll('div'))
		const first_place = leaderboardArray[0]
		const second_place = leaderboardArray[1]
		const third_place = leaderboardArray[2]

		if (first_place)
		{
			const id = first_place.getAttribute('data-id')
			document.querySelector('#gold-winner').innerHTML = frontEndPlayer[id].username
		}

		if (second_place)
		{
			const id = second_place.getAttribute('data-id')
			document.querySelector('#silver-winner').innerHTML = frontEndPlayer[id].username
		}

		if (third_place)
		{
			const id = third_place.getAttribute('data-id')
			document.querySelector('#bronze-winner').innerHTML = frontEndPlayer[id].username
		}

	}


	for (const label in displayActivity)
	{
		if (label === mainDisplay.getAttribute('id'))
		{
			if (!displayActivity[label])
			{
				mainDisplay.style.display = 'flex'
				displayActivity[label] = true
				// console.log('enabled: '+ label)
			}
		}
		else
		{
			if (displayActivity[label])
			{
				document.querySelector(`#${label}`).style.display = 'none'
				displayActivity[label] = false
				// console.log('disabled: ' + label)
			}
		}
	}


})



setInterval(() => {

	if (state == 50)
	{
		const options = document.getElementsByName('options-base')
		let selectedID = null

		// console.log(options)
		for (const option of options)
		{
			if (option.checked)
			{
				selectedID = option.getAttribute('id')
				break
			}
		}
		// console.log(selectedOption)
		if (selectedID)
		{
			const selectedOption = document.querySelector(`label[for="${selectedID}"]`).innerHTML
			socket.emit('playerChoice',selectedOption)
		}
	}
},50)


const usernameForm = document.querySelector('#usernameForm')
usernameForm.addEventListener('submit',(event) => {
	event.preventDefault()

	const username = document.querySelector('#usernameInput').value

	if (username.length >= 3 && username.length <= 8)
	{
		document.querySelector('#enterancePage').style.display = 'none'
		socket.emit('initPlayer',username)
	}
	else
	{
		document.querySelector('#username-validation').style.display = 'block'
	}
})


document.querySelector('#customRange1').addEventListener('input',(event) => {
	Howler.volume((event.target.value/100))
})



function unselectRadioButton() {
    // Get all radio buttons
    var radios = document.getElementsByName('options-base');
    // Loop through all radio buttons and uncheck them
    for (var i = 0; i < radios.length; i++) {
        radios[i].checked = false;
    }
}

document.addEventListener('DOMContentLoaded',() => {
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

	document.querySelector('#github').addEventListener('click',() => {
		window.open('https://github.com/atayilmaz243/Guess-the-song-Multiplayer', '_blank');
	})

	document.querySelector('#portfolio').addEventListener('click',() => {
		window.open('https://atayilmaz243.github.io/portfolio/', '_blank');
	})
})

