const neo4j = require('neo4j-driver')
const prompt = require('prompt-sync')()
const { UnsubscriptionError } = require('rxjs')
const uri = 'neo4j://localhost:7687'
const user = 'neo4j'
const password = 'neo4j'
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session()

async function printDriver(){
    try{
        const ile = await session.run('MATCH (k:Kierowca) RETURN count(k) as count',{ })
        const ilee = ile.records[0]
        const liczba = ilee.get('count')
        const result = await session.run('MATCH (k:Kierowca) RETURN k.imie, k.nazwisko, k.wynagrodzenie',{ })

        for(i = 0; i<liczba; i++){
          const singleRecord = result.records[i]
          console.log(singleRecord.get('k.imie'), singleRecord.get('k.nazwisko'), singleRecord.get('k.wynagrodzenie'))
        }
      } finally {
      await session.close()
      }
      await driver.close()
}

async function addDriver () {
  console.log('Dodaj kierowcę')
  const id = prompt('ID: ')
  const imie = prompt('Imie: ')
  const nazwisko = prompt('Nazwisko: ')
  const wynagrodzenie = prompt('Wynagrodzenie: ')
  const nazwa = imie + nazwisko;
  try {
    const result = await session.run(
    'CREATE (driver:Kierowca {id: $id, imie: $imie, nazwisko: $nazwisko, wynagrodzenie: $wynagrodzenie, nazwa: $nazwa}) RETURN driver',
      { 
        id: id,
        nazwa: nazwa,
        imie: imie,
        nazwisko: nazwisko,
        wynagrodzenie: wynagrodzenie
        
      }
    )
    const singleRecord = result.records[0]
    const node = singleRecord.get(0)
    console.log("Dodano: id:", node.properties.id,', imię:', node.properties.imie,', nazwisko:', node.properties.nazwisko,', wynagrodzenie:', node.properties.wynagrodzenie ) 
  } finally {
  await session.close()
  }
  await driver.close()
}

async function addCargo () {
    console.log('Dodaj ładunek')
    const id = prompt('ID: ')
    const nazwa = prompt('nazwa: ')
    const waga = prompt('waga: ')
    const wartosc = prompt('wartość: ')
    const kierowca = prompt('id kierowcy: ')
    const samochod = prompt('id samochodu: ')
    try {
      const result = await session.run(
      'CREATE (cargo:ladunek {id: $id, nazwa: $nazwa, waga: $waga, wartosc: $wartosc}) RETURN cargo',
        { 
          id: id,
          nazwa: nazwa,
          waga: waga,
          wartosc: wartosc
          
        }
      )
      const singleRecord = result.records[0]
      const node = singleRecord.get(0)
      console.log("Dodano ładunek o id:", node.properties.id,', nazwa:', node.properties.nazwa,', waga:', node.properties.waga,', wartosc:', node.properties.wartosc ) 
      const result1 = await session.run(
        'MATCH (a:samochod),(b:ladunek) WHERE a.id = $car AND b.id = $cargo CREATE (a)-[r:WIEZIE]->(b) RETURN type(r)',{
            car: samochod,
            cargo: id
         }
        )
        const result2 = await session.run(
          'MATCH (a:Kierowca),(b:samochod) WHERE a.id = $driver AND b.id = $car CREATE (a)-[r:JEDZIE]->(b) RETURN type(r)',{
            driver: kierowca,
            car: samochod
           }
          )
    } finally {
    await session.close()
    }
    await driver.close()
  } 

async function deleteDriver () {
  console.log('Usuń kierowcę')
  const id = prompt('Podaj id kierowcy: ');
  const result = await session.run('MATCH (n:Kierowca { id: $id }) DETACH DELETE n',{ id: id}
    )
  console.log("Usunięto kierowcę")
  await driver.close()

}

async function updateDriver () {
  console.log('Aktualizuj dane kierowcy')
  const id = prompt('ID: ')
  const wynagrodzenie = prompt('Podaj wynagrodzenie: ');
  try {
    const result = await session.run('MATCH (n { id: $id }) SET n.wynagrodzenie = $wynagrodzenie RETURN n.wynagrodzenie',
    { 
        id: id,
        wynagrodzenie: wynagrodzenie
      }
    )

  } finally {
  await session.close()
  }
  await driver.close()
}

async function printDriverById()  {
  console.log('Wyszukaj kierowcę po ID')
  const id = prompt('ID: ')
  try{
    const result = await session.run('MATCH (k:Kierowca) WHERE k.id = $id RETURN k.id, k.imie, k.nazwisko, k.wynagrodzenie',{ id: id,})
    const singleRecord = result.records[0]
    console.log(singleRecord.get('k.id'), singleRecord.get('k.imie'), singleRecord.get('k.nazwisko'), singleRecord.get('k.wynagrodzenie'))
  } finally {
  await session.close()
  }
  await driver.close()

}

async function printByCar(){
    console.log('Wyszukaj samochod po ID')
    const id = prompt('ID: ')
    try{
      const result = await session.run('MATCH (s:samochod) WHERE s.id = $id RETURN s.id, s.marka, s.model, s.ladownosc',{ id: id,})
      const singleRecord = result.records[0]
      console.log(singleRecord.get('s.id'), singleRecord.get('s.marka'), singleRecord.get('s.model'), singleRecord.get('s.ladownosc'))
    } finally {
    await session.close()
    }
    await driver.close()
}

async function printCByCargo() {
    console.log('Wyszukaj ładunek po ID')
    const id = prompt('ID: ')
    try{
        const result = await session.run('MATCH (l:ladunek) WHERE l.id = $id RETURN l.id, l.nazwa, l.waga, l.wartosc',{ id: id,})
        const singleRecord = result.records[0]
        console.log(singleRecord.get('l.id'), singleRecord.get('l.nazwa'), singleRecord.get('l.waga'), singleRecord.get('l.wartosc'))
      } finally {
      await session.close()
      }
      await driver.close()
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
        printDriver()
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