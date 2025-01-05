import React from "react";

function TypeTheAnswerTimer(props){
    const timerOptions = [3,4,5,6,7,8,9,10];
    const timerButtons = timerOptions.map(number =>{
        if(props.timer === number){
            return <button key={number} className="btn btn-timer correct">{number}</button>
        } else if(props.timer > number){
            return <button key={number} className="btn btn-timer resolved">{number}</button>
        } else {
            return <button key={number} className="btn btn-timer" onClick={()=>props.increaseTimer(number)}>{number}</button>
        };
    });
return (
    <div>
        {timerButtons}
    </div>
    );    
};
export default TypeTheAnswerTimer;