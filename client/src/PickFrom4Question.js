import React from "react";
import PickFrom4Answer from "./PickFrom4Answer";

function PickFrom4Question (props){
    return (
        <div className="answers">
        <PickFrom4Answer gameSettings={props.gameSettings} handleAnswer={()=>props.handleAnswer(props.currentQ[0].uri)} answer={props.currentQ[0]} answerChosen={props.answerChosen}/>
        <PickFrom4Answer gameSettings={props.gameSettings} handleAnswer={()=>props.handleAnswer(props.currentQ[1].uri)} answer={props.currentQ[1]} answerChosen={props.answerChosen}/>
        <PickFrom4Answer gameSettings={props.gameSettings} handleAnswer={()=>props.handleAnswer(props.currentQ[2].uri)} answer={props.currentQ[2]} answerChosen={props.answerChosen}/>
        <PickFrom4Answer gameSettings={props.gameSettings} handleAnswer={()=>props.handleAnswer(props.currentQ[3].uri)} answer={props.currentQ[3]} answerChosen={props.answerChosen}/>
        </div>
    );
};
export default PickFrom4Question;