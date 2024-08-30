<a href="http://guessthesong.ata243y.com/">Demo for the project</a>

<h2>About the Game</h2>
The game requires at least 2 players to start. Once 2 players have joined, the game begins. The game consists of 6 rounds, each featuring a different song, and players must guess the name of the song. At the end of the 6 rounds, the player with the most points will be displayed as the winner, and the game will restart with different songs from the database.

<h2>How I Created the App / Technologies Used</h2>

The app was created using HTML, CSS, and vanilla JavaScript on the client side. Node.js was used for the backend server.

The connection between the client and the backend server is established via WebSocket using the Socket.io library.

The music data seen by clients in each round is fetched from the Firestore database on the backend, and the Howler.js audio library is used on the client side for playing the sound.
