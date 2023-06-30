exports.completeAnswer = function(namesList, cocktailIngredientList, cocktailRecipes, questionType, names) {
    /**
     * Error codes disambiguation:
     * -1: no error
     * 1: no cocktail was specified
     * 2: no ingredients were specified
     * 10: no cocktail was found
     * 99: more cocktails than required were specified
     */
    let values

    if (questionType === 'Suggest a cocktail') {
        values = suggestCocktail(namesList['Names'])
    }

    if (questionType === 'List the ingredients for the specified cocktail') {
        values = getIngredients(namesList['Names'], cocktailIngredientList, names)
    }

    if (questionType === 'Give the recipe for the specified cocktail') {
        values = getRecipes(namesList['Names'], cocktailRecipes, names)
    }

    if (questionType === 'List the cocktails containing specified ingredients') {
        values = getCocktailsWithIngredients(namesList, cocktailIngredientList, names)
    }

    if (questionType === 'List the cocktails without specified ingredients') {
        values = getCocktailsWithoutIngredients(namesList, cocktailIngredientList, names)
    }

    if (questionType === 'Help') {
        values = getHelp()
    }

    return values
}


function suggestCocktail(namesList) {
    let answer
    let error = -1
    let showRecipe = true

    answer = namesList[Math.floor(Math.random() * namesList.length)]
    answer += '. Do you want me to show the recipe for it?'

    return {answer, error, showRecipe}
}


function getIngredients(cocktailList, cocktailIngredientList, names) {
    let answer = ''
    let error = -1
    let showRecipe = true

    // find cocktail name in the list of all names
    let foundCocktails = []
    for (let i = 0; i < names.length; i++) {
        if (cocktailList.includes(names[i])) {
            foundCocktails.push(names[i])
        }
    }
    if (foundCocktails.length > 1) {  // more than one cocktail was found
        error = 99
    } else if (foundCocktails.length === 0) {  // no cocktails were found
        error = 1
    } else {  // exactly one cocktail was found
        for (const ingredient of cocktailIngredientList[foundCocktails[0]]['Ingredients']) {
            answer += ingredient + ', '
        }
        answer = answer.slice(0, -2)
        answer += '. '
        answer += 'Do you want me to show the recipe for it?'
    }

    return {answer, error, showRecipe}
}


function getCocktailsWithIngredients(namesList, cocktailIngredientList, names) {
    let answer = ''
    let error = -1
    let showRecipe = true

    // parsing the names to find ingredients
    let foundIngredients = []
    let foundCocktails = []

    // separating the ingredient names
    for (let i = 0; i < names.length; i++) {
        if (namesList['Ingredients'].includes(names[i])) {
            foundIngredients.push(names[i])
        }
    }

    // finding matching cocktails
    for (const name of namesList['Names']) {
        for (const ingredient of foundIngredients) {
            if (cocktailIngredientList[name]['Ingredients'].includes(ingredient) && !foundCocktails.includes(name)) {
                foundCocktails.push(name)
            }
        }
    }

    // constructing the answer
    if (foundIngredients.length > 0) {
        if (foundCocktails.length > 0) {
            for (let i = 0; i < foundCocktails.length; i++) {
                answer += foundCocktails[i] + ', '
            }
            answer = answer.slice(0, -2)
            answer += '. '
            answer += 'Do you want me to show the recipe for the first?'
        } else {
            error = 10
        }
    } else {
        error = 2
    }

    return {answer, error, showRecipe}
}


function getCocktailsWithoutIngredients(namesList, cocktailIngredientList, names) {
    let answer = ''
    let error = -1
    let showRecipe = true

    // parsing the names to find ingredients
    let foundIngredients = []
    let wrongCocktails = []
    let foundCocktails = []

    // separating the ingredients
    for (let i = 0; i < names.length; i++) {
        if (namesList['Ingredients'].includes(names[i])) {
            foundIngredients.push(names[i])
        }
    }

    // finding wrong cocktails
    for (const name of namesList['Names']) {
        for (const ingredient of foundIngredients) {
            if (cocktailIngredientList[name]['Ingredients'].includes(ingredient) && !wrongCocktails.includes(name)) {
                wrongCocktails.push(name)
            }
        }
    }

    // filtering wrong cocktails
    for (const name of namesList['Names']) {
        if (!wrongCocktails.includes(name) && !foundCocktails.includes(name)) {
            foundCocktails.push(name)
        }
    }

    // making an answer
    if (foundIngredients.length > 0) {
        if (foundCocktails.length > 0) {
            for (let i = 0; i < foundCocktails.length; i++) {
                answer += foundCocktails[i] + ', '
            }
            answer = answer.slice(0, -2)
            answer += '. '
            answer += 'Do you want me to show the recipe for the first?'
        } else {
            error = 10
        }
    } else {
        error = 2
    }

    return {answer, error, showRecipe}
}


function getRecipes(cocktailList, cocktailRecipes, names) {
    let answer = ''
    let error = -1
    let showRecipe = false

    // find cocktail name in the list of all names
    let foundCocktails = []
    for (let i = 0; i < names.length; i++) {
        if (cocktailList.includes(names[i])) {
            foundCocktails.push(names[i])
        }
    }
    if (foundCocktails.length > 1) {  // more than one cocktail was found
        error = 99
    } else if (foundCocktails.length === 0) {  // no cocktails were found
        error = 1
    } else {  // exactly one cocktail was found
        for (const recipeLine of cocktailRecipes[foundCocktails[0]]['Recipe']) {
            answer += recipeLine + ' '
        }
    }

    return {answer, error, showRecipe}
}


function getHelp() {
    let error = -1
    let showRecipe = false

    let answer = 'I can do several things: \n1) Suggest a cocktail. \n2) Tell, which cocktails contain'
    answer += 'specified ingredients. \n3) Tell which cocktails don\'t contain specified ingredients. \n'
    answer += '4) List ingredients for the specified cocktail. \n5) Give a recipe for the specified cocktail.'

    return {answer, error, showRecipe}
}