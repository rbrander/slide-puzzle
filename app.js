// app.js

// TODO: create a server that can accept an image and return 9 images to automate the image-splitting process


const SPACE_ID = '5g4h2poikwrg'
const ENVIRONMENT = 'master'
const ASSETS = [
  '01J3demBXdMBI9OX5VDjrN',
  '33Pn0NR8gIw0i2tx6Oucx5',
  '3tvvgB4ELUlFk6fAvBnz8O',
  '3MBmcKA6MOXzM9RmGQjuVi'
]
const DELIVERY_ACCESS_TOKEN = 'gLNzglwL1W28CgIDcJRtop4-iEAQcQ2R8uOMB6tH154'
const PUZZLE_SUMMER_NATURE_ENTRY_ID = '3KIVnxizuTjfGs4KOsrGH1'

const state = {
  puzzle: {
    numColumns: 0,
    numRows: 0,
    goalImage: 'data:;base64,',
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


// sample src = "https://images.ctfassets.net/5g4h2poikwrg/01J3demBXdMBI9OX5VDjrN/2a6788e136ac53459e66d9391f42532c/nature-1370825-639x573.jpg"
const setImageSrc = (id, src) => {
  const imgPuzzleGoal = document.getElementById(id)
  imgPuzzleGoal.src = src
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
  console.log('fetching puzzle...')
  const client = contentful.createClient({
    space: spaceID,
    environment,
    accessToken
  })
  return client.getEntry(PUZZLE_SUMMER_NATURE_ENTRY_ID)
    .then(({
      fields: {
        name, 
        numberOfColumns: numColumns,
        numberOfRows: numRows,
        wholeImage: goalImage,
        imagePieces
      }
    }) => ({ name, numColumns, numRows, goalImage, imagePieces }))
}

const update = (tick) => {}

const draw = (tick) => {
  const goalImage = document.getElementById('puzzle-goal')
  if (typeof state.puzzle.goalImage === 'object' && 
    state.puzzle.goalImage.fields.file.url !== goalImage.src) {
      goalImage.src = state.puzzle.goalImage.fields.file.url
  }
  const maxValue = state.puzzle.numColumns * state.puzzle.numRows
  state.puzzle.currOrder.forEach((orderIndex, index) => {
    const image = document.getElementById(`puzzle-piece-${index + 1}`)
    const piece = state.puzzle.imagePieces[orderIndex - 1]
    image.src = piece.fields.file.url
    image.width = piece.fields.file.details.image.width
    image.height = piece.fields.file.details.image.height
    if (orderIndex === maxValue)
      image.style.visibility = 'hidden'
    else
      image.style.visibility = 'visible'
    
    // setImageSrc(`puzzle-piece-${index + 1}`, orderIndex === maxValue ? '' : state.puzzle.imagePieces[orderIndex - 1].fields.file.url)
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
