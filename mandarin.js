const sha256 = require('sha256');
const LocalStorage = require('node-localstorage').LocalStorage;
local_storage = new LocalStorage('./scratch');
const request = require('request');

let merchant_id;
let secret;
let order_id;

function Mandarin(m_id, s, o_id = null) {
    merchant_id = m_id;
    secret = s;
    if (o_id === null) {
        order_id = local_storage.getItem("order_id");
        console.log(order_id);
        if (order_id === "undefined") {
            order_id = 1;
        }
    }
    else {
        order_id = o_id;
    }
}

function get_order_id() {
    order_id++;
    local_storage.setItem("order_id", order_id);
    return order_id;
}

Mandarin.prototype.get_auth_token = function () {
    let time = new Date().getTime();
    let req_id = time.toString() + Math.random().toString();

    let hash = sha256(merchant_id + '-' + req_id + '-' + secret);

    return merchant_id + '-' + hash + '-' + req_id;
};

Mandarin.prototype.save_card = function (email, phone) {
    let url = 'https://secure.mandarinpay.com/api/card-bindings';
    let data = {
        customerInfo: {
            email: email,
            phone: phone
        }
    };
    return post_data(url, data);
};

Mandarin.prototype.payout = function (card, amount) {
    let url = 'https://secure.mandarinpay.com/api/transactions';
    let data = {
        payment: {
            orderId: get_order_id().toString(),
            action: "payout",
            price: amount
        },
        target: {
            card: card
        },
        "customerInfo": {
            "fullName": "Vasia Pupkin"
        },
        "senderInfo": {
            "fullName": "Ivan Petrov",
            "birthDate": "1970.01.01"
        },
    };
    return post_data(url, data);
};

function post_data(url, data) {
    return new Promise(resolve => {
        let headers = {
            "Content-Type": "application/json",
            "X-Auth": Mandarin.prototype.get_auth_token()
        };
        let options = {
            method: 'POST',
            body: data,
            json: true,
            url: url,
            headers: headers
        };
        console.log(options);
        request(options, function (error, response, body) {
            console.log(response.body);
            console.log(response.statusCode);
            if (!error && response.statusCode === 200) {
                resolve(body);
            }
        });
    });
}

module.exports = Mandarin;