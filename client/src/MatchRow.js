import React from "react";

function MatchRow(props){
    const artistsIndex = props.questions.findIndex(q=> q.artists === props.artists);
    const songNameIndex = props.questions.findIndex(q=> q.name === props.songName);
    let classListArtist;
    let classListSongName;
    if(props.questions[artistsIndex].locked){
        classListArtist = 'btn correct';
    } else if(props.questions[artistsIndex].selectedArtists){
        classListArtist = 'btn';
    } else {
        classListArtist= 'btn btn-answer';
    };
    if(props.questions[songNameIndex].locked){
        classListSongName = 'btn correct';
    } else if(props.questions[songNameIndex].selectedSongName){
        classListSongName = 'btn';
    } else {
        classListSongName= 'btn btn-answer';
    };
    // When IS WRONG
    if(props.isWrong && props.questions[songNameIndex].selectedSongName){
        classListSongName = 'btn wrong';
    }
    if(props.isWrong && props.questions[artistsIndex].selectedArtists){
        classListArtist = 'btn wrong';
    };

    return (
        <div className="match-row">
        <button className={classListArtist} onClick={()=>props.handleSelectionArtists(props.artists)}>{props.artists}</button>
        <button className={classListSongName} onClick={()=>props.handleSelectionSongName(props.songName)} >{props.songName}</button>
        </div>
    );
};

export default MatchRow;