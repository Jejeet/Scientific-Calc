// Calculator state object
const calculatorState = {
    display: null,
    history: null,
    currentExpression: '',
    lastResult: '0',
    shouldClearDisplay: false
};

// Initialize calculator
function initializeCalculator() {
    calculatorState.display = document.getElementById('display');
    calculatorState.history = document.getElementById('history');
    
    setupEventListeners();
    updateDisplay('0');
}

// Event listeners setup
function setupEventListeners() {
    // Number buttons
    document.querySelectorAll('.number').forEach(button => {
        button.addEventListener('click', () => {
            inputNumber(button.dataset.number);
        });
    });

    // Operator buttons
    document.querySelectorAll('.operator').forEach(button => {
        button.addEventListener('click', () => {
            inputOperator(button.dataset.operator);
        });
    });

    // Function buttons
    document.querySelectorAll('.function').forEach(button => {
        button.addEventListener('click', () => {
            executeFunction(button.dataset.function);
        });
    });

    // Special buttons
    document.getElementById('equals').addEventListener('click', () => calculate());
    document.getElementById('clear').addEventListener('click', () => clear());
    document.getElementById('delete').addEventListener('click', () => deleteChar());
    document.getElementById('decimal').addEventListener('click', () => inputDecimal());

    // Keyboard support
    document.addEventListener('keydown', (e) => handleKeypress(e));
}

// Number input function
function inputNumber(num) {
    if (calculatorState.shouldClearDisplay) {
        calculatorState.currentExpression = '';
        calculatorState.shouldClearDisplay = false;
    }
    
    if (calculatorState.currentExpression === '0') {
        calculatorState.currentExpression = num;
    } else {
        calculatorState.currentExpression += num;
    }
    
    updateDisplay(calculatorState.currentExpression);
}

// Operator input function
function inputOperator(operator) {
    if (calculatorState.shouldClearDisplay) {
        calculatorState.currentExpression = calculatorState.lastResult;
        calculatorState.shouldClearDisplay = false;
    }
    
    if (calculatorState.currentExpression === '') {
        calculatorState.currentExpression = calculatorState.lastResult;
    }
    
    // Prevent multiple consecutive operators
    const lastChar = calculatorState.currentExpression.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
        calculatorState.currentExpression = calculatorState.currentExpression.slice(0, -1);
    }
    
    calculatorState.currentExpression += ` ${operator} `;
    updateDisplay(calculatorState.currentExpression);
    updateHistory(calculatorState.currentExpression);
}

// Decimal input function
function inputDecimal() {
    if (calculatorState.shouldClearDisplay) {
        calculatorState.currentExpression = '';
        calculatorState.shouldClearDisplay = false;
    }
    
    const parts = calculatorState.currentExpression.split(/[\+\-\*\/]/);
    const currentNumber = parts[parts.length - 1].trim();
    
    if (!currentNumber.includes('.')) {
        if (calculatorState.currentExpression === '' || calculatorState.currentExpression === '0') {
            calculatorState.currentExpression = '0.';
        } else if (['+', '-', '*', '/'].includes(calculatorState.currentExpression.slice(-1).trim())) {
            calculatorState.currentExpression += '0.';
        } else {
            calculatorState.currentExpression += '.';
        }
    }
    
    updateDisplay(calculatorState.currentExpression);
}

// Calculate function
function calculate() {
    if (calculatorState.currentExpression === '') {
        return;
    }
    
    try {
        let expression = calculatorState.currentExpression;
        
        // Handle division by zero
        expression = expression.replace(/\/\s*0(?!\d)/g, '/ 0');
        
        let result = evaluateExpression(expression);
        
        if (!isFinite(result) || isNaN(result)) {
            result = 0;
        }
        
        calculatorState.lastResult = formatResult(result);
        updateDisplay(calculatorState.lastResult);
        updateHistory(`${calculatorState.currentExpression} =`);
        calculatorState.shouldClearDisplay = true;
        
    } catch (error) {
        updateDisplay('Error');
        calculatorState.shouldClearDisplay = true;
    }
}

