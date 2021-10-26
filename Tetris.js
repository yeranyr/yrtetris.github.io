const STEP = 20,
    GAME_MID = 2,

    // COLOR = ["#FF1493", "#FF00FF", "#0000FF", "	#1E90FF", "#00FFFF", "#00FF7F", "#00FF00", "#FFFF00", "#FF6600"]
    COLOR = ['blueviolet', 'slateblue', 'steelblue', 'lightseagreen', 'saddlebrown', 'indianred', 'brown', 'red']

let GAME_ROW = 18,
    GAME_COL = 10

let currentModel = {},
    currentModelColor,
    currentModelX = 0,
    currentModelY = 0,
    fixedBlocks = {},
    mInterval = null,
    score = 0

let button = document.querySelector('.startButton'),
    WHButton = document.querySelector('.WHButton')

const MODELS = [
    // L type model
    {
        0: { row: 2, col: 0 },
        1: { row: 2, col: 1 },
        2: { row: 2, col: 2 },
        3: { row: 1, col: 2 }
    },
    // 凸
    {
        0: {
            row: 2,
            col: 1
        },
        1: {
            row: 1,
            col: 0
        },
        2: {
            row: 2,
            col: 0
        },
        3: {
            row: 3,
            col: 0
        }
    },
    // 田
    {
        0: {
            row: 1,
            col: 1
        },
        1: {
            row: 2,
            col: 1
        },
        2: {
            row: 1,
            col: 2
        },
        3: {
            row: 2,
            col: 2
        }
    },
    // 一
    {
        0: {
            row: 2,
            col: 0
        },
        1: {
            row: 2,
            col: 1
        },
        2: {
            row: 2,
            col: 2
        },
        3: {
            row: 2,
            col: 3
        }
    },
    // Z
    {
        0: {
            row: 1,
            col: 1
        },
        1: {
            row: 1,
            col: 2
        },
        2: {
            row: 2,
            col: 2
        },
        3: {
            row: 2,
            col: 3
        }
    }
]

function windowInit() {
    let windowelement = document.querySelector('.gamewindow')
    windowelement.style.width = GAME_COL * STEP + 'px'
    windowelement.style.height = GAME_ROW * STEP + 'px'

    let W = document.querySelector('.setWidth')
    let H = document.querySelector('.setHeight')
    WHButton.onclick = function () {
        GAME_COL = W.value ? W.value : GAME_COL
        GAME_ROW = H.value ? H.value : GAME_ROW
        windowelement.style.width = GAME_COL * STEP + 'px'
        windowelement.style.height = GAME_ROW * STEP + 'px'
    }

}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值 
}
function creatModel() {

    if (isGameOver()) {
        gameOver()
        return
    }

    currentModel = MODELS[getRandomIntInclusive(0, MODELS.length - 1)]
    currentModelColor = COLOR[getRandomIntInclusive(0, COLOR.length - 1)]

    currentModelX = (Math.floor(GAME_COL / 2) - GAME_MID)
    currentModelY = -1

    for (let key in currentModel) {
        let divElement = document.createElement("div")
        divElement.className = 'activity_model'

        divElement.style.backgroundColor = "#f4f4f4"
        divElement.style.borderColor = currentModelColor
        divElement.style.boxShadow = currentModelColor + ' 0px 0px 3px inset,' + currentModelColor + ' 0px 0px 6px inset,' + currentModelColor + ' 0px 0px 9px inset'

        document.getElementById('game_container').appendChild(divElement)

    }
    locationBlocks()
    autoDown()
}

function locationBlocks() {
    checkBound()
    let eles = document.getElementsByClassName('activity_model')
    for (let i = 0; i < eles.length; i++) {
        let element = eles[i]
        let blockModel = currentModel[i]
        element.style.left = (blockModel.col + currentModelX) * STEP + 'px'
        element.style.top = (blockModel.row + currentModelY) * STEP + 'px'
    }

}

function onKeyDown() {
    document.onkeydown = function (event) {
        // console.log(event.code);
        switch (event.code) {
            case 'ArrowUp':
                rotate()
                break
            case 'KeyW':
                rotate()
                break
            case 'ArrowLeft':
                move(-1, 0)
                break
            case 'KeyA':
                move(-1, 0)
                break
            case 'ArrowDown':
                move(0, 1)
                break
            case 'KeyS':
                move(0, 1)
                break
            case 'ArrowRight':
                move(1, 0)
                break
            case 'KeyD':
                move(1, 0)
                break
            case 'Space':
                move(0, 1)
                move(0, 1)
                break
            case 'KeyP':
                stop()
                break

        }
    }
}

