var config = {}
config.endpoint = "wss://ef55b54e-0ee0-4-231-b9ee.gremlin.cosmos.azure.com:443/";
config.primaryKey = "yqL3xxLyZhkGsSLcgzlKzEFsgeez3VzfII3lQPn8awkbe7uBSsH7R4ByfF8fknJnbYGSyzNIq3OhfmqdBOcG8A==";
config.database = "Laboratorium7"
config.collection = "FirmaPrzewozowa"
module.exports = config;

"use strict";

const Gremlin = require('gremlin');
const prompt = require('prompt-sync')();
const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${config.database}/colls/${config.collection}`, config.primaryKey)

const client = new Gremlin.driver.Client(
    
    config.endpoint, 
    { 
        authenticator,
        traversalsource : "g",
        rejectUnauthorized : true,
        mimeType : "application/vnd.gremlin-v2.0+json"
    }

);
/**
 * dodawanie samochodów:
 * g.addV('samochod').property('id', 'renaultk').property('marka', 'Renault').property('model', 'Kangoo').property('ladownosc', '400').property('nazwa', 'RenaultKangoo')
 * g.addV('samochod').property('id', 'renaultm').property('marka', 'Renault').property('model', 'Master').property('ladownosc', '1000').property('nazwa', 'RenaultMaster')
 * g.addV('samochod').property('id', 'renaultt').property('marka', 'Renault').property('model', 'Trafic').property('ladownosc', '900').property('nazwa', 'RenaultTrafic')
 * 
 * g.addV('ladunek').property('id', 'warzywa').property('nazwa', 'Warzywa').property('waga', '200').property('wartosc', '2000')
 * g.addV('ladunek').property('id', 'maszyny').property('nazwa', 'Maszyny budowlane').property('waga', '1000').property('wartosc', '10000')
 * g.addV('ladunek').property('id', 'narzedzia').property('nazwa', 'Narzedzia ogrodnicze').property('waga', '600').property('wartosc', '5000')
 * 
 * g.V('1').addE('jedzie').to(g.V('renaultk'))
 * g.V('2').addE('jedzie').to(g.V('renaultt'))
 * g.V('3').addE('jedzie').to(g.V('renaultm'))
 * 
 * g.V('renaultk').addE('wiezie').to(g.V('warzywa'))
 * g.V('renaultt').addE('wiezie').to(g.V('narzedzia'))
 * g.V('renaultm').addE('wiezie').to(g.V('maszyny'))
 */


async function  printDriver() {
    return client.submit("g.V().hasLabel('kierowca').values('id', 'imie', 'nazwisko', 'wynagrodzenie')")
        .then(function (result) {console.log("Kierowcy: ", result ) })
}
async function printCargo() {
    return client.submit("g.V().hasLabel('ladunek').values('id', 'nazwa', 'waga', 'wartosc')")
        .then(function (result2) {console.log("Ładunki: ", result2 ) })
}
async function printCars() {
    return client.submit("g.V().hasLabel('samochod').values('id', 'marka', 'model', 'ladownosc')")
        .then(function (result2) {console.log("Samochody: ", result2 ) })
}

async function  printAll() {
    printDriver();
    printCargo();
    printCars();
}

async function addDriver () {
  console.log('Dodaj kierowcę')
  const id = prompt('ID: ')
  const imie = prompt('Imie: ')
  const nazwisko = prompt('Nazwisko: ')
  const wynagrodzenie = prompt('Wynagrodzenie: ')
  const nazwa = imie + nazwisko;
    return client.submit("g.addV('kierowca').property('id', id).property('imie', imie).property('nazwisko', nazwisko).property('wynagrodzenie', wynagrodzenie).property('nazwa', nazwa)", {
        id: id,
        imie: imie,
        nazwisko: nazwisko,
        wynagrodzenie: wynagrodzenie,
        nazwa: nazwa
    })
    .then(function (result) {
    console.log("Kierowca dodany");
    });
}

async function addCargo () {
    console.log('Dodaj ładunek')
    const id = prompt('ID: ')
    const nazwa = prompt('Nazwa: ')
    const waga = prompt('Waga: ')
    const wartosc = prompt('Wartość: ')
    const idKierowcy = prompt('Podaj ID kierowcy: ')
    const idauta = prompt('Podaj ID samochodu: ')
    const rel1 = 'jedzie';
    const rel2 = 'wiezie';

    return client.submit("g.addV('ladunek').property('id', id).property('nazwa', nazwa).property('waga', waga).property('wartosc', wartosc)", {
        id: id,
        nazwa: nazwa,
        waga: waga,
        wartosc: wartosc
    })
    .then(addRelation(id, idKierowcy, rel1))
    .then(addRelation(id, idauta, rel2))
    .then(function (result) {
    console.log("Dodano ładunek");
    });
}

function addRelation(label1, label2, rel)
  {
      return client.submit("g.V(label1).addE(rel).to(g.V(label2))", {
        label1:label1, 
        label2:label2, 
        rel: rel
          })
}
  
async function deleteDriver () {
  console.log('Usuń kierowcę')
  const id = prompt('Podaj id kierowcy: ');
  return client.submit("g.V().hasLabel('kierowca').has('id', id).drop()", {
      id: id
      })
      .then(function (result) {
          console.log("Usunięto kierowcę");
      });

}

async function updateDriver () {
  console.log('Aktualizuj dane kierowcy')
  const id = prompt('ID: ')
  const wynagrodzenie = prompt('Podaj wynagrodzenie: ');

  return client.submit("g.V().hasLabel('kierowca').has('id', id).property('wynagrodzenie', wynagrodzenie)", {
      id: id,
      wynagrodzenie: wynagrodzenie
      })
      .then(function (result) {
          console.log("Result: %s\n", JSON.stringify(result));
      });

}

function printDriverById()  {
  console.log('Wyszukaj kierowcę po ID')
  const id = prompt('ID: ')
    return client.submit("g.V().hasLabel('kierowca').has('id',id).values('id','imie','nazwisko','wynagrodzenie')", {
        id: id
    }).then(function (result) {
        console.log("Kierowca: \n", result);
    });
}

function printByCar(){
    console.log('Wyszukaj samochod po ID')
    const id = prompt('ID: ')
      return client.submit("g.V().hasLabel('samochod').has('id',id).values('marka','model','ladownosc')", {
          id: id
      }).then(function (result) {
          console.log("Samochód: \n", result);
      });
}

function printCByCargo() {
    console.log('Wyszukaj ładunek po ID')
    const id = prompt('ID: ')
      return client.submit("g.V().hasLabel('ladunek').has('id',id).values('nazwa','waga','wartosc')", {
          id: id
      }).then(function (result) {
          console.log("Ładunek: \n", result);
      });
}


  
createMenu = () => {
    console.log('Witaj w menu:');
    console.log('1. Wyswietl wszystkie rekordy');
    console.log('2. Dodaj kierowce');
    console.log('3. Dodaj ładunek');
    console.log('4. Update ');
    console.log('5. Usun ');
    console.log('6. Wypisz po ID');
    console.log('7. Wyszukaj po samochodzie');
    console.log('8. Wyszukaj po ładunku');
    console.log('9. Wyjscie');
  };

  action = (number) => {
    switch (parseInt(number)) {
      case 1:
        printAll()
        break;
      case 2:
        addDriver()
        break;
      case 3:
        addCargo()
        break;
      case 4:
        updateDriver()
        break;
      case 5:
        deleteDriver()
        break;
      case 6:
        printDriverById()
        break;
      case 7:
        printByCar()
        break; 
      case 8:
        printCByCargo()
        break;
      case 9:

        break;   
    }
  }
  createMenu();
  const number = prompt('Wybrane: ');
  action(number)