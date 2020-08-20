const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetction = require('sbd')

async function robot(content) {
  await fetchContentFromWikipedia(content)
    sanitizaContent(content)
    breakContentIntoSentences(content)
    
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

        function removeBlankLinesAndMerkdown(text){
            const allLines = text.split('\n')
            const withoutBlankLinesAndMarkdown= allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })
            return withoutBlankLinesAndMarkdown.join(' ')
       }
  }
 function reomoveDatesInParentheses(text) {
     return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/ /g,' ')
 }

 function breakContentIntoSentences(content) {
     content.sentences = []
     const sentences = sentenceBoundaryDetction.sentences(content.sourceContentSanitizad)
     sentences.forEach((sentence) => {
        content.sentences.push({
            text:sentence,

            keywords: [],
            
            images: []
        })
     })
 }

}

module.exports = robot 