function move(x, y) {
    if (isMeet(currentModelX + x, currentModelY + y, currentModel)) {

        if (!y == 0) {
            fixedBottomModel()
        }

        return

    }
    currentModelX += x
    currentModelY += y
    locationBlocks()
}

function rotate() {
    let nextModel = deepClone(currentModel)
    for (const key in nextModel) {
        let blockModel = nextModel[key]
        let temp = blockModel.row
        // matrixNew[col][n−row−1] = matrix[row][col]
        blockModel.row = blockModel.col
        blockModel.col = 3 - temp
    }
    if (isMeet(currentModelX, currentModelY, nextModel))
        return
    currentModel = nextModel
    locationBlocks()
}

function checkBound() {
    //let leftBound = -Math.floor(GAME_COL / 2) + GAME_MID,
    let leftBound = 0,
        //    rightBound = Math.ceil(GAME_COL / 2) + GAME_MID,
        rightBound = GAME_COL,
        bottomBound = GAME_ROW;
    for (let key in currentModel) {
        let blockModel = currentModel[key]
        if (blockModel.col + currentModelX < leftBound) {
            currentModelX += 1
        }
        if (blockModel.col + currentModelX >= rightBound) {
            currentModelX -= 1
        }
        if (blockModel.row + currentModelY >= bottomBound) {
            currentModelY -= 1
            fixedBottomModel()
        }

    }

}

function fixedBottomModel() {
    let eles = document.getElementsByClassName('activity_model')
    for (let i = eles.length - 1; i >= 0; i--) {
        let element = eles[i]
        element.className = 'fixed_model'

        let blockModel = currentModel[i]
        fixedBlocks[(currentModelY + blockModel.row) + '_' + (currentModelX + blockModel.col)] =
            element
    }

    isRemoveLine()
    creatModel()
}

function isMeet(xNext, yNext, model) {
    for (let key in model) {
        let blockModel = model[key]
        if (fixedBlocks[(yNext + blockModel.row) + '_' + (xNext + blockModel.col)]) {
            return true
        }
    }
    return false
}

function isRemoveLine() {
    for (let i = 0; i < GAME_ROW; i++) {
        let flag = true
        for (let j = 0; j < GAME_COL; j++) {
            if (!fixedBlocks[i + '_' + j]) {
                flag = false
                break
            }

        }
        if (flag) {
            removeLine(i)
            downLine(i)
            score += 10
            console.log(score);
            let s = document.getElementsByClassName('score')[0]
            s.innerHTML = score
        }
    }
}

function removeLine(line) {
    for (let i = 0; i < GAME_COL; i++) {
        document.getElementById('game_container').removeChild(fixedBlocks[line + '_' + i])
        fixedBlocks[line + '_' + i] = null
    }
}

function downLine(line) {
    for (let i = line - 1; i >= 0; i--) {
        for (let j = 0; j < GAME_COL; j++) {
            if (!fixedBlocks[i + '_' + j]) continue
            fixedBlocks[(i + 1) + '_' + j] = fixedBlocks[i + '_' + j]
            fixedBlocks[(i + 1) + '_' + j].style.top = (i + 1) * STEP + 'px'
            fixedBlocks[i + '_' + j] = null
        }

    }
}

function deepClone(obj = {}) {
    if (typeof obj !== 'object' || obj == null)
        return obj
    let result
    if (obj instanceof Array)
        result = []
    else
        result = {}

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = deepClone(obj[key])
        }
    }
    return result
}

function autoDown() {
    if (mInterval) {
        clearInterval(mInterval)
    }
    mInterval = setInterval(function () {
        move(0, 1)
    }, 600)
}

function isGameOver() {
    for (let j = 0; j < GAME_COL; j++) {
        if (fixedBlocks['0_' + j]) return true
    }
    return false
}
function isGameStar() {
    button.onclick = function () {
        button.innerHTML = "PAUSE"
        button.value = 'stared'
        button.style.display = "none"
        init()
    }
}

function gameOver() {
    if (mInterval) {
        clearInterval(mInterval)
    }

    alert("gameOver!!!")

}

/* function isPause() {

    if (button.innerHTML == "PAUSE") {

        button.onclick = function () {
            button.innerHTML = "START"
        }
        return false
    }
    else {
        button.onclick = function () {
            button.innerHTML = "PAUSE"
        }
        return true
    }

} */


function init() {
    creatModel()
    onKeyDown()
}

function beforInit() {
    windowInit()
    isGameStar()
}