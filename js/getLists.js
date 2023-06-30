const fs = require('fs');
const path = require("path");

exports.getNames = function() {
    let cocktails;
    const cocktailNames = fs.readFileSync(path.join(__dirname, 'cocktailNames.json'), 'utf8');
    cocktails = JSON.parse(cocktailNames);

    return cocktails
}

exports.getKeywords = function() {
    let keywordsWithAnswers

    const keywords = fs.readFileSync(path.join(__dirname, 'keywords.json'), 'utf8');
    keywordsWithAnswers = JSON.parse(keywords);

    return keywordsWithAnswers
}

exports.getCocktailIngredients = function() {
    let cocktailIngredients

    const ingredients = fs.readFileSync(path.join(__dirname, 'cocktailIngredients.json'), 'utf8');
    cocktailIngredients = JSON.parse(ingredients);

    return cocktailIngredients
}

exports.getCombinations = function() {
    let combinations

    const keywordCombinations = fs.readFileSync(path.join(__dirname, 'keywordCombinations.json'), 'utf8');
    combinations = JSON.parse(keywordCombinations);

    return combinations
}

exports.getRecipes = function() {
    let recipes

    const cocktailRecipes = fs.readFileSync(path.join(__dirname, 'cocktailRecipes.json'), 'utf8');
    recipes = JSON.parse(cocktailRecipes);

    return recipes
}