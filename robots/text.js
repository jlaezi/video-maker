const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetction = require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json').apikey
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
const { reject } = require('async')

const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

const state = require('./state.js')
 

async function robot() {
    const content = state.load()
    await fetchContentFromWikipedia(content)
    sanitizaContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    state.save(content)

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipidiaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipidiaResponde.get()

        content.sourceContentOriginal = wikipediaContent.content

    }

    function sanitizaContent(content) {

        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMerkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = reomoveDatesInParentheses(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitizad = withoutDatesInParentheses

        function removeBlankLinesAndMerkdown(text) {
            const allLines = text.split('\n')
            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })
            return withoutBlankLinesAndMarkdown.join(' ')
        }
    }
    function reomoveDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/ /g, ' ')
    }

    function breakContentIntoSentences(content) {
        content.sentences = []
        const sentences = sentenceBoundaryDetction.sentences(content.sourceContentSanitizad)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,

                keywords: [],

                images: []
            })
        })
    }

    function limitMaximumSentences(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content){
        for (const sentence of content.sentences) {
            sentence.keywords = await fetchWhatsonAndReturnKeywords(sentence.text)
        }
    }

    async function fetchWhatsonAndReturnKeywords(sentence) {
        return new Promise((resolve, reject) => {
    
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
    
            }, (error, response) => {
                if (error) {
                    throw error
                }
    
                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })
    
                resolve(keywords)
            })
    
        })
    
    }
    



}

module.exports = robot 