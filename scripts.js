const Modal = {
    open(){
        transaction = document.querySelector('.modal-overlay')
        transaction.classList.add('active')
        // This function will open the modal (adding the class "active")
        // alert('Open modal!')
    },
    close(){
        // This function will close the modal (removing the class "active")
        transaction = document.querySelector('.modal-overlay')
        transaction.classList.remove('active')
        //alert('Close modal!')
    },
    income(){
        selection = document.querySelector('.button-income')
        disable = document.querySelector('.button-expense')

        selection.classList.add('button-active')
        disable.classList.remove('button-active')
    },
    expense(){
        selection = document.querySelector('.button-expense')
        disable = document.querySelector('.button-income')

        selection.classList.add('button-active')
        disable.classList.remove('button-active')
    }

}

/*
    we need to grab this data of each transaction, and
    put into the HTML
*/

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("urbank:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("urbank:transactions", JSON.stringify(transactions))
    }
}

// Transaction 
const Transaction = {
    all: Storage.get(), 

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes() {
        let sumIncome = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                sumIncome+=transaction.amount
            }
        })

        return sumIncome
    },

    expenses() {
        let sumExpense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                sumExpense+=transaction.amount
            }
        })

        return sumExpense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

// DOM is responsable to make alterations i nthe visual HTML data
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.classList.add('items')
        tr.dataset.index = index

        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <tr class='items'>
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img id="remove-data" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remove transaction">
        </td>
        `
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100

        return value
    },

    formatDate(date) {
        const splitDate = date.split("-")
        
        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
    },
    
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")
        value = Number(value)/100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.getElementById('description'),
    amount: document.getElementById('amount'),
    date: document.getElementById('date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateField() {
        let {description, amount, date} = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error('Please, fill out the entire Form')
        }
    },
    formatValues() {
        let {description, amount, date} = Form.getValues()

        selection1 = document.querySelector('.button-expense')
        if (selection1.classList.contains('button-active')) {
            amount = "-" + amount
        }

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
        // We need to verify if all the infos were passed

        try {
            Form.validateField()
            const transaction = Form.formatValues()

            Transaction.add(transaction)

            // End add process
            Form.clearFields()
            Modal.close()
            App.reload()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init () {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()