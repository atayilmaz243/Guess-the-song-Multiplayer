live server hosting the app: ...

<h2>About the game</h2>
The game needs at least 2 player to start. After 2 player join the game starts. Game consists of 6 round each round playing different song and player take a guess about the name of the song. At the end of the 6 round the players who has most points will be displayed as winner and game repeats itself with different songs in the database.


<h2>How I created the app / Technologies used</h2>

The app is created based on html,css and vanilla javascript on client side. NodeJS used for backend server.

The connection between client and backend server established via websocket using library socket.io

The music data seen by clients on each round is fetched from firestore database by backend server and sended to client via websocket.
