const readline = require('readline-sync')

function start() {
    const content = {}
    content.searchTerm = askAndReturnSearchTerm() 
    content.prefix = askAndReturnPrefix()
    content.teste= 'valor da teste'
   function askAndReturnSearchTerm() { 
        return  readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The hostory of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]

       return selectedPrefixText
    }

    console.log(content)
}

start()