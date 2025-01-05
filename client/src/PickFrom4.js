import React from "react";
import axios  from "axios";

import PickFrom4Question from "./PickFrom4Question";
import {ReactComponent as PlayAgainIcon } from './img/repeat.svg';
import {ReactComponent as NextIcon } from './img/next.svg';

function PickFrom4 (props){
    const [questions, setQuestions] = React.useState([]);
    const [currentQ, setCurrentQ] = React.useState("");
    const [isInProgress, setIsInProgress] = React.useState(false);
    const [playAgainShown, setPlayAgainShown] = React.useState(false);
    const [answerChosen, setAnswerChosen] = React.useState(false);
    const [gameEnded, setGameEnded] = React.useState(false);
    const [message, setMessage] = React.useState('');
    
    const numOfCorrect = questions.filter(q=> {
        return q.filter(a=>a.correct && a.selected).length
    });
    // CALLBACK FUNCTIONS
    const nextQuestion = React.useCallback(()=>{       
        if(currentQ + 1 <questions.length){
            setCurrentQ(prevCurrentQ => {
                let newCurrentQ = prevCurrentQ + 1;
                return newCurrentQ;
            });
            setPlayAgainShown(false);
            setAnswerChosen(false);
        };
        // When automatic skip on last question - NOW ONLY FOR ERRORS SHOULDNT HAPPEN
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
            //NOW ONLY FOR ERRORS - SHOULDNT HAPPEN
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
            let answers = [];
            do {
                let randomNum = Math.floor(Math.random()*tracksCopy.length);
                let randomTrack = tracksCopy[randomNum];
                // Question Type - avoid duplicate asnwers
                if(props.gameSettings.questionType === 'title'){
                    if(answers.some(a => a.name === randomTrack.name)){
                        continue
                    } else{
                        answers.push(randomTrack)
                        tracksCopy.splice(randomNum, 1);
                    };
                } else if(props.gameSettings.questionType === 'author') {
                    if(answers.some(a => a.artists === randomTrack.artists)){
                        continue
                    } else{
                        answers.push(randomTrack)
                        tracksCopy.splice(randomNum, 1);
                    };
                } else{
                    answers.push(randomTrack)
                    tracksCopy.splice(randomNum, 1);
                };
            } while (answers.length < 4);
            // Mark one answer as correct rest as wrong
            let randomNum = Math.floor(Math.random()*answers.length);
            for(let j=0; j<answers.length; j++){
                // Assign correct status and song start time based on settings
                if(j === randomNum){
                    answers[j].correct = true;
                    if(props.gameSettings.songStart === 'random'){
                        let randomStart = Math.floor(Math.random()*(answers[j].duration - props.gameSettings.time*1000));
                        answers[j].start = randomStart;
                    }   else{
                        answers[j].start = 0;
                    }
                } else {
                    answers[j].correct = false;
                };
                answers[j].selected = false;
            };
            questionArray.push(answers);      
        }
        setQuestions(questionArray);
    },[props.gameSettings, props.tracks]);

    // Timeout ref and aborting
    const timeoutRef = React.useRef(null);
    const abortTimeout = ()=>{
        if(timeoutRef.current){
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            setPlayAgainShown(true);
        };
    };
    const playAndStartTimer = React.useCallback(async()=>{
        if(questions.length>0 && Number.isInteger(currentQ)){
            let correct = questions[currentQ].filter(a => a.correct);
            setPlayAgainShown(false);       
            await playTrack(correct[0].uri, correct[0].start);
            timeoutRef.current = setTimeout(()=>{
                pausePlayback();
                setPlayAgainShown(true)
            },props.gameSettings.time * 1000);
        }
    },[playTrack, setPlayAgainShown, pausePlayback, questions, currentQ, props.gameSettings]);

    // Control Buttons
    const startQuiz = ()=>{
        setIsInProgress(true);
        setCurrentQ(0);
    };   
    const playAgainGame = ()=>{
        setIsInProgress(false);
        createQuestions();
        setCurrentQ("");
        setPlayAgainShown(false);
        setAnswerChosen(false);
        setGameEnded(false);
    };
    const playAgainSong = ()=>{
        playAndStartTimer();
    };
    const handleAnswer = (uri)=>{
        pausePlayback();
        if(!answerChosen){
            setQuestions(prevQuestions => {
                let newQuestions = prevQuestions.map(q=>{
                    if(prevQuestions.indexOf(q) === currentQ){
                        let newAnswers = q.map(a=>{
                            return a.uri === uri ? {...a, selected: true} :{...a};
                        });
                        return newAnswers;
                    } else {
                        return q;
                    };
                });
                return newQuestions;
            });
        };
        setAnswerChosen(true);
        abortTimeout();
    };

    React.useEffect(()=>{
        createQuestions();
    },[createQuestions]);

    React.useEffect(()=>{
        if(answerChosen && currentQ + 1 === questions.length){
            setGameEnded(true);
        };
    },[answerChosen, currentQ, questions.length]);
    // PLAYING QUESTIONS automatic
    React.useEffect(()=>{
        if(!answerChosen){             
                playAndStartTimer();
                return ()=>{
                    if(timeoutRef.current){
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                    };
                };

        };
    },[currentQ, questions, answerChosen, playAndStartTimer]);  
    
    // Components and elements
    const questionElement = <div>
    <p>Question {currentQ+1}/{questions.length}</p>
    <PickFrom4Question currentQ={questions[currentQ]} gameSettings={props.gameSettings} handleAnswer={handleAnswer} answerChosen={answerChosen}/>
    </div>;
    const startButton = <button className="btn btn-main" onClick={startQuiz}>Start Quiz</button>;
    const controlButtons = <div>
        {playAgainShown && <button className="btn btn-main" onClick={playAgainSong}>Play again<PlayAgainIcon className="icon"/></button>}
        {answerChosen && currentQ + 1 < questions.length && <button className="btn btn-main" onClick={nextQuestion}>Next Question<NextIcon className="icon"/></button>}
    </div>;
    const endGameSection = <div>
        <p><button className="btn btn-main" onClick={playAgainGame}>Play again quiz</button> <button className="btn btn-main" onClick={()=>props.handleGameScreen('settings')}>Create new quiz</button></p>
        <p>You got {numOfCorrect.length}/{questions.length}</p>
    </div>;

    return(
        <div>
            <p className="menu" onClick={props.handleMenu}>Menu</p>
            <h1>Quiz</h1>
            {message && <p>{message}</p>}
            {isInProgress ? questionElement : startButton}
            {controlButtons}
            {gameEnded && endGameSection}        
        </div>
    );
};

export default PickFrom4;