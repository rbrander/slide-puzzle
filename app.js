// app.js

// TODO: create a server that can accept an image and return 9 images to automate the image-splitting process
// TODO: make more puzzles
// TODO: add a scoring system
// TODO: add a done state
// TODO: add tips and techniques
// TODO: dynamically generic the markup based on puzzle size
// TODO: create a puzzle other than 3x3

const SPACE_ID = '4hljq5yupat1'
const ENVIRONMENT = 'master'
const DELIVERY_ACCESS_TOKEN = 'V7y3zuvPVN69aMnM1v1AYoWL8-0BEsc3ewmaT66Yufg'
const PUZZLE_SUMMER_NATURE_ENTRY_ID = '3KIVnxizuTjfGs4KOsrGH1'

const state = {
  puzzle: {
    numColumns: 0,
    numRows: 0,
    goalImage: undefined,
    imagePieces: [],
    currOrder: []
  }
}

const movePiece = (e) => {
  // before moving, we need to validate that it is allowed,
  // meaning blank piece is directly beside the target piece
  const targetPieceOrderIndex = Number(e.target.id.substr(-1)) - 1
  const targetPieceNum = state.puzzle.currOrder[targetPieceOrderIndex]
  const targetX = targetPieceOrderIndex % state.puzzle.numColumns
  const targetY = Math.floor(targetPieceOrderIndex / state.puzzle.numRows)

  // the blank piece is the last piece (bottom right corner piece)
  const blankPieceNum = state.puzzle.numColumns * state.puzzle.numRows
  const blankPieceOrderIndex = state.puzzle.currOrder.indexOf(blankPieceNum)
  const blankX = blankPieceOrderIndex % state.puzzle.numColumns
  const blankY = Math.floor(blankPieceOrderIndex / state.puzzle.numRows)

  // to determine if the target piece is beside the blank piece,
  // we can look for an absolute difference in either the x or y axis
  // but not both (as that would be diagonal)
  const diffX = Math.abs(targetX - blankX)
  const diffY = Math.abs(targetY - blankY)
  const isValidMove = (
    (diffX === 0 && diffY === 1) ||
    (diffX === 1 && diffY === 0)
  )

  if (isValidMove) {
    // swap the two pieces
    state.puzzle.currOrder[blankPieceOrderIndex] = targetPieceNum
    state.puzzle.currOrder[targetPieceOrderIndex] = blankPieceNum
  }
}

const shuffleArray = (originalArray) => {
  const array = [...originalArray]
  for (let index = array.length - 1; index > 0; index--) {
    let randomIndex = Math.floor(Math.random() * (index + 1))
    let arrayValueAtIndex = array[index]
    array[index] = array[randomIndex]
    array[randomIndex] = arrayValueAtIndex
  }
  return array
}

const queryObjToString = (queryObj) =>
  Object.entries(queryObj)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

const loadPuzzle = (name, numColumns, numRows, goalImage, imagePieces) => {
  Object.assign(state.puzzle, {
    name,
    numColumns,
    numRows,
    goalImage,
    imagePieces,
    currOrder: shuffleArray(new Array(numColumns * numRows).fill().map((_, i) => i + 1))
  })  
}

const fetchPuzzle = (accessToken, spaceID, environment, entryID) => {
  const URL = `https://graphql.contentful.com/content/v1/spaces/${spaceID}/environments/${environment}`
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `{
        puzzle(id: "${entryID}") {
          name
          numberOfRows
          numberOfColumns
          wholeImage {
            url
            width
            height
          }
          imagePiecesCollection {
            items {
              url
              width
              height
            }
          }
        }
      }`
    })
  }
  
  return fetch(URL, options)
    .then(response => response.json())
    .then(jsonData => {
      const {
        name,
        numberOfColumns: numColumns,
        numberOfRows: numRows,
        wholeImage: goalImage,
        imagePiecesCollection: { items: imagePieces }
      } = jsonData.data.puzzle
      return ({ name, numColumns, numRows, goalImage, imagePieces })
    })
    .catch(console.error)
}

const update = (tick) => {}

const draw = (tick) => {
  const goalImage = document.getElementById('puzzle-goal')
  if (typeof state.puzzle.goalImage === 'object' && 
    state.puzzle.goalImage.url !== goalImage.src) {
      const { url, width, height } = state.puzzle.goalImage
      goalImage.src = url
      goalImage.width = width
      goalImage.height = height
  }
  const maxValue = state.puzzle.numColumns * state.puzzle.numRows
  state.puzzle.currOrder.forEach((orderIndex, index) => {
    const image = document.getElementById(`puzzle-piece-${index + 1}`)
    const piece = state.puzzle.imagePieces[orderIndex - 1]
    image.src = piece.url
    image.width = piece.width
    image.height = piece.height
    if (orderIndex === maxValue)
      image.style.visibility = 'hidden'
    else
      image.style.visibility = 'visible'    
  })
}

const loop = (tick) => {
  update(tick)
  draw(tick)
  requestAnimationFrame(loop)
}

const init = () => {
  console.log('Slide Puzzle')

  fetchPuzzle(DELIVERY_ACCESS_TOKEN, SPACE_ID, ENVIRONMENT, PUZZLE_SUMMER_NATURE_ENTRY_ID)
    .then(({ name, numColumns, numRows, goalImage, imagePieces })  => {
      loadPuzzle(name, numColumns, numRows, goalImage, imagePieces)
    })

  requestAnimationFrame(loop)
}

init()
