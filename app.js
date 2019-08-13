        // modules are important aspects of apps architecture
        // modules also keep units of code cleanly separated/organized
        // modules can encapsulate some data privately and expose other data publicly 

        // when working on this project things were seperated by 'UI MODULE' , 'DATA MODULE' and 'CONTROLLER MODULE'
        // this was done to seperate what has to be visually done vs. what has to be done behind the scenes
        // note: the controller module is the link between the other two


        // ******** BUDGET CONTROLLER ********
        var budgetController = (function () {
            //code goes in this IIFE
            var Expense = function (id, description, value) { //function constructor
                this.id = id;
                this.description = description;
                this.value = value;
                this.percentage = -1;
            };

            Expense.prototype.calcPercentage = function (totalIncome) {
                if (totalIncome > 0) {
                    this.percentage = Math.round((this.value / totalIncome) * 100);
                } else {
                    this.percentage = -1;
                }
            };

            Expense.prototype.getPercentage = function () {
                return this.percentage;
            };

            var Income = function (id, description, value) {
                this.id = id;
                this.description = description;
                this.value = value;
            };

            //var allExpenses = [];
            //var allIncomes = [];
            //var totalExpenses = 0;

            var calculateTotal = function (type) {
                var sum = 0;
                data.allItems[type].forEach(function (current) {
                    sum += current.value;
                });
                data.totals[type] = sum;
            };

            var data = {
                allItems: {
                    exp: [],
                    inc: []
                },

                totals: {
                    exp: 0,
                    inc: 0
                },

                budget: 0,
                percentage: -1
            };

            return {
                addItem: function (type, des, val) {
                    var newItem, ID;

                    // create new ID // ID = last ID + 1
                    if (data.allItems[type].length > 0) {
                        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                    } else {
                        ID = 0;
                    }


                    // create new items based on type
                    if (type === 'exp') {
                        newItem = new Expense(ID, des, val);
                    } else if (type === 'inc') {
                        newItem = new Income(ID, des, val);
                    }
                    // push it into our data structure
                    data.allItems[type].push(newItem);

                    //return the new element 
                    return newItem;


                },


                deleteItem: function (type, id) {
                    //this method is going to be called by budget controller
                    var ids, index;

                    ids = data.allItems[type].map(function (current) {
                        // map will return brand new array
                        return current.id;

                    });

                    index = ids.indexOf(id);

                    if (index !== -1) {
                        data.allItems[type].splice(index, 1);
                    }



                },

                calculateBudget: function () {
                    // calculate total income + expenses
                    calculateTotal('exp');
                    calculateTotal('inc');

                    // calculate budget: income - expenses
                    data.budget = data.totals.inc - data.totals.exp;

                    // calculate % of income that user has spent
                    // exp / incomes
                    if (data.totals.inc > 0) {
                        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                    } else {
                        data.percentage = -1; // meaning its non existant 
                    }

                },

                calculatePercentages: function () {
                    data.allItems.exp.forEach(function (cur) {
                        cur.calcPercentage(data.totals.inc);
                    });
                },


                getPercentages: function () {
                    var allPerc = data.allItems.exp.map(function (cur) {
                        return cur.getPercentage();
                        //console.log('WHYYYYYY: ' + cur.getPercentage());
                    });
                    //console.log('lalalala percents: ' + allPerc);

                    return allPerc;
                },


                getBudget: function () {
                    // this function only retrieves data
                    return {
                        budget: data.budget,
                        totalInc: data.totals.inc,
                        totalExp: data.totals.exp,
                        percentage: data.percentage
                    };
                },

                // for debugging purposes b
                testing: function () {
                    console.log(data);
                }
            };



            /*
            NOTES for this function: 
            - when you type "budgetController.x in the console undefined should be outputted because from the outside we do not have access to the inner scope > same concept applys to the add function
            - when using budgetController.publicTest(5) it works because JS runtime hits the first line, it gets executed and annonymous functions gets called > the variables and functions are then declared and finally the final function (publicTest) is returned > so after everything runs the budgeController varibale is just an object containing publicTest, because that is what you returned from the function
            //sample code:
                    //var x = 23;
                    //var add = function(a) {
                        //return x + a;
                    //}
                    //return { //closure
                        //publicTest: function(b) {
                            //return add(b);
                        //}
            */

        })();


        //these two functions are stand alone functions, so that if future revisions are made, they won't affect one another 

        // ******** UI CONTROLLER ********
        var UIController = (function () {

            //another IIFE
            var DOMstrings = {
                inputType: '.add__type',
                inputDescription: '.add__description',
                inputValue: '.add__value',
                inputBtn: '.add__btn',
                incomeContainer: '.income__list',
                expenseContainer: '.expenses__list',
                budgetLabel: '.budget__value',
                incomeLabel: '.budget__income--value',
                expensesLabel: '.budget__expenses--value',
                percentageLabel: '.budget__expenses--percentage',
                container: '.container',
                expensesPercLabel: '.item__percentage',
                dateLabel: '.budget__title--month'
            };

            var formatNumber = function (num, type) {
                var numSplit, int, dec;

                num = Math.abs(num);
                num = num.toFixed(2);

                numSplit = num.split('.');

                int = numSplit[0];

                if (int.length > 3) {
                    int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

                }


                dec = numSplit[1];


                //terary expression
                return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
            };

            var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }

            };

            return {
                getinput: function () {
                    return {
                        type: document.querySelector(DOMstrings.inputType).value,
                        description: document.querySelector(DOMstrings.inputDescription).value,
                        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                    };
                },

                addListItem: function (obj, type) {
                    var html, newHtml, element;
                    // 1. create html string with placeholder text
                    if (type === 'inc') {
                        element = DOMstrings.incomeContainer;

                        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"> <i class="ion-ios-close-outline"></i></button></div></div></div>';
                    } else if (type === 'exp') {
                        element = DOMstrings.expenseContainer;

                        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                    }

                    // 2. replace holder text with data
                    // using the replace method for this part to work
                    newHtml = html.replace('%id%', obj.id);
                    newHtml = newHtml.replace('%description%', obj.description);
                    newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

                    // 3. insert html into the DOM
                    document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


                },

                deleteListItem: function (selectorID) {
                    var el = document.getElementById(selectorID);
                    el.parentNode.removeChild(el);

                },

                clearFields: function () {
                    var fields, fieldsArr;

                    fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

                    fieldsArr = Array.prototype.slice.call(fields);

                    fieldsArr.forEach(function (current, index, array) {
                        current.value = "";
                    });

                    fieldsArr[0].focus();

                },

                displayBudget: function (obj) {
                    var type;
                    obj.budget > 0 ? type = 'inc' : type = 'exp'; // added this 08/07/2019
                    // the above will allow for you to see budget and percent 

                    document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
                    document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
                    document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

                    if (obj.percentage > 0) {
                        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                    } else {
                        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
                    }

                },

                displayPercentages: function (percentages) { // this var will be an array
                    var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


                    nodeListForEach(fields, function (current, index) {
                        // do some stuff here...
                        if (percentages[index] > 0) {
                            current.textContent = percentages[index] + '%';

                        } else {
                            current.textContent = '---';

                        }

                    });


                },

                displayMonth: function () {
                    var now, year, month, months;

                    now = new Date(); //stores the current date
                    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                    month = now.getMonth();
                    year = now.getFullYear();
                    document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;



                },

                changeType: function () {

                    var fields = document.querySelectorAll(
                        DOMstrings.inputType + ',' +
                        DOMstrings.inputDescription + ',' +
                        DOMstrings.inputValue);



                    nodeListForEach(fields, function (cur) {
                        cur.classList.toggle('red-focus');
                    });

                    document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

                },


                getDOMstrings: function () {
                    return DOMstrings; //this exposes the private DOMS strings into public
                }
            };


        })();

        // ******** GLOBAL APP CONTROLLER ********
        var controller = (function (budgetCtrl, UICtrl) {
            //in this function the other two modules are passed 
            var setupEventListeners = function () {
                var DOM = UICtrl.getDOMstrings();
                document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

                document.addEventListener('keypress', function (event) {
                    if (event.keyCode === 13 || event.which === 13) { //.which for older browsers
                        ctrlAddItem();
                    }

                });

                document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

                document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
            };



            var updateBudget = function () {
                // 1. calculate the budget 
                budgetCtrl.calculateBudget();

                // 2. return the budget
                var budget = budgetCtrl.getBudget();

                // 3. display the budget on the UI
                //console.log(budget.budget);
                UICtrl.displayBudget(budget);

            };

            var updatePercentages = function () {

                // calculate percentage
                budgetCtrl.calculatePercentages();


                // read from budget controller
                var percents = budgetCtrl.getPercentages();


                // update user interface with new percentage
                UICtrl.displayPercentages(percents);


            };


            var ctrlAddItem = function () {
                var input, newItem;

                // 1. get the input data
                input = UICtrl.getinput();

                if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
                    // 2. add item to budget controller
                    newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                    // 3. add new item to UI
                    UICtrl.addListItem(newItem, input.type);

                    // 4. clear the fields
                    UICtrl.clearFields();

                    // 5. calculate + update budget
                    updateBudget();

                    // calculate and update percentages
                    updatePercentages();
                }

            };

            var ctrlDeleteItem = function (event) {
                var itemID, splitID, type, ID;

                itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
                if (itemID) {

                    //ingredients to delete the data in your app
                    splitID = itemID.split('-');
                    type = splitID[0];
                    ID = parseInt(splitID[1]);

                    // delete item from data structure
                    budgetCtrl.deleteItem(type, ID);

                    // delete item from user interface
                    UICtrl.deleteListItem(itemID);

                    // update and show new budget 
                    updateBudget();

                    // calculate and update percentages
                    updatePercentages();

                }

            };

            return {
                init: function () {
                    console.log('Application has started.');
                    UICtrl.displayMonth();
                    UICtrl.displayBudget({
                        budget: 0,
                        totalInc: 0,
                        totalExp: 0,
                        percentage: -1
                    });
                    setupEventListeners();
                }
            };

        })(budgetController, UIController);


        // only line of code placed on the outside:
        controller.init(); // without this line of code nothing will ever happen 








        /*
        OVERALL NOTES:
        - modules can also recieve arguements because they are also just function expressions
        - to create an event listener remeber that you have to first select and elemnt as that will indicate to the console which element in the html will be changing as we listen for an event for it 
        - the document.addEventListener() ... doesn't need a query selector in the global app controller because it is just listening for the 'enter' key and not an actual element 
        */
