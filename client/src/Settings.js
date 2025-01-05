import React from "react";
import {ReactComponent as QuestionIcon} from './img/question.svg'

function Settings(props){

    // Fading not important settings based on mode
    const questionTypeClasses = props.gameSettings.gameMode === 'pickFrom4' ? 'radio-list' : 'radio-list resolved';
    const playTimeClasses = props.gameSettings.gameMode === 'pickFrom4' || props.gameSettings.gameMode === 'pubQuiz'  ? 'left' : 'left resolved';
    const startTimeClasses = props.gameSettings.gameMode !== 'match' ? 'radio-list' : 'radio-list resolved';
    // PLAYLISTS ELEMENTS - FORM
    const usersPlaylistsRadioButtons = props.userPlaylists.map(playlist => {
    return ( <div className="radio-option" key={playlist.id}>
            <input type="radio" name="playlist" id={playlist.id} value={playlist.id} checked={props.gameSettings.playlist === playlist.id} onChange={props.handleChange} required/>
            <label htmlFor={playlist.id}>
                {playlist.name}
            <img className="playlist-img" src={playlist.img} alt={playlist.name}/>
            </label>
        </div>
        );
    });
    return(
        <div>
            <p className="menu" onClick={props.handleMenu}>Menu</p>
            <h1>Set up your quiz</h1>            
            <form onSubmit={props.handleSubmit}>
                <h2>Choose playlist</h2>
                <h3>Your Playlists</h3>
                <div className="radio-list">
                {usersPlaylistsRadioButtons}
                </div>
                <h2>Game settings</h2>
                <h3>Game mode</h3>
                <div className="radio-list">
                    <div className="radio-option">
                        <input type="radio" name="gameMode" id="pickFrom4" value="pickFrom4" checked={props.gameSettings.gameMode === 'pickFrom4'} onChange={props.handleChange} required/>
                        <label htmlFor="pickFrom4">Pick from 4<span className="tooltip tooltip-1"><QuestionIcon className="icon"/></span></label>
                    </div>
                    <div className="radio-option">
                        <input type="radio" name="gameMode" id="typeTheAnswer" value="typeTheAnswer" checked={props.gameSettings.gameMode === 'typeTheAnswer'} onChange={props.handleChange}/>
                        <label htmlFor="typeTheAnswer">Type the answer<span className="tooltip tooltip-2"><QuestionIcon className="icon"/></span></label>
                    </div>
                    <div className="radio-option">
                        <input type="radio" name="gameMode" id="pubQuiz" value="pubQuiz" checked={props.gameSettings.gameMode === 'pubQuiz'} onChange={props.handleChange}/>
                        <label htmlFor="pubQuiz">Pub Quiz<span className="tooltip tooltip-3"><QuestionIcon className="icon"/></span></label>
                    </div>
                    <div className="radio-option">
                        <input type="radio" name="gameMode" id="match" value="match" checked={props.gameSettings.gameMode === 'match'} onChange={props.handleChange}/>
                        <label htmlFor="pubQuiz">Match<span className="tooltip tooltip-4"><QuestionIcon className="icon"/></span></label>
                    </div>
                </div>
                <h3>Song start</h3>
                <div className={startTimeClasses}>
                    <div className="radio-otpion">
                        <input type="radio" name="songStart" id="beginning" value="beginning" checked={props.gameSettings.songStart === 'beginning'} onChange={props.handleChange} required/>
                        <label htmlFor="beginning">Beginning</label>
                    </div>
                    <div className="radio-option">
                        <input type="radio" name="songStart" id="random" value="random" checked={props.gameSettings.songStart === 'random'} onChange={props.handleChange}/>
                        <label htmlFor="random">Random</label>
                    </div>
                </div>
                <h3>Question type</h3>
                <div className={questionTypeClasses}>
                    <div className="radio-option">
                        <input type="radio" name="questionType" id="title" value="title" checked={props.gameSettings.questionType === 'title'} onChange={props.handleChange} required/>
                        <label htmlFor="title">Song Titles</label>
                    </div>
                    <div className="radio-option">
                        <input type="radio" name="questionType" id="author" value="author" checked={props.gameSettings.questionType === 'author'} onChange={props.handleChange}/>
                        <label htmlFor="author">Author</label>
                    </div>
                    <div className="radio-option">
                        <input type="radio" name="questionType" id="both" value="both" checked={props.gameSettings.questionType === 'both'} onChange={props.handleChange}/>
                        <label htmlFor="both">Author + Song Title</label>
                    </div>
                </div>
                <h3>Number of questions</h3>
                    <div className="left">
                        <input type="number" name="numOfQuestions" value={props.gameSettings.numOfQuestions} onChange={props.handleChange} required min="1" max="50"/>
                    </div>
                <h3>Song play time (s)</h3>
                    <div className={playTimeClasses}>
                        <input type="number" name="time" value={props.gameSettings.time} onChange={props.handleChange} required min="1" max="30"/>
                    </div>
                <button className="btn btn-main">Create Quiz</button>
            </form>
        </div>
    );
};

export default Settings;