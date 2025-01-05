import React from "react";
import axios from "axios";

import TypeTheAnswerTimer from "./TypeTheAnswerTimer";
import {ReactComponent as PlayAgainIcon } from './img/repeat.svg';
import {ReactComponent as NextIcon } from './img/next.svg';

function TypeTheAnswer(props){
    const [questions, setQuestions] = React.useState([]);
    const [currentQ, setCurrentQ] = React.useState("");
    const [isInProgress, setIsInProgress] = React.useState(false);
    const [playAgainShown, setPlayAgainShown] = React.useState(false);
    const [gameEnded, setGameEnded] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [timer, setTimer] = React.useState(3);
    const [answerChosen, setAnswerChosen] = React.useState(false);

    const [displayedAnswers, setDisplayedAnswers] = React.useState([]);
    const [usersInput, setUsersInput] = React.useState('');
    const [result, setResult] = React.useState('');
    
    const numOfCorrect = questions.filter(q=> q.correct);

    // CALLBACK FUNCTIONS
    const nextQuestion = React.useCallback(()=>{       
        if(currentQ + 1 <questions.length){
            setCurrentQ(prevCurrentQ => {
                let newCurrentQ = prevCurrentQ + 1;
                return newCurrentQ;
            });
            setPlayAgainShown(false);
            setAnswerChosen(false);
            setResult('');
            setTimer(3);
            setUsersInput('');
            setDisplayedAnswers([]);
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
            },timer * 1000);
        };
    },[questions, currentQ, setPlayAgainShown, playTrack, pausePlayback, timer]);

    // Handlers answers
    const handleChange = (event)=>{
        const {value} = event.target;
        setUsersInput(value);
        handleAnswers(value);
    };

    const handleAnswers = (newUserInput)=>{
        let tracksCopy = props.tracks.map(track => track);
        let showedAnswers = [];
        // Escaping special characters so it can be used later
        RegExp.escape = function(string) {
            return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
        };
        function searchWithAccent(input, searchTerm) {
            // Normalize both the input and the search term
            const normalizedInput = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            const normalizedSearchTerm = searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            // Create a regular expression from the escaped, normalized search term
            const regex = new RegExp(RegExp.escape(normalizedSearchTerm), 'i');
            // Test if the normalized search term exists within the normalized input
            return regex.test(normalizedInput);
        };
        for(let i=0; i<tracksCopy.length; i++){
            if(newUserInput !== ''){
                let nameAndTitle = `${tracksCopy[i].artists} - ${tracksCopy[i].name}`;
                if(!searchWithAccent(nameAndTitle,newUserInput)){
                    continue
                };
                showedAnswers.push(tracksCopy[i])
            } else {
                showedAnswers.push(tracksCopy[i])
            };
            // Break if 10 answers
            if(showedAnswers.length === 10){
                break
            };
        };
        setDisplayedAnswers(showedAnswers);
    };

    // RESETTING AND STARTING - other buttons
    const startQuiz = ()=>{
        setIsInProgress(true);
        setCurrentQ(0);
    };   
    const playAgainGame = ()=>{
        setIsInProgress(false);
        createQuestions();
        setCurrentQ("");
        setPlayAgainShown(false);
        setGameEnded(false);
        setAnswerChosen(false);
        setUsersInput('');
        setResult('');
    };

    const playAgainSong = ()=>{
        playAndStartTimer();
    };  

    const increaseTimer = (s)=>{
        setTimer(s);
    };

    const handleSelection = ()=>{
        if(!answerChosen){
            setAnswerChosen(true);
            let correctAnswer = `${questions[currentQ].artists} - ${questions[currentQ].name}`;
            if(usersInput === correctAnswer){
                questions[currentQ].correct = true;
                setResult(<p className="correct">Correct</p>)
            }else{
                questions[currentQ].correct = false;
                setResult(<p className="wrong">Correct answer was {correctAnswer}</p>)
            };
        };
    };

    React.useEffect(()=>{
        if(answerChosen && currentQ + 1 === questions.length){
            setGameEnded(true);
        };
    },[answerChosen, currentQ, questions.length]);

    React.useEffect(()=>{
        createQuestions();
    },[createQuestions]);

    // PLAYING QUESTIONS automatic
    React.useEffect(()=>{
        playAndStartTimer();        
    },[currentQ, playAndStartTimer]);

    // Components and elements
    const questionElement = <div>
        <p>Question {currentQ+1}/{questions.length}</p>
        <p>Current timer is {timer}s</p>
    </div>;
    const startButton = <button className="btn btn-main" onClick={startQuiz}>Start Quiz</button>
    const controlButtons = <div>
        {playAgainShown &&  <TypeTheAnswerTimer timer={timer} increaseTimer={increaseTimer}/>}
        {playAgainShown && <button className="btn btn-main" onClick={playAgainSong}>Play again the Song<PlayAgainIcon className="icon"/></button>}
        {answerChosen && currentQ + 1 < questions.length && <button className="btn btn-main" onClick={nextQuestion}>Next Question<NextIcon className="icon"/></button>}
        {isInProgress &&<p><input type="text" placeholder="Type for options" list="answers" name="usersInput" value={usersInput} onChange={handleChange} autoComplete="off"/></p>}
         <datalist id="answers">
        {displayedAnswers.map(a=>{           
            return <option key={a.uri} value={`${a.artists} - ${a.name}`} readOnly/>
        })}        
        </datalist>
        {playAgainShown && <button className="btn btn-main" onClick={handleSelection}>Confirm choice</button>}
    </div>

    
    const endGameSection = <div>
        <p>You got {numOfCorrect.length} questions correct</p>
        <p><button className="btn btn-main" onClick={playAgainGame}>Play again quiz</button> <button className="btn btn-main" onClick={()=>props.handleGameScreen('settings')}>Create new quiz</button></p>
    </div>

    return(
        <div>
            <h1>Write mode</h1>
            {message && <p>{message}</p>}
            {isInProgress ? questionElement : startButton }          
            {controlButtons}
            {result}
            {gameEnded && endGameSection}
        </div>
    );
};

export default TypeTheAnswer;