// Expression evaluation function
function evaluateExpression(expression) {
    const tokens = expression.split(' ').filter(token => token !== '');
    
    if (tokens.length === 1) {
        return parseFloat(tokens[0]) || 0;
    }
    
    let result = parseFloat(tokens[0]) || 0;
    
    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const operand = parseFloat(tokens[i + 1]) || 0;
        
        switch (operator) {
            case '+':
                result += operand;
                break;
            case '-':
                result -= operand;
                break;
            case '*':
                result *= operand;
                break;
            case '/':
                result = operand === 0 ? 0 : result / operand;
                break;
            default:
                break;
        }
    }
    
    return result;
}

// Function execution
function executeFunction(func) {
    let value;
    
    if (calculatorState.shouldClearDisplay || calculatorState.currentExpression === '') {
        value = parseFloat(calculatorState.lastResult) || 0;
    } else {
        const parts = calculatorState.currentExpression.split(/[\+\-\*\/]/);
        const lastPart = parts[parts.length - 1].trim();
        value = parseFloat(lastPart) || 0;
    }
    
    let result;

    try {
        switch (func) {
            case 'sin':
                result = Math.sin(toRadians(value));
                break;
            case 'cos':
                result = Math.cos(toRadians(value));
                break;
            case 'tan':
                result = Math.tan(toRadians(value));
                break;
            case 'log':
                result = value > 0 ? Math.log10(value) : 0;
                break;
            case 'ln':
                result = value > 0 ? Math.log(value) : 0;
                break;
            case 'sqrt':
                result = value >= 0 ? Math.sqrt(value) : 0;
                break;
            case 'pow':
                result = Math.pow(value, 2);
                break;
            case 'factorial':
                result = factorial(Math.floor(value));
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            case 'percent':
                result = value / 100;
                break;
            case 'inverse':
                result = value !== 0 ? 1 / value : 0;
                break;
            case 'abs':
                result = Math.abs(value);
                break;
            case 'negate':
                result = -value;
                break;
            case 'exp':
                result = Math.exp(value);
                break;
            default:
                return;
        }

        if (isNaN(result) || !isFinite(result)) {
            result = 0;
        }

        const formattedResult = formatResult(result);
        calculatorState.currentExpression = formattedResult;
        calculatorState.lastResult = formattedResult;
        updateDisplay(formattedResult);
        calculatorState.shouldClearDisplay = true;
        
    } catch (error) {
        updateDisplay('Error');
        calculatorState.shouldClearDisplay = true;
    }
}

// Helper functions
function factorial(n) {
    if (n < 0 || n > 170) return 0;
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function formatResult(result) {
    if (Number.isInteger(result) && result.toString().length <= 10) {
        return result.toString();
    }
    return parseFloat(result.toFixed(10)).toString();
}

// Control functions
function clear() {
    calculatorState.currentExpression = '';
    calculatorState.lastResult = '0';
    calculatorState.shouldClearDisplay = false;
    updateDisplay('0');
    clearHistory();
}

function deleteChar() {
    if (calculatorState.shouldClearDisplay) {
        clear();
        return;
    }
    
    if (calculatorState.currentExpression.length > 0) {
        if (calculatorState.currentExpression.endsWith(' ')) {
            calculatorState.currentExpression = calculatorState.currentExpression.trim();
            if (['+', '-', '*', '/'].includes(calculatorState.currentExpression.slice(-1))) {
                calculatorState.currentExpression = calculatorState.currentExpression.slice(0, -1).trim();
            }
        } else {
            calculatorState.currentExpression = calculatorState.currentExpression.slice(0, -1);
        }
    }
    
    const displayValue = calculatorState.currentExpression === '' ? '0' : calculatorState.currentExpression;
    updateDisplay(displayValue);
}

// Display functions
function updateDisplay(value) {
    calculatorState.display.textContent = value;
}

function updateHistory(value) {
    calculatorState.history.textContent = value;
}

function clearHistory() {
    calculatorState.history.textContent = '';
}

// Keyboard handling
function handleKeypress(e) {
    const key = e.key;
    
    if (key >= '0' && key <= '9') {
        inputNumber(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
        inputOperator(key);
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
    } else if (key === 'Backspace') {
        deleteChar();
    } else if (key === '.') {
        inputDecimal();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCalculator();
});




// class ScientificCalculator {
//     constructor() {
//         this.display = document.getElementById('display');
//         this.history = document.getElementById('history');
//         this.currentExpression = '';
//         this.lastResult = '0';
//         this.shouldClearDisplay = false;
        
//         this.initializeEventListeners();
//         this.updateDisplay('0');
//     }

//     initializeEventListeners() {
//         // Number buttons
//         document.querySelectorAll('.number').forEach(button => {
//             button.addEventListener('click', () => {
//                 this.inputNumber(button.dataset.number);
//             });
//         });

//         // Operator buttons
//         document.querySelectorAll('.operator').forEach(button => {
//             button.addEventListener('click', () => {
//                 this.inputOperator(button.dataset.operator);
//             });
//         });

//         // Function buttons
//         document.querySelectorAll('.function').forEach(button => {
//             button.addEventListener('click', () => {
//                 this.executeFunction(button.dataset.function);
//             });
//         });

//         // Special buttons
//         document.getElementById('equals').addEventListener('click', () => this.calculate());
//         document.getElementById('clear').addEventListener('click', () => this.clear());
//         document.getElementById('delete').addEventListener('click', () => this.delete());
//         document.getElementById('decimal').addEventListener('click', () => this.inputDecimal());

//         // Keyboard support
//         document.addEventListener('keydown', (e) => this.handleKeypress(e));
//     }

//     inputNumber(num) {
//         if (this.shouldClearDisplay) {
//             this.currentExpression = '';
//             this.shouldClearDisplay = false;
//         }
        
//         if (this.currentExpression === '0') {
//             this.currentExpression = num;
//         } else {
//             this.currentExpression += num;
//         }
        
//         this.updateDisplay(this.currentExpression);
//     }

//     inputOperator(operator) {
//         if (this.shouldClearDisplay) {
//             this.currentExpression = this.lastResult;
//             this.shouldClearDisplay = false;
//         }
        
//         if (this.currentExpression === '') {
//             this.currentExpression = this.lastResult;
//         }
        
//         // Prevent multiple consecutive operators
//         const lastChar = this.currentExpression.slice(-1);
//         if (['+', '-', '*', '/'].includes(lastChar)) {
//             this.currentExpression = this.currentExpression.slice(0, -1);
//         }
        
//         this.currentExpression += ` ${operator} `;
//         this.updateDisplay(this.currentExpression);
//         this.updateHistory(this.currentExpression);
//     }

//     inputDecimal() {
//         if (this.shouldClearDisplay) {
//             this.currentExpression = '';
//             this.shouldClearDisplay = false;
//         }
        
//         // Get the current number being typed
//         const parts = this.currentExpression.split(/[\+\-\*\/]/);
//         const currentNumber = parts[parts.length - 1].trim();
        
//         // Only add decimal if current number doesn't already have one
//         if (!currentNumber.includes('.')) {
//             if (this.currentExpression === '' || this.currentExpression === '0') {
//                 this.currentExpression = '0.';
//             } else if (['+', '-', '*', '/'].includes(this.currentExpression.slice(-1).trim())) {
//                 this.currentExpression += '0.';
//             } else {
//                 this.currentExpression += '.';
//             }
//         }
        
//         this.updateDisplay(this.currentExpression);
//     }

//     calculate() {
//         if (this.currentExpression === '') {
//             return;
//         }
        
//         try {
//             let expression = this.currentExpression;
            
//             // Handle division by zero - replace any division by zero with division by 1 (result will be 0)
//             expression = expression.replace(/\/\s*0(?!\d)/g, '/ 0');
            
//             // Evaluate the expression safely
//             let result = this.evaluateExpression(expression);
            
//             // Handle division by zero case
//             if (!isFinite(result) || isNaN(result)) {
//                 result = 0;
//             }
            
//             this.lastResult = this.formatResult(result);
//             this.updateDisplay(this.lastResult);
//             this.updateHistory(`${this.currentExpression} =`);
//             this.shouldClearDisplay = true;
            
//         } catch (error) {
//             this.updateDisplay('Error');
//             this.shouldClearDisplay = true;
//         }
//     }

//     evaluateExpression(expression) {
//         // Simple safe evaluation for basic arithmetic
//         // Replace operators and evaluate step by step to handle division by zero
//         const tokens = expression.split(' ').filter(token => token !== '');
        
//         if (tokens.length === 1) {
//             return parseFloat(tokens[0]) || 0;
//         }
        
//         // Convert to postfix notation and evaluate
//         let result = parseFloat(tokens[0]) || 0;
        
//         for (let i = 1; i < tokens.length; i += 2) {
//             const operator = tokens[i];
//             const operand = parseFloat(tokens[i + 1]) || 0;
            
//             switch (operator) {
//                 case '+':
//                     result += operand;
//                     break;
//                 case '-':
//                     result -= operand;
//                     break;
//                 case '*':
//                     result *= operand;
//                     break;
//                 case '/':
//                     result = operand === 0 ? 0 : result / operand;
//                     break;
//                 default:
//                     break;
//             }
//         }
        
//         return result;
//     }

//     executeFunction(func) {
//         let value;
        
//         if (this.shouldClearDisplay || this.currentExpression === '') {
//             value = parseFloat(this.lastResult) || 0;
//         } else {
//             // Get the last number in the expression
//             const parts = this.currentExpression.split(/[\+\-\*\/]/);
//             const lastPart = parts[parts.length - 1].trim();
//             value = parseFloat(lastPart) || 0;
//         }
        
//         let result;

//         try {
//             switch (func) {
//                 case 'sin':
//                     result = Math.sin(this.toRadians(value));
//                     break;
//                 case 'cos':
//                     result = Math.cos(this.toRadians(value));
//                     break;
//                 case 'tan':
//                     result = Math.tan(this.toRadians(value));
//                     break;
//                 case 'log':
//                     result = value > 0 ? Math.log10(value) : 0;
//                     break;
//                 case 'ln':
//                     result = value > 0 ? Math.log(value) : 0;
//                     break;
//                 case 'sqrt':
//                     result = value >= 0 ? Math.sqrt(value) : 0;
//                     break;
//                 case 'pow':
//                     result = Math.pow(value, 2);
//                     break;
//                 case 'factorial':
//                     result = this.factorial(Math.floor(value));
//                     break;
//                 case 'pi':
//                     result = Math.PI;
//                     break;
//                 case 'e':
//                     result = Math.E;
//                     break;
//                 case 'percent':
//                     result = value / 100;
//                     break;
//                 case 'inverse':
//                     result = value !== 0 ? 1 / value : 0;
//                     break;
//                 case 'abs':
//                     result = Math.abs(value);
//                     break;
//                 case 'negate':
//                     result = -value;
//                     break;
//                 case 'exp':
//                     result = Math.exp(value);
//                     break;
//                 default:
//                     return;
//             }

//             if (isNaN(result) || !isFinite(result)) {
//                 result = 0;
//             }

//             const formattedResult = this.formatResult(result);
//             this.currentExpression = formattedResult;
//             this.lastResult = formattedResult;
//             this.updateDisplay(formattedResult);
//             this.shouldClearDisplay = true;
            
//         } catch (error) {
//             this.updateDisplay('Error');
//             this.shouldClearDisplay = true;
//         }
//     }

//     factorial(n) {
//         if (n < 0 || n > 170) return 0;
//         if (n <= 1) return 1;
//         let result = 1;
//         for (let i = 2; i <= n; i++) {
//             result *= i;
//         }
//         return result;
//     }

//     toRadians(degrees) {
//         return degrees * (Math.PI / 180);
//     }

//     formatResult(result) {
//         if (Number.isInteger(result) && result.toString().length <= 10) {
//             return result.toString();
//         }
//         return parseFloat(result.toFixed(10)).toString();
//     }

//     clear() {
//         this.currentExpression = '';
//         this.lastResult = '0';
//         this.shouldClearDisplay = false;
//         this.updateDisplay('0');
//         this.clearHistory();
//     }

//     delete() {
//         if (this.shouldClearDisplay) {
//             this.clear();
//             return;
//         }
        
//         if (this.currentExpression.length > 0) {
//             // Remove the last character, but handle operators with spaces
//             if (this.currentExpression.endsWith(' ')) {
//                 // Remove operator and surrounding spaces
//                 this.currentExpression = this.currentExpression.trim();
//                 if (['+', '-', '*', '/'].includes(this.currentExpression.slice(-1))) {
//                     this.currentExpression = this.currentExpression.slice(0, -1).trim();
//                 }
//             } else {
//                 this.currentExpression = this.currentExpression.slice(0, -1);
//             }
//         }
        
//         const displayValue = this.currentExpression === '' ? '0' : this.currentExpression;
//         this.updateDisplay(displayValue);
//     }

//     updateDisplay(value) {
//         this.display.textContent = value;
//     }

//     updateHistory(value) {
//         this.history.textContent = value;
//     }

//     clearHistory() {
//         this.history.textContent = '';
//     }

//     handleKeypress(e) {
//         const key = e.key;
        
//         if (key >= '0' && key <= '9') {
//             this.inputNumber(key);
//         } else if (['+', '-', '*', '/'].includes(key)) {
//             this.inputOperator(key);
//         } else if (key === 'Enter' || key === '=') {
//             e.preventDefault();
//             this.calculate();
//         } else if (key === 'Escape' || key === 'c' || key === 'C') {
//             this.clear();
//         } else if (key === 'Backspace') {
//             this.delete();
//         } else if (key === '.') {
//             this.inputDecimal();
//         }
//     }
// }

// // Initialize calculator when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     new ScientificCalculator();
// });



// class ScientificCalculator {
//     constructor() {
//         this.display = document.getElementById('display');
//         this.history = document.getElementById('history');
//         this.currentInput = '0';
//         this.previousInput = '';
//         this.operator = null;
//         this.waitingForOperand = false;
//         this.shouldResetDisplay = false;
        
//         this.initializeEventListeners();
//     }

//     initializeEventListeners() {
//         // Number buttons
//         document.querySelectorAll('.number').forEach(button => {
//             button.addEventListener('click', () => {
//                 this.inputNumber(button.dataset.number);
//             });
//         });

//         // Operator buttons
//         document.querySelectorAll('.operator').forEach(button => {
//             button.addEventListener('click', () => {
//                 this.inputOperator(button.dataset.operator);
//             });
//         });

//         // Function buttons
//         document.querySelectorAll('.function').forEach(button => {
//             button.addEventListener('click', () => {
//                 this.executeFunction(button.dataset.function);
//             });
//         });

//         // Special buttons
//         document.getElementById('equals').addEventListener('click', () => this.calculate());
//         document.getElementById('clear').addEventListener('click', () => this.clear());
//         document.getElementById('delete').addEventListener('click', () => this.delete());
//         document.getElementById('decimal').addEventListener('click', () => this.inputDecimal());

//         // Keyboard support
//         document.addEventListener('keydown', (e) => this.handleKeypress(e));
//     }

//     inputNumber(num) {
//         if (this.waitingForOperand || this.shouldResetDisplay) {
//             this.currentInput = num;
//             this.waitingForOperand = false;
//             this.shouldResetDisplay = false;
//         } else {
//             this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
//         }
//         this.updateDisplay();
//     }

//     inputOperator(nextOperator) {
//         const inputValue = parseFloat(this.currentInput);

//         if (this.previousInput === '') {
//             this.previousInput = inputValue;
//         } else if (this.operator) {
//             const currentValue = this.previousInput || 0;
//             const newValue = this.performCalculation(this.operator, currentValue, inputValue);

//             this.currentInput = String(newValue);
//             this.previousInput = newValue;
//             this.updateDisplay();
//         }

//         this.waitingForOperand = true;
//         this.operator = nextOperator;
//         this.updateHistory();
//     }

//     calculate() {
//         if (this.operator && this.previousInput !== '') {
//             const prev = parseFloat(this.previousInput);
//             const current = parseFloat(this.currentInput);
//             const result = this.performCalculation(this.operator, prev, current);
            
//             this.currentInput = String(result);
//             this.previousInput = '';
//             this.operator = null;
//             this.waitingForOperand = false;
//             this.shouldResetDisplay = true;
//             this.updateDisplay();
//             this.clearHistory();
//         }
//     }

//     performCalculation(operator, a, b) {
//         switch (operator) {
//             case '+': return a + b;
//             case '-': return a - b;
//             case '*': return a * b;
//             case '/': return b !== 0 ? a / b : 0;
//             default: return b;
//         }
//     }

//     executeFunction(func) {
//         const value = parseFloat(this.currentInput);
//         let result;

//         try {
//             switch (func) {
//                 case 'sin':
//                     result = Math.sin(this.toRadians(value));
//                     break;
//                 case 'cos':
//                     result = Math.cos(this.toRadians(value));
//                     break;
//                 case 'tan':
//                     result = Math.tan(this.toRadians(value));
//                     break;
//                 case 'log':
//                     result = Math.log10(value);
//                     break;
//                 case 'ln':
//                     result = Math.log(value);
//                     break;
//                 case 'sqrt':
//                     result = Math.sqrt(value);
//                     break;
//                 case 'pow':
//                     result = Math.pow(value, 2);
//                     break;
//                 case 'factorial':
//                     result = this.factorial(Math.floor(value));
//                     break;
//                 case 'pi':
//                     result = Math.PI;
//                     break;
//                 case 'e':
//                     result = Math.E;
//                     break;
//                 case 'percent':
//                     result = value / 100;
//                     break;
//                 case 'inverse':
//                     result = value !== 0 ? 1 / value : 0;
//                     break;
//                 case 'abs':
//                     result = Math.abs(value);
//                     break;
//                 case 'negate':
//                     result = -value;
//                     break;
//                 case 'exp':
//                     result = Math.exp(value);
//                     break;
//                 default:
//                     return;
//             }

//             if (isNaN(result) || !isFinite(result)) {
//                 throw new Error('Invalid calculation');
//             }

//             this.currentInput = this.formatResult(result);
//             this.shouldResetDisplay = true;
//             this.updateDisplay();
//         } catch (error) {
//             this.currentInput = 'Error';
//             this.updateDisplay();
//         }
//     }

//     factorial(n) {
//         if (n < 0 || n > 170) throw new Error('Invalid input for factorial');
//         if (n <= 1) return 1;
//         let result = 1;
//         for (let i = 2; i <= n; i++) {
//             result *= i;
//         }
//         return result;
//     }

//     toRadians(degrees) {
//         return degrees * (Math.PI / 180);
//     }

//     formatResult(result) {
//         if (Number.isInteger(result)) {
//             return result.toString();
//         }
//         return parseFloat(result.toFixed(10)).toString();
//     }

//     inputDecimal() {
//         if (this.waitingForOperand || this.shouldResetDisplay) {
//             this.currentInput = '0.';
//             this.waitingForOperand = false;
//             this.shouldResetDisplay = false;
//         } else if (this.currentInput.indexOf('.') === -1) {
//             this.currentInput += '.';
//         }
//         this.updateDisplay();
//     }

//     clear() {
//         this.currentInput = '0';
//         this.previousInput = '';
//         this.operator = null;
//         this.waitingForOperand = false;
//         this.shouldResetDisplay = false;
//         this.updateDisplay();
//         this.clearHistory();
//     }

//     delete() {
//         if (this.currentInput.length > 1) {
//             this.currentInput = this.currentInput.slice(0, -1);
//         } else {
//             this.currentInput = '0';
//         }
//         this.updateDisplay();
//     }

//     updateDisplay() {
//         this.display.textContent = this.currentInput;
//     }

//     updateHistory() {
//         if (this.operator && this.previousInput !== '') {
//             this.history.textContent = `${this.previousInput} ${this.operator}`;
//         }
//     }

//     clearHistory() {
//         this.history.textContent = '';
//     }

//     handleKeypress(e) {
//         const key = e.key;
        
//         if (key >= '0' && key <= '9') {
//             this.inputNumber(key);
//         } else if (['+', '-', '*', '/'].includes(key)) {
//             this.inputOperator(key === '*' ? '*' : key);
//         } else if (key === 'Enter' || key === '=') {
//             this.calculate();
//         } else if (key === 'Escape' || key === 'c' || key === 'C') {
//             this.clear();
//         } else if (key === 'Backspace') {
//             this.delete();
//         } else if (key === '.') {
//             this.inputDecimal();
//         }
//     }
// }

// // Initialize calculator when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     new ScientificCalculator();
// });
