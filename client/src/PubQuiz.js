import React from "react";
import axios from "axios";

import PubQuizAnswers from "./PubQuizAnswers";
import {ReactComponent as PlayAgainIcon } from './img/repeat.svg';
import {ReactComponent as NextIcon } from './img/next.svg';

function Pubquiz(props){
    const [questions, setQuestions] = React.useState([]);
    const [currentQ, setCurrentQ] = React.useState("");
    const [isInProgress, setIsInProgress] = React.useState(false);
    const [playAgainShown, setPlayAgainShown] = React.useState(false);
    const [gameEnded, setGameEnded] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [usersAnswers, setUsersAnswers] = React.useState([]);
    
    const handleChange = (event)=>{
        const {value} = event.target;
        setUsersAnswers(prevArray =>{
            let newArr =  prevArray.map((a,i) =>{
                    if(i === currentQ){
                        return value;
                    } else {
                        return a;
                    };
            });
            return newArr;
        });
    };

    // CALLBACK FUNCTIONS
    const nextQuestion = React.useCallback(()=>{       
        if(currentQ + 1 <questions.length){
            setCurrentQ(prevCurrentQ => {
                let newCurrentQ = prevCurrentQ + 1;
                return newCurrentQ;
            });
            setPlayAgainShown(false);
        };
        // When automatic skip on last question - - NOW ONLY FOR ERRORS - SHOULDNT HAPPEN
        if(currentQ + 1 === questions.length){
            setGameEnded(true);
        };
    },[currentQ, questions.length]);
    
    const playTrack = React.useCallback(async (uri, start)=>{
        try {
            const res = await axios.get(`/api/v1/playback/start?&token=${props.token.access_token}&track=${uri}&start=${start}`);
            console.log(res.data.msg);
        } catch (error) {
            console.log(error);
            // NOW ONLY FOR ERRORS - SHOULDNT HAPPEN
            setMessage("Song can't be played. Skipping question");
            setTimeout(()=>{
                nextQuestion();            
                setMessage('');
            }, 3000);
        };
    },[props.token.access_token, nextQuestion]);
    
    const pausePlayback = React.useCallback(async ()=>{
        try {
            const res = await axios.get(`/api/v1/playback/pause?&token=${props.token.access_token}`);
            console.log(res.data.msg);
        } catch (error) {
            console.log(error);
        }
    },[props.token.access_token]);
    
    const createQuestions = React.useCallback (() =>{
        let tracksCopy = props.tracks.map(track => track);
        let questionArray = [];
        for(let i=0; i<props.gameSettings.numOfQuestions && i<tracksCopy.length;i++){
                let randomNum = Math.floor(Math.random()*tracksCopy.length);
                let randomTrack = tracksCopy[randomNum];

                // Assign start time based on settings
                if(props.gameSettings.songStart === 'random'){
                    let randomStart = Math.floor(Math.random()*(randomTrack.duration - props.gameSettings.time*1000));
                    randomTrack.start = randomStart;
                }   else{
                    randomTrack.start = 0;
                };
                questionArray.push(randomTrack);
                tracksCopy.splice(randomNum, 1);
        };                  
        setQuestions(questionArray);         
    },[props.gameSettings, props.tracks]);
    
    const playAndStartTimer = React.useCallback(async()=>{
        if(questions.length>0 && Number.isInteger(currentQ)){
            setPlayAgainShown(false);
            await playTrack(questions[currentQ].uri, questions[currentQ].start);
            setTimeout(()=>{
                pausePlayback();
                setPlayAgainShown(true);
            },props.gameSettings.time * 1000);
        };
    },[questions, currentQ, setPlayAgainShown, playTrack, pausePlayback, props.gameSettings])
    // RESETTING AND STARTING - other buttons
    const startQuiz = ()=>{
        setIsInProgress(true);
        setCurrentQ(0);
        let tempAr = [];
        for(let i =0; i<questions.length; i++){
            tempAr.push("");
        }
        setUsersAnswers(tempAr);
    };   
    const playAgainGame = ()=>{
        setIsInProgress(false);
        createQuestions();
        setCurrentQ("");
        setPlayAgainShown(false);
        setGameEnded(false);
        setUsersAnswers([]);
    };

    const playAgainSong = ()=>{
        playAndStartTimer();
    };  

    const endGame = ()=>{
        setGameEnded(true);
    };

    React.useEffect(()=>{
        createQuestions();
    },[createQuestions])
    
    // PLAYING QUESTIONS automatic
    React.useEffect(()=>{
        playAndStartTimer();        
    },[currentQ, playAndStartTimer]);  

    // Components and elements
    const questionElement = gameEnded ? "":<div>
        <p>Question {currentQ+1}/{questions.length}</p>
        <input type="text" placeholder="Your answer" name="usersAnswers" id="usersAnswers" value={usersAnswers[currentQ]} onChange={handleChange} autoComplete="off"></input>
    </div>;

    const startButton = <button className="btn btn-main" onClick={startQuiz}>Start Quiz</button>
    const controlButtons = <div>
        {playAgainShown && <button className="btn btn-main" onClick={playAgainSong}>Play again<PlayAgainIcon className="icon"/></button>}
        {playAgainShown && currentQ + 1 < questions.length && <button className="btn btn-main" onClick={nextQuestion}>Next Question<NextIcon className="icon"/></button>}
        {playAgainShown && currentQ + 1 === questions.length && <button className="btn btn-main" onClick={endGame}>Show Answers</button>}
    </div>

    const endGameSection = <div>
        <PubQuizAnswers  questions={questions} playTrack={playTrack} pausePlayback={pausePlayback} gameSettings={props.gameSettings} usersAnswers={usersAnswers}/>
        <p><button className="btn btn-main" onClick={playAgainGame}>Play again quiz</button> <button className="btn btn-main" onClick={()=>props.handleGameScreen('settings')}>Create new quiz</button></p>
    </div>

    return(
        <div>
            <p className="menu" onClick={props.handleMenu}>Menu</p>
            <h1>PubQuiz mode</h1>
            {message && <p>{message}</p>}
            {isInProgress ? questionElement : startButton }          
            {!gameEnded && controlButtons}
            {gameEnded && endGameSection}
        </div>
    );
};
export default Pubquiz;