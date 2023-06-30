/**
 * Class 'LanguageModel' manages converting user input to an output string.
 * Usage: create an instance of the class, and call method 'getAnswer(input)', where input - user input.
 *
 * Description:
 * The model works based on keyword spotting, so the functionality is limited strictly to predefined conversation topics.
 * The model tackles the problem of not understanding the user fully, providing with an option to choose correct answer.
 * The model remembers last discussed cocktail, therefore it is not required to specify the name in the following inquiry.
 * If more than one cocktail was specified during the last inquiry, model will remember first
 */

const { getNames } = require('./getLists.js');
const { getKeywords } = require('./getLists.js');
const { getCocktailIngredients } = require('./getLists.js');
const { getCombinations } = require('./getLists.js');
const { getRecipes } = require('./getLists.js')
const { completeAnswer } = require('./auxFunctions.js')


class LanguageModel {
    constructor() {
        this.namesList = getNames()
        this.keywordList = getKeywords()
        this.cocktailIngredientList = getCocktailIngredients()
        this.keywordsCombinations = getCombinations()
        this.cocktailRecipes = getRecipes()
        this.lastCocktail = ''
        this.lastAmbiguity = []
        this.lastNames = []
        this.delimiters = /[ ,.;!:?]/;  // possible delimiters in the sentence
        this.showRecipe = false
    }

    checkForKeywords(inputString) {
        let isQuestionFound = true;

        const {words, doubleWords} = this.splitIntoWords(inputString)  // doubleWords - sequences of two words, made for improved keyword spotting

        this.shouldShowRecipe(words)

        let keywordsSpecificSpotted = this.spotKeywordSpecific(words, doubleWords)
        let {keywordsCommonSpotted, generalKeywordCount} = this.spotKeywordsCommon(words, doubleWords)

        let namesSpotted = this.spotNames(words, doubleWords)
        let ingredientsSpotted = this.spotIngredients(words, doubleWords)

        if (namesSpotted.length === 0) {  // using context to define what cocktail is user talking about
            namesSpotted.push(this.lastCocktail)
        }

        namesSpotted = namesSpotted.concat(ingredientsSpotted)

        // question not found
        if (generalKeywordCount !== words.length && keywordsSpecificSpotted.length === 0) {
            isQuestionFound = false
        }

        return {keywordsCommonSpotted, keywordsSpecificSpotted, namesSpotted, isQuestionFound}
    }


    splitIntoWords(inputString) {
        inputString = inputString.toLowerCase();
        let words = inputString.split(this.delimiters);
        let doubleWords = []

        // filling the double words array
        for (let i = 0; i < words.length - 1; i++) {
            doubleWords.push(words[i] + ' ' + words[i + 1])
        }

        return {words, doubleWords}
    }


    shouldShowRecipe(words) {
        if (this.showRecipe === true && (words.includes('yes') || words.includes('sure'))) {
            this.showRecipe = true
        } else {
            this.showRecipe = false
        }
    }

    spotKeywordSpecific(words, doubleWords) {
        // we change the method of spotting keywords for specific keywords since double and single keywords overlap
        let keywordsWords = []
        let keywordsSpecificSpotted = []

        for (const keyword of this.keywordList['keywordsSpecific']) {  // helps to iterate over keywords
            keywordsWords.push(keyword['keyword'])
        }
        for (let i = 1; i < words.length - 1; i++) {  // [1:length-1] to avoid going out of bounds with doubleWords
            if (keywordsWords.includes(words[i]) && !keywordsWords.includes(doubleWords[i]) && !keywordsWords.includes(doubleWords[i-1])) {  // single words
                keywordsSpecificSpotted.push(words[i]);
            }
            if (keywordsWords.includes(doubleWords[i])) {  // double words
                keywordsSpecificSpotted.push(doubleWords[i]);
            }
        }
        if (keywordsWords.includes(words[0])) {  // is first word is a keyword
            keywordsSpecificSpotted.push(words[0]);
        }
        if (keywordsWords.includes(words[words.length - 1])) {  // is last word is a keyword
            keywordsSpecificSpotted.push(words[words.length - 1]);
        }

        return keywordsSpecificSpotted
    }


    spotKeywordsCommon(words, doubleWords) {
        let generalKeywordCount = 0;  // helps find misunderstood inquires
        let keywordsCommonSpotted = [];

        for (const keyword of this.keywordList['keywordsCommon']) {
            if (words.includes(keyword['keyword'])) {
                if (!keywordsCommonSpotted.includes(keyword['keyword'])) {
                    generalKeywordCount += 1
                    keywordsCommonSpotted.push(keyword['keyword']);
                }
            }
        }
        for (const keyword of this.keywordList['keywordsCommon']) {
            if (doubleWords.includes(keyword['keyword'])) {
                if (!keywordsCommonSpotted.includes(keyword['keyword'])) {
                    generalKeywordCount += 2
                    keywordsCommonSpotted.push(keyword['keyword']);
                }
            }
        }

        return {keywordsCommonSpotted, generalKeywordCount}
    }

