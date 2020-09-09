global.__basepath = process.cwd();

global.app = new require("express")();
require("./lib/helpers");

/* Configurations */

app.loadConfig();


let inquirer = require('inquirer');
let PushNotification = require("./app/services/PushNotification");


const initialQuestions = [
    {
        type: 'rawlist',
        name: 'choices',
        message: "What do you want ?",
        choices: [
            {
                name: 'Send push on iPhone',
                value: 1
            },
            {
                name: 'Send push on Android',
                value: 2
            },
            new inquirer.Separator(),
            {
                name: 'Add payment',
                value: 3
            },
            {
                name: 'Add Lang',
                value: 4
            }
        ]
    }
    /*,
    {
        type: 'input',
        name: 'last_name',
        message: "What's your last name",
        default: function() {
            return 'Doe';
        }
    },
    {
        type: 'input',
        name: 'phone',
        message: "What's your phone number",
        validate: function(value) {
            let pass = value.match(
                /^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i
            );
            if (pass) {
                return true;
            }

            return 'Please enter a valid phone number';
        }
    }*/
];


function initial(){
    inquirer.prompt(initialQuestions).then(answers => {
        const choices =  answers.choices;
        console.log("answers : "+answers);
       // console.log(choices);

        switch (choices) {
            case 1 :
                askPushIOS();
                break;
            case 2 :
                askPushAndroid();
                break;
            case 3 :
                addpayment();
                break;
            default :
                initial();
                break;
        }


    });
}


const pushiOSQuestions = [
    {
        type: 'input',
        name: 'data',
        message: "Please Write your iPhone token",
        validate: function(value) {

            if (value.length>3) {
                return true;
            }

            return 'Please enter a valid iPhone token';
        }

    }

];

function askPushIOS(){
    inquirer.prompt(pushiOSQuestions).then(answers => {
        const push =  answers.data;
        console.log("answers : "+push);

        PushNotification.sendios(push,"Hey","Testing 123");

        initial();

    });
}

function askPushAndroid(){
    inquirer.prompt(pushiOSQuestions).then(answers => {
        const push =  answers.data;
        console.log("answers : "+push);

        PushNotification.sendandroid( push,"Hey","from","full name","msgid","Testing 123");

        initial();

    });
}

const paymentQuestions = [
    {
        type: 'input',
        name: 'data',
        message: "Please Write your credit for payment"

    }

];

function addpayment(){
    inquirer.prompt(paymentQuestions).then(answers => {
        const data =  answers.data;
        console.log("answers : "+data);

        let p = new Payment();
        p.teacher = "5c29333c8f46ee10af7c70dc";
        p.language = "5c29333c8f46ee10af7c70dc";
        p.student = "5c29333c8f46ee10af7c70dc";
        p.credit = data;
        p.save();

        initial();

    });
}



initial();
