import React from "react";

function PickFrom4Answer(props){

    let classList = 'btn btn-answer';
    if(props.answerChosen){
        if(props.answer.correct){
            classList = 'btn correct';
        } else if (props.answer.selected && !props.answer.correct){
            classList = 'btn wrong';
        } else {
            classList = 'btn btn-answer resolved';
        };
    };

    let displayAnswer;
    if(props.gameSettings.questionType === 'title'){
        displayAnswer = <button className={classList} onClick={props.handleAnswer}>{props.answer.name}</button>
    } else if(props.gameSettings.questionType === 'author'){
        displayAnswer = <button className={classList} onClick={props.handleAnswer}>{props.answer.artists}</button>
    } else {
        displayAnswer = <button className={classList} onClick={props.handleAnswer}>{`${props.answer.artists} - ${props.answer.name}`}</button>

    }
    return displayAnswer;
};

export default PickFrom4Answer;