    spotNames(words, doubleWords) {
        let namesSpotted = []

        for (const cocktailName of this.namesList['Names']) {
            if (words.includes(cocktailName.toLowerCase())) {
                namesSpotted.push(cocktailName);
            }
            if (doubleWords.includes(cocktailName.toLowerCase())) {
                namesSpotted.push(cocktailName)
            }
        }

        return namesSpotted
    }

    spotIngredients(words, doubleWords) {
        let namesSpotted = []

        for (const ingredientName of this.namesList['Ingredients']) {
            if (words.includes(ingredientName.toLowerCase())) {
                namesSpotted.push(ingredientName);
            }
            if (doubleWords.includes(ingredientName.toLowerCase())) {
                namesSpotted.push(ingredientName)
            }
        }

        return namesSpotted
    }

    constructAnswer(keywordsCommonSpotted, keywordsSpecificSpotted, namesSpotted) {
        let answer = ''

        if (this.showRecipe === false) {
            let answerListSpecific = this.findQuestions(keywordsSpecificSpotted)
            let additionalKeywordCount = this.countAdditionalKeywords(answerListSpecific, keywordsSpecificSpotted)
            let {ambiguousAnswers, chosenIndex} = this.isQuestionAmbiguous(answerListSpecific, additionalKeywordCount)
            answer = this.printAnswer(ambiguousAnswers, namesSpotted, answerListSpecific, answer, chosenIndex)
            answer = this.addGeneralAnswers(keywordsCommonSpotted, answer)
        } else {
            let recipeQuestion = ['Give the recipe for the specified cocktail']
            answer = this.answerQuestion(recipeQuestion, namesSpotted, 0)
        }

        return answer
    }


    findQuestions(keywordsSpecificSpotted) {
        let answerListSpecific = []
        let keywordsCombinationsIndexes = Object.keys(this.keywordsCombinations)

        // defining possible questions by parsing words for keywords
        for (let i = 0; i < keywordsCombinationsIndexes.length; i++) {
            let keywordsRequired = this.keywordsCombinations[keywordsCombinationsIndexes[i]].filter(({ type }) => type === 'required')[0]['keywords']
            keywordsRequired.forEach(requiredKeyword => keywordsSpecificSpotted.includes(requiredKeyword) && answerListSpecific.push(keywordsCombinationsIndexes[i]))
        }

        return answerListSpecific
    }


    countAdditionalKeywords(answerListSpecific, keywordsSpecificSpotted) {
        let additionalKeywordCount = []

        // Counters are stored in an array as [i_1, i_2, ...], where i_1 - amount of additional keywords
        // corresponding to the question that is stored first in answerListSpecific array
        if (answerListSpecific.length > 1) {
            for (let i = 0; i < answerListSpecific.length; i++) {
                additionalKeywordCount.push(0)
            }
            for (let i = 0; i < answerListSpecific.length; i++) {
                let keywordsAdditional = this.keywordsCombinations[answerListSpecific[i]].filter(({ type }) => type === 'additional')[0]['keywords']
                keywordsAdditional.forEach(additionalKeyword => keywordsSpecificSpotted.includes(additionalKeyword) && (additionalKeywordCount[i] += 1))
            }
        }

        return additionalKeywordCount
    }


    /**
     * Checks if ambiguity in questions exists and solves it with additional keywords
     */
    isQuestionAmbiguous(answerListSpecific, additionalKeywordCount) {

        let chosenIndex = 0
        let maxVal = -1
        let ambiguousAnswers = []

        if (answerListSpecific.length > 1) {
            maxVal = additionalKeywordCount[0]
            for (let i = 0; i < additionalKeywordCount.length; i++) {
                if (additionalKeywordCount[i] === maxVal) {  // checking if equally possible questions have been found
                    ambiguousAnswers.push(answerListSpecific[i])
                }
                if (additionalKeywordCount[i] > maxVal) {  // checking if more probable answer has been found
                    maxVal = additionalKeywordCount[i]
                    chosenIndex = i
                    ambiguousAnswers = []  // clearing the answer list as more probable answer has been found
                }
            }
        }

        return {ambiguousAnswers, chosenIndex}
    }


