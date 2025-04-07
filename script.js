document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        terminalText: document.getElementById('terminal-text'),
        terminalIntro: document.getElementById('terminal-intro'),
        mainContent: document.getElementById('main-content'),
        closeButton: document.querySelector('.close-button'),
        jokeButton: document.getElementById('joke-button'),
        jokeTerminal: document.getElementById('joke-terminal'),
        jokeText: document.getElementById('joke-text'),
        footer: document.querySelector('footer')
    };

    // Terminal State
    const terminalState = {
        isTyping: false,
        messageIndex: 0,
        charIndex: 0,
        countdownInterval: null,
        typingTimeout: null,
        messages: [
            "Hello there! This is Iyed!",
            "I am glad you found the time to check my website.",
            "It is my fun project, and also your peephole into my world!",
            "Press enter to continue!"
        ]
    };

    // Initialize Terminal
    elements.terminalIntro.classList.add('active');

    // Terminal Functions
    const terminal = {
        getRandomSymbol() {
            const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            return symbols[Math.floor(Math.random() * symbols.length)];
        },

        minimize() {
            if (terminalState.typingTimeout) {
                clearTimeout(terminalState.typingTimeout);
            }
            
            elements.mainContent.classList.remove('hidden');
            elements.terminalIntro.classList.add('collapse');
            setTimeout(() => {
                elements.terminalIntro.style.display = 'none';
                // Scroll to top of page
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 800);
        },

        typeWriter() {
            const { messages } = terminalState;
            
            if (terminalState.messageIndex < messages.length) {
                if (terminalState.charIndex < messages[terminalState.messageIndex].length) {
                    const tempSpan = document.createElement('span');
                    tempSpan.textContent = terminal.getRandomSymbol();
                    elements.terminalText.appendChild(tempSpan);

                    const rect = tempSpan.getBoundingClientRect();
                    const terminalRect = elements.terminalText.getBoundingClientRect();
                    const cursorLeft = rect.right - terminalRect.left;

                    const cursor = terminal.createCursor(cursorLeft, rect.top - terminalRect.top);
                    elements.terminalText.appendChild(cursor);

                    terminalState.typingTimeout = setTimeout(() => {
                        tempSpan.textContent = messages[terminalState.messageIndex].charAt(terminalState.charIndex);
                        terminalState.charIndex++;
                        cursor.remove();
                        setTimeout(terminal.typeWriter, 20);
                    }, 20);
                } else {
                    elements.terminalText.innerHTML += '<br>';
                    terminalState.messageIndex++;
                    terminalState.charIndex = 0;
                    terminalState.typingTimeout = setTimeout(terminal.typeWriter, 500);
                }
            } else {
                terminalState.isTyping = false;
                const lastLine = elements.terminalText.lastElementChild || elements.terminalText;
                const rect = lastLine.getBoundingClientRect();
                const terminalRect = elements.terminalText.getBoundingClientRect();
                const cursor = terminal.createCursor(
                    rect.right - terminalRect.left,
                    rect.top - terminalRect.top
                );
                elements.terminalText.appendChild(cursor);
            }
        },

        createCursor(left, top) {
            const cursor = document.createElement('span');
            cursor.className = 'terminal-cursor';
            cursor.style.left = left + 'px';
            cursor.style.top = top + 'px';
            return cursor;
        }
    };

    // Joke Terminal Functions
    const jokeTerminal = {
        startCountdown() {
            let timeLeft = 30;
            const countdownElement = elements.jokeTerminal.querySelector('.joke-countdown');
            
            terminalState.countdownInterval = setInterval(() => {
                countdownElement.textContent = `Terminal closing in ${timeLeft} seconds...`;
                timeLeft--;

                if (timeLeft < 0) {
                    clearInterval(terminalState.countdownInterval);
                    jokeTerminal.close();
                }
            }, 1000);
        },

        close() {
            elements.jokeTerminal.classList.add('collapse');
            
            if (terminalState.countdownInterval) {
                clearInterval(terminalState.countdownInterval);
                terminalState.countdownInterval = null;
            }

            setTimeout(() => {
                elements.jokeTerminal.classList.remove('active', 'collapse');
                elements.jokeTerminal.style.height = '0';
                elements.jokeTerminal.style.opacity = '0';
                elements.jokeText.innerHTML = '';
                elements.jokeTerminal.querySelector('.joke-countdown').textContent = '';
                elements.jokeButton.disabled = false;
                elements.jokeButton.textContent = 'GET A DAD JOKE';
                elements.footer.classList.remove('shift-down');
            }, 500);
        },

        typeJoke(joke) {
            let index = 0;
            elements.jokeText.innerHTML = '';
            
            function type() {
                if (index < joke.length) {
                    elements.jokeText.innerHTML += joke.charAt(index);
                    index++;
                    setTimeout(type, 20);
                } else {
                    // Start countdown only after joke is fully typed
                    jokeTerminal.startCountdown();
                }
            }
            
            type();
        },

        async fetchJoke() {
            const MAX_LINES = 4;
            const MAX_ATTEMPTS = 5;  // Prevent infinite loops
            let attempts = 0;

            while (attempts < MAX_ATTEMPTS) {
                try {
                    const response = await fetch('https://v2.jokeapi.dev/joke/Programming,Pun?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single');
                    const data = await response.json();
                    let joke = data.type === 'single' ? data.joke : `${data.setup}\n\n${data.delivery}`;
                    
                    // Count the number of lines when the joke is displayed at 500px width
                    const tempDiv = document.createElement('div');
                    tempDiv.style.width = '460px';  // 500px - padding
                    tempDiv.style.font = '1.1rem "Courier New"';
                    tempDiv.style.visibility = 'hidden';
                    tempDiv.style.position = 'absolute';
                    tempDiv.innerText = joke;
                    document.body.appendChild(tempDiv);
                    
                    const height = tempDiv.offsetHeight;
                    const lineHeight = parseFloat(getComputedStyle(tempDiv).lineHeight);
                    const numLines = Math.ceil(height / lineHeight);
                    
                    document.body.removeChild(tempDiv);
                    
                    if (numLines <= MAX_LINES) {
                        return joke;
                    }
                    
                    attempts++;
                } catch (error) {
                    return "Error fetching joke. Please try again later.";
                }
            }
            
            return "I know a long joke, but let me tell you a short one instead: Why do programmers prefer dark mode? Because light attracts bugs!";
        }
    };

    // Event Listeners
    elements.closeButton.addEventListener('click', terminal.minimize);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && elements.terminalIntro.classList.contains('active')) {
            terminal.minimize();
        }
    });

    elements.jokeButton.addEventListener('click', async () => {
        if (elements.jokeButton.disabled) return;
        
        if (elements.jokeButton.textContent === 'NOT FUNNY') {
            jokeTerminal.close();
            return;
        }
        
        elements.jokeButton.textContent = 'NOT FUNNY';
        elements.jokeTerminal.style.height = '200px';
        elements.jokeTerminal.style.opacity = '1';
        elements.jokeTerminal.classList.add('active');
        elements.footer.classList.add('shift-down');
        
        const joke = await jokeTerminal.fetchJoke();
        jokeTerminal.typeJoke(joke);
    });

    // Start the typing animation
    terminal.typeWriter();
}); 