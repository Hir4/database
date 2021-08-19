var express = require('express');
var app = express();
var queryInsertClientValue;

const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(cookieParser());


const { Client } = require('pg');

///////////////////////////////////////////////////////
// CONFIG DATABASE
//////////////////////////////////////////////////////

const client = new Client({
  user: "postgres",
  password: "",
  host: "localhost",
  port: 5432,
  database: "postgres"
});

module.exports = async function (password, email, first_name, last_name, document, address, city, state, zip_code, phone_ddd, phone_number, creation_date) {
  const queryInsertClient = `
  INSERT INTO public.clients( 
    email, 
    password, 
    first_name, 
    last_name, 
    document, 
    address, 
    city, 
    state, 
    zip_code, 
    phone_ddd, 
    phone_number, 
    creation_date)
  SELECT
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
  WHERE NOT EXISTS (
  SELECT 1 FROM public.clients WHERE email = $13
  );`;

  bcrypt.hash(password, saltRounds, function cryptoPassword(err, hash) { // CRYPTOGRAPHY THE PASSWORD
    queryInsertClientValue = [`${email}`, `${hash}`, `${first_name}`, `${last_name}`, `${document}`, `${address}`, `${city}`, `${state}`, `${zip_code}`, `${phone_ddd}`, `${phone_number}`, `${creation_date}`, `${email}`];
  });

  return client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryInsertClient, queryInsertClientValue)) // SEND THE QUERY TO THE DATABASE
    .then(function InsertUser(results) {
      if (results.rowCount === 1) { // CHECK IF THE NEW USER WAS SIGNED
        return (1);
      } else {
        return (0);
      }
    })
    .catch(e => console.log(e))
    .finally(() => client.end())
};