    printAnswer(ambiguousAnswers, namesSpotted, answerListSpecific, answer, chosenIndex) {
        if (ambiguousAnswers.length > 1) {
            answer = 'Sorry, I didn\'t understand your inquiry completely.\n'
            for (let i = 0; i < ambiguousAnswers.length; i++) {
                answer += i+1 + ') ' + ambiguousAnswers[i] + '. ' + '\n'
            }
            answer += 'Please, respond with a number, containing your question, if it is present or with any other '
            answer += 'response if it is not.'
            for (const ans of ambiguousAnswers) {
                this.lastAmbiguity.push(ans)
            }
            this.lastNames = namesSpotted
        } else if (answerListSpecific.length > 0) {  // print answer in case of no ambiguity
            answer = this.answerQuestion(answerListSpecific, namesSpotted, chosenIndex)
        }

        return answer
    }


    addGeneralAnswers(keywordsCommonSpotted, answer) {
        let thanksArray = ['thank you', 'thanks', 'appreciated']
        let goodbyeArray = ['goodbye', 'good bye', 'bye', 'see you']
        let helloArray = ['hello', 'hi', 'greetings', 'hey', 'good day']
        let answerListCommon
        for (const spottedCommon of keywordsCommonSpotted) {
            for (const { keyword, responses } of this.keywordList['keywordsCommon']) {
                if (keyword === spottedCommon && (thanksArray.includes(keyword))) {
                    answerListCommon = responses;
                    answer = answerListCommon[Math.floor(Math.random() * answerListCommon.length)] + ' ' + answer;
                }
                if (keyword === spottedCommon && (goodbyeArray.includes(keyword))) {
                    answerListCommon = responses;
                    answer = answer + ' ' + answerListCommon[Math.floor(Math.random() * answerListCommon.length)];
                }
            }

        }
        for (const spottedCommon of keywordsCommonSpotted) {
            for (const { keyword, responses } of this.keywordList['keywordsCommon']) {
                if (keyword === spottedCommon && (helloArray.includes(keyword))) {
                    answerListCommon = responses;
                    answer = answerListCommon[Math.floor(Math.random() * answerListCommon.length)] + ' ' + answer;
                }
            }
        }

        return answer
    }


    answerQuestion(answerListSpecific, namesSpotted, chosenIndex) {
        let answer = ''

        let values = completeAnswer(this.namesList, this.cocktailIngredientList, this.cocktailRecipes, answerListSpecific[chosenIndex], namesSpotted)
        const returnedString = values['answer']
        const errorCode = values['error']
        this.showRecipe = values['showRecipe']

        if (errorCode === -1) {
            answer = this.keywordsCombinations[answerListSpecific[chosenIndex]][2]['keywords']
            answer += returnedString
        }
        if (errorCode === 1) {
            answer = 'Please, specify a cocktail'
        }
        if (errorCode === 2) {
            answer = 'Please, specify the ingredients'
        }
        if (errorCode === 10) {
            answer = 'No matching cocktail was found'
        }
        if (errorCode === 99) {
            answer = 'More than 1 cocktail was specified'
        }

        return answer
    }

    getAnswer(userInput) {
        let response = ''

        if (this.lastAmbiguity.length === 0) {
            const values = this.checkForKeywords(userInput.toLowerCase())  // finding all the keywords
            const {keywordsCommonSpotted, keywordsSpecificSpotted, namesSpotted, isQuestionFound} = values  // unpacking

            if (isQuestionFound === true || this.showRecipe === true) {
                response = this.constructAnswer(keywordsCommonSpotted, keywordsSpecificSpotted, namesSpotted)
            } else {
                response = 'Sorry, I didn\'t understand the question'
                response = this.addGeneralAnswers(keywordsCommonSpotted, response)
            }

        } else {
            let num = parseInt(userInput)
            if (isNaN(num) || num > this.lastAmbiguity.length || num < 1) {
                response = 'Conversation reset, please state your new question!'
                this.lastAmbiguity = []
                this.lastNames = []
                this.lastCocktail = ''
            } else {
                response = this.answerQuestion(this.lastAmbiguity, this.lastNames, num-1)
                this.lastAmbiguity = []
                this.lastNames = []
            }
        }

        this.findLastCocktail(userInput)
        this.findLastCocktail(response)

        return response
    }


    findLastCocktail(outputString) {
        const {words, doubleWords} = this.splitIntoWords(outputString)
        let names = this.spotNames(words, doubleWords)
        if (names.length !== 0) {
            this.lastCocktail = names[0]
        }
    }
}


if (require.main === module) {
    const model = new LanguageModel();

    let input = 'hi hello greetings';
    let input2 = 'sure';

    console.log(model.getAnswer(input));
    console.log(model.getAnswer(input2));
}

module.exports = LanguageModel;
// export default LanguageModel;
