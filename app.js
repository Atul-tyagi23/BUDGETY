var budgetController = ( function () {

  var Expense = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
  };


  Expense.prototype.calcPercentage = function(totalIncome) {
      if (totalIncome > 0) {
          this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
          this.percentage = -1;
      }
  };


  Expense.prototype.getPercentage = function() {
      return this.percentage;
  };

  var Income = function (id,description,value) {
    this.id = id;
    this.description = description;
    this.value = value;

  };
 var data = {
   allItems :
    {  exp :[],
      inc : []  }, // arrays for storing these objects, our DS.

    totals :
    {  exp : 0,
      inc : 0  },

    budget: 0,
    percentage : -1

};

var calculateTotal = function (type) {
    var sum =0;
    data.allItems[type].forEach((cur) => {
      sum += cur.value;
    });
    data.totals[type] = sum;

}

 return{
   addItems: function (type, des, val) {
     var newItem, ID;

     //create new ID
     if(data.allItems[type].length>0){
     ID = data.allItems[type][data.allItems[type].length -1].id +1;
       }
       else {
         ID = 0;
       }
     // create new item based of type 'inc or 'exp'
     if(type==='exp'){
       newItem = new Expense(ID, des, val);
     }
     else if(type === 'inc'){
        newItem = new Income(ID, des, val);
     }

     // Push it into our Data Structure.
     data.allItems[type].push(newItem);
      return newItem;
   },

   deleteItem : function (type, id) {
     var ids, index;
     // id = 6
     // ids = [1 2 4 6 8]
     // index = 3
       ids = data.allItems[type].map(function(current)
     {
       return current.id;
     });
     index = ids.indexOf(id); // we have index of the data(obj) to be removed
     if(index !== -1){
       data.allItems[type].splice(index,1);
     }

   },

   calculateBudget : function(){
     // Sum of all incomes and expenses
       calculateTotal('exp');
       calculateTotal('inc');
     // Calculate budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;
     // % of INCOME  that are expenses
     if(data.totals.inc > 0){
      data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);}
      else data.percentage = -1;


   },
   getBudget : function () {
     return {
         budget : data.budget,
         totalInc : data.totals.inc,
         totalExp : data.totals.exp,
         percentage : data.percentage

     };
   },

   calculatePercentage : function(){
     data.allItems.exp.forEach((current) => {
       current.calcPercentage(data.totals.inc);
     });

   },

   getPercentage : function(){
       var allPerc = data.allItems.exp.map(function(cur){
       return cur.getPercentage();}
   );  return allPerc;
 },


     testing : function () {
      console.log(data);
   }
 };
}

)();


// UI

var UIController = ( function () {
  var formatNumber = function(num, type) {
      var numSplit, int, dec, type;
      /*
          + or - before number
          exactly 2 decimal points
          comma separating the thousands

          2310.4567 -> + 2,310.46
          2000 -> + 2,000.00
          */

      num = Math.abs(num);
      num = num.toFixed(2);

      numSplit = num.split('.');

      int = numSplit[0];
      if (int.length > 3) {
          int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
      }

      dec = numSplit[1];

      return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

  };


  return {
      getInput: function() {
          return {
              type: document.querySelector('.add__type').value, // Will be either inc or exp
              description: document.querySelector('.add__description').value,
              value: parseFloat(document.querySelector('.add__value').value) //important string to floating number by parscing
          };
      },
      addListItem : function (obj,type) {
           var html, newHTML, element;
        // Create HTML string with placeholder text
           if(type==='inc'){
             element = '.income__list';
             html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }
           else if(type === 'exp')
           {
             element = '.expenses__list';
             html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }
        //Replace placeholder with some actua data
          newHTML = html.replace('%id%',obj.id);
          newHTML = newHTML.replace('%description%',obj.description);
          newHTML = newHTML.replace('%value%',formatNumber(obj.value,type));

        //Insert HTML into DOM
        document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
      },

      deleteListItem : function(selectorID)
      {
        el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);
      },

      clearFields : function(){
        document.querySelector('.add__description').value = '';
        document.querySelector('.add__value').value = '';
        document.querySelector('.add__description').focus();
      },
      displayBudget : function (obj) {
          document.querySelector('.budget__value').textContent  = obj.budget;
          document.querySelector('.budget__income--value').textContent = obj.totalInc;
          document.querySelector('.budget__expenses--value').textContent = obj.totalExp;
           if(obj.percentage >0){
          document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + "%"  ;}
          else {
            document.querySelector('.budget__expenses--percentage').textContent  = '--'
          }

      },

      displayPercentages :function(percentage){
        var fields = document.querySelectorAll('.item__percentage');
        var arr = Array.from(fields);
         for( var i=0 ; i < arr.length ; i++ )
         {
           arr[i].textContent = percentage[i];
         }
       },

       displayDate : function () {
         var now, month, year, months;
         now = new Date();
         months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
         month = now.getMonth();
         year = now.getFullYear();

         document.querySelector('.budget__title--month').textContent = months[month] + ' ' + year;

       }


    };
  }



) ();

// connecting controller

var controller = (function (budgetCtrl,UICtrl) {

 var setupEventListeners = function   // putting all ELs together..
 () {
  document.querySelector('.add__btn').addEventListener('click',ctrlAddItem);
  document.addEventListener('keypress',function (event) {
    if(event.keycode === 13 || event.which == 13)
    {
      ctrlAddItem();
    }
   })
   document.querySelector('.container').addEventListener('click', ctrlDeleteItem);  //Event Delegation
 };

  var updateBudget = function () {


    // 5. Calculate the budget
         budgetCtrl.calculateBudget();
    //  6. return budget
         var budget = budgetCtrl.getBudget();

    // 7. Display the budget on UI
      UICtrl.displayBudget(budget);

  }

  var updatePercentages = function () {
    // 1. calculate the percentages
    budgetCtrl.calculatePercentage();

    // 2. read the percentages
     var percentages = budgetCtrl.getPercentage();


   // 3. putting them in UI
    UICtrl.displayPercentages(percentages);

  }

 var ctrlAddItem = function () {
   // 1. get field input data .
   var input = UICtrl.getInput();
  if(input.description !== '' && !isNaN(input.value))
  {// 2. Add the item to the budget
  var newItem = budgetCtrl.addItems(input.type, input.description, input.value);
   // 3 . Add the itm to the UI
   UICtrl.addListItem(newItem,input.type);
   // 4. Clear field values
   UICtrl.clearFields();

   // 5. Calculate and update Budget
   updateBudget();
   // 6. calculate the update updatePercentages
   updatePercentages();

 }
};

 var ctrlDeleteItem =  function(event) {
    var itemID,splitID,type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;  // Event Delegation and Bubbing up

     if(itemID){  splitID = itemID.split('-');  // ID = inc-1 or exp-5
                 type = splitID[0];
                 ID = parseInt(splitID[1]);

           // 1.Delete Item from data Structure
            budgetCtrl.deleteItem(type, ID);
           // 2. Delete Item from UI
            UICtrl.deleteListItem(itemID);
           // 3. Update the show the new result
           updateBudget();
           //4. update percentages
          updatePercentages();

     }

 }

return {
      init : function() {
      console.log('Application has started');
    setupEventListeners();
      UICtrl.displayBudget( {
          budget : 0,
          totalInc :0,
          totalExp :0,
          percentage : -1

      });
      UICtrl.displayDate();
  }}






}
)(budgetController, UIController);
var testing = budgetController.testing;

controller.init();
