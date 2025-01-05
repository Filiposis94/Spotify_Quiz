import React from "react";
import { ReactComponent as PlayIcon} from './img/play.svg';

function PubQuizAnswers (props){
    const timeoutRef = React.useRef(null);
    const abortTimeout = ()=>{
        if(timeoutRef.current){
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        };
    };
    const playAndStartTimer= async(uri, start)=>{
        abortTimeout();
        await props.playTrack(uri, start);
        timeoutRef.current = setTimeout(()=>{
            props.pausePlayback();
        },props.gameSettings.time * 1000);
    };
    const answers = props.questions.map((q,i)=><p className="pq-answer" key={q.uri}> <span>{i+1}. {q.artists} - {q.name} <button className="btn" onClick={()=>playAndStartTimer(q.uri, q.start)}>Play<PlayIcon className="icon"/></button></span> <span className="pq-answer-text">A: {props.usersAnswers[i]}</span></p>)
    return (
        <div className="left">
            <h1>Answers</h1>
            {answers}
        </div>
    );
};
export default PubQuizAnswers;