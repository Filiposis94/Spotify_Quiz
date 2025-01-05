import React from "react";

import MatchRow from "./MatchRow";

function Match(props){
    const [questions, setQuestions] = React.useState([]);
    const [isInProgress, setIsInProgress] = React.useState(false);
    const [gameEnded, setGameEnded] = React.useState(false);
    const [selection, setSelection] = React.useState('');
    const [isWrong, setIsWrong] = React.useState(false)
    // CALLBACK FUNCTIONS    
    // Fisher–Yates shuffle
    const shuffle = (array)=> {
        let currentIndex = array.length;
        // While there remain elements to shuffle...
        while (currentIndex !== 0) {
          // Pick a remaining element...
          let randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        };
    };
    const createQuestions = React.useCallback (() =>{
        let tracksCopy = props.tracks.map(track => track);
        let questionArray = [];
        let i = 0;
        do {
            let randomNum = Math.floor(Math.random()*tracksCopy.length);
            let randomTrack = tracksCopy[randomNum];
            // Avoid duplicate options for both sides
            if(questionArray.some(a => a.name === randomTrack.name) || questionArray.some(a => a.artists === randomTrack.artists)){
                continue
            } else {
                randomTrack.originalIndex = i;
                randomTrack.selectedArtists = false;
                randomTrack.selectedSongName = false;
                questionArray.push(randomTrack);
                tracksCopy.splice(randomNum, 1);
                i++
            }
        } while(questionArray.length < props.gameSettings.numOfQuestions && tracksCopy.length);
         
        shuffle(questionArray);
        setQuestions(questionArray);
                     
    },[props.gameSettings, props.tracks]);

    const handleSelectionArtists = (artists)=>{
        if(!questions.filter(q=> q.artists === artists)[0].locked){
            setQuestions(prevQuestions =>{
                let newQuestions = prevQuestions.map(q=>{
                    return q.artists === artists ? {...q, selectedArtists: !q.selectedArtists} : {...q, selectedArtists: false};
                })
                return newQuestions;
            });
            setSelection(artists);
        };
    };

    const handleSelectionSongName = (songName)=>{
        if(!questions.filter(q=> q.name === songName)[0].locked){
            setQuestions(prevQuestions =>{
                let newQuestions = prevQuestions.map(q=>{
                    return q.name === songName ? {...q, selectedSongName: !q.selectedSongName} : {...q, selectedSongName: false};
                    
                });
                return newQuestions;
            });
            setSelection(songName);
        };
    };
    
    // RESETTING AND STARTING - other buttons
    const startQuiz = ()=>{
        setIsInProgress(true);
    };   
    const playAgainGame = ()=>{
        setIsInProgress(false);
        createQuestions();
        setGameEnded(false);
    };

    React.useEffect(()=>{
        if(questions.length>0){
            if(questions.every(q=> q.locked === true)){
                setGameEnded(true)
            };
        };
        
    },[questions]);

    React.useEffect(()=>{
        createQuestions();
    },[createQuestions]);
    
    // Check for match
    React.useEffect(()=>{
        setQuestions(prevQuestions =>{
            let aSelection = prevQuestions.filter(q=>q.selectedArtists === true).length;
            let sSelection = prevQuestions.filter(q=>q.selectedSongName === true).length;
            
            let newQuestions = prevQuestions.map(q=>{
                if(aSelection && sSelection){
                    if(q.selectedArtists === true && q.selectedSongName === true){
                        return {...q, locked: true, selectedArtists: false, selectedSongName: false};
                    } else{
                        setIsWrong(true);
                        setTimeout(()=>{
                            setIsWrong(false);
                        },1000)
                        return q;
                    };
                } else {
                    return q;
                };
            });
            return newQuestions;
        });
        
    },[selection]);
    // Components and elements 
    let matchRows = [];
    for(let i=0; i<questions.length; i++){
        let artists = questions.find(q=> q.originalIndex === i).artists;
        let songName = questions[i].name;
        let singleRow = <MatchRow key={i} artists={artists} songName={songName} questions={questions} handleSelectionArtists={handleSelectionArtists} handleSelectionSongName={handleSelectionSongName} isWrong={isWrong}/>
        matchRows.push(singleRow);
    };
    
    const questionElement = <div>
        <p>Match the author and the song title.</p>
        {matchRows}
    </div>;


    const startButton = <button className="btn btn-main" onClick={startQuiz}>Start Quiz</button>
    const endGameSection = <div>
    <p><button className="btn btn-main" onClick={playAgainGame}>Play again quiz</button> <button className="btn btn-main" onClick={()=>props.handleGameScreen('settings')}>Create new quiz</button></p>
    </div>    

    return(
        <div>
            <p className="menu" onClick={props.handleMenu}>Menu</p>
            <h1>Match mode</h1>
            {isInProgress ? questionElement : startButton }
            {gameEnded && endGameSection}          
        </div>
    );
};

export default Match;