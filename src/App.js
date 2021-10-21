
import React, { useState } from "react";
import "./App.css";
import Chessboard from "chessboardjsx";
import { TextField, Button, Alert, Paper, Grid } from '@mui/material'
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import FastRewindRoundedIcon from '@mui/icons-material/FastRewindRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import HeightRoundedIcon from '@mui/icons-material/HeightRounded';
import { parser } from '@mliebelt/pgn-parser'
import { Title } from "./Components/Title.js";
import styled from 'styled-components'
const Chess = require("chess.js");
const axios = require('axios')

//const validMoveRegex = new RegExp('/[BRQNK][a-h][1-8][+#]*|[BRQNK][a-h]x[a-h][1-8][+#]*|[BRQNK][a-h][1-8]x[a-h][1-8][+#]*|[BRQNK][a-h][1-8][a-h][1-8][+#]*|[BRQNK][a-h][a-h][1-8][+#]*|[BRQNK]x[a-h][1-8][+#]*|[a-h]x[a-h][1-8][=][BRQN][+#]*|[a-h]x[a-h][1-8][+#]*|[a-h][1-8]x[a-h][1-8][=][BRQN]|[a-h][1-8]x[a-h][1-8][+#]*|[a-h][1-8][a-h][1-8][=][BRQN]|[a-h][1-8][a-h][1-8][+#]*|[a-h][1-8][=][BRQN][+#]*|[a-h][1-8][+#]*|[BRQNK][1-8]x[a-h][1-8][+#]*|[BRQNK][1-8][a-h][1-8][+#]*|[o0O][-][oO0][-][oO0][+#]*|[oO0][-][oO0][+#]*', 'g')
const lichessStudyRegEx = /https:\/\/lichess\.org\/api\/study\/[a-zA-Z\d]{8}/

const BoardPaper = styled(Paper)`
  display: inline-block;
`
const GetStudyPaper = styled(Paper)`
  padding: 10px;
  display: inline-block;
  width: 58%;
`
const LeftColumn = styled.div`
  width: 33%;
  display: inline-block;
  text-align: right;
  vertical-align: top;
`
const MiddleColumn = styled.div`
  width: 34%;
  display: inline-block;
`
const RightColumn = styled.div`
  width: 33%;
  display: inline-block;
`

const App = () => {
  const [chess] = useState(
    new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  );

  const [fen, setFen] = useState(chess.fen());
  const [pgn, setPgn] = useState(null)
  const [study, setStudy] = useState(null)
  const [moveNumber, setMoveNumber] = useState(0)
  const [studyUrl, setStudyUrl] = useState('')
  const [whiteOrientation, setWhiteOrientation] = useState(true)
  const [error, setError] = useState({
    isError: false,
    errorText: ''
  })

  const getPgn = async (url) => {
    setError({isError: false, errorText:''})
    var config = {
      method: 'get',
      url: `${url}.pgn?comments=true`
    };  
    if(studyUrl && studyUrl.match(lichessStudyRegEx)){
      axios(config)
        .then(function (response) {
          setPgn(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      setError({isError: true, errorText: 'Invalid URL'})
    }
  }

  React.useEffect(() => {
      if(pgn){
        setStudy(parser.parse(pgn, {startRule: "games"})[0].moves);
      }
    }, [pgn] 
  )
  
  const updateStudyID = (link) => {
    const arr = link.split('/')
    arr.splice(3, 0, 'api')
    const newUrl = arr.join('/')
    setStudyUrl(newUrl)
  }

  const handleMove = (move) => {
    const moves = chess.moves()
    if (moves.includes(move)) {
      chess.move(move)
      chess.move(study[moveNumber + 1].notation.notation)
      setFen(chess.fen());
      setMoveNumber(moveNumber + 2)
    } else {
      chess.move(move)
      setFen(chess.fen())
    }
  };

  const moveForward = () => {
      handleMove(study[moveNumber].notation.notation)
  }

  const moveBackward = () => {
    chess.undo()
    setMoveNumber(moveNumber - 1)
    setFen(chess.fen())
  }

  const moveToFinal = () => {
    for (let i = 0; i < study.length-2; i++){
      handleMove(study[i].notation.notation)
    }
  }

  const moveToBeginning = () => {
      chess.reset()
      setFen(fen)
      setMoveNumber(0)
  }

  return (
    <div style={{textAlign: 'center'}}>
      <Title text='ChessReps'/>
      <LeftColumn>
        <GetStudyPaper>
          <TextField label='Study Link' variant='outlined' onChange={(e) => updateStudyID(e.target.value)} style={{width: '100%'}}/>
          <Button variant='contained' onClick={() => getPgn(studyUrl)} disabled={!studyUrl} style={{margin: '10px 0 0 0'}}>Generate</Button>
          {error.isError && <Alert onClose={() => setError({isError: false, errorText: ''})} severity="error" style={{marginTop: '10px'}}>{error.errorText}</Alert>}
        </GetStudyPaper>
      </LeftColumn>
      <MiddleColumn>
        <BoardPaper elevation={2}>
          <Chessboard
            position={chess.fen()}
            onDrop={(move) =>
              handleMove({from: move.sourceSquare, to: move.targetSquare})
            }
            transitionDuration={150}
            orientation={whiteOrientation ? 'white' : 'black'}
          />
          <Grid container spacing={2}>
            <Grid item xs={1}>
              <Button onClick={() => setWhiteOrientation(!whiteOrientation)} ><HeightRoundedIcon/></Button>
            </Grid>
            <Grid item xs={2.68} />
            <Grid item xs={1}>
              <Button onClick={moveToBeginning} disabled={!study || moveNumber % 2 === 0}><FastRewindRoundedIcon/></Button>
            </Grid>
            <Grid item xs={1}>
              <Button onClick={moveBackward} disabled={!study}><SkipPreviousRoundedIcon/></Button>
            </Grid>
            <Grid item xs={1}>
              <Button onClick={moveForward} disabled={!study}><SkipNextRoundedIcon/></Button>
            </Grid>
            <Grid item xs={1}>
              <Button onClick={moveToFinal} disabled={!study}><FastForwardRoundedIcon/></Button>
            </Grid>
          </Grid>
        </BoardPaper>
      </MiddleColumn>
      <RightColumn>
        <Paper></Paper>
      </RightColumn>
    </div>
  );
};

export default App;
