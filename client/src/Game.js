import React from "react";
import axios from "axios";

import PickFrom4 from "./PickFrom4";
import Pubquiz from "./PubQuiz";
import Settings from "./Settings";
import TypeTheAnswer from "./TypeTheAnswer";
import Match from "./Match";

function Game(props){
    const [gameSettings, setGameSettings] = React.useState({
        playlist: "",
        gameMode: "pickFrom4",
        songStart: "beginning",
        numOfQuestions: 5,
        questionType: "title",
        time:10
    });
    const [tracks, setTracks] = React.useState([]);
    const [gameScreen, setGameScreen] = React.useState('settings');
    const [creatingQuiz, setCreatingQuiz] = React.useState(false);
    
    // FORM HANDLERS
    const handleChange = (event)=>{
        const {name, value, type} = event.target;
        setGameSettings(prevGameSettings =>{
            return {...prevGameSettings,
                [name]:type === 'number' ? Number(value): value
            };
        });
    };
    const handleSubmit = async(event)=>{
        setCreatingQuiz(true);
        event.preventDefault();
        const res = await axios.get(`/api/v1/data/tracks?token=${props.token.access_token}&playlistId=${gameSettings.playlist}`);
        try {
            setCreatingQuiz(false);
            if(res.data){
                setTracks(res.data.tracksInfo);
                setGameScreen(gameSettings.gameMode);
            };
        } catch (error) {
            console.log(error);
        };
    };
    
    const handleGameScreen = (screen)=>{
        setGameScreen(screen);
    };

    const creatingQuizMessage = <div className="creating-quiz">Creating Quiz...</div>
    // GAME SCREENS
    let screenComponent;
    switch (gameScreen){
        case 'settings': screenComponent = <Settings userPlaylists={props.userPlaylists} featuredPlaylists={props.featuredPlaylists} gameSettings={gameSettings} handleChange={handleChange} handleSubmit={handleSubmit} handleMenu={props.handleMenu}/>; 
        break;
        case  'pickFrom4': screenComponent = <PickFrom4 tracks={tracks} gameSettings={gameSettings} token={props.token} handleGameScreen={handleGameScreen} handleMenu={props.handleMenu}/>;
        break;
        case  'pubQuiz': screenComponent = <Pubquiz tracks={tracks} gameSettings={gameSettings} token={props.token} handleGameScreen={handleGameScreen} handleMenu={props.handleMenu}/>;
        break;
        case  'typeTheAnswer': screenComponent = <TypeTheAnswer tracks={tracks} gameSettings={gameSettings} token={props.token} handleGameScreen={handleGameScreen} handleMenu={props.handleMenu}/>;
        break;
        case  'match': screenComponent = <Match tracks={tracks} gameSettings={gameSettings} token={props.token} handleGameScreen={handleGameScreen} handleMenu={props.handleMenu}/>;
        break;
        default: screenComponent = "";
      };

    return(
        <div>
            {screenComponent}
            {creatingQuiz && creatingQuizMessage}
        </div>
    );
};

export